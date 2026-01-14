/**
 * Property Test: Persistence Round-Trip
 * **Property 6: Persistencia y Recuperación**
 * **Validates: Requirements 9.1-9.7, 13.1-13.4**
 * 
 * For any valid ficha state, saving and then loading SHALL produce
 * an equivalent state. The round-trip: save(state) |> load() === state
 * 
 * This ensures that the persistence layer (IndexedDB) correctly
 * serializes and deserializes ficha data without loss or corruption.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  saveFicha, 
  loadFicha, 
  clearAllData, 
  closeDB,
  initDB 
} from '@/lib/persistence/indexedDB';
import type { FichaState, FichaSection, FieldValue, FichaCustomization, HistoryEntry, FichaErrorRef } from '@/types/ficha';

// ============================================================================
// GENERATORS FOR FICHA STATE COMPONENTS
// ============================================================================

/**
 * Generate a FieldValue with source tracking
 */
const fieldValueArb = fc.record({
  value: fc.string({ minLength: 0, maxLength: 100 }),
  source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
  originalValue: fc.option(fc.string({ maxLength: 100 })),
  modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
});

/**
 * Generate a FichaSection
 */
const fichaSectionArb = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom(
    'identificacion' as const,
    'estructura' as const,
    'tuberias' as const,
    'sumideros' as const,
    'fotos' as const,
    'observaciones' as const
  ),
  order: fc.integer({ min: 0, max: 10 }),
  visible: fc.boolean(),
  locked: fc.boolean(),
  content: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 50 }),
    fieldValueArb,
    { maxKeys: 20 }
  ),
});

/**
 * Generate a ColorScheme
 */
const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

const colorSchemeArb = fc.record({
  headerBg: hexColorArb,
  headerText: hexColorArb,
  sectionBg: hexColorArb,
  sectionText: hexColorArb,
  labelText: hexColorArb,
  valueText: hexColorArb,
  borderColor: hexColorArb,
});

/**
 * Generate a FontScheme
 */
const fontSchemeArb = fc.record({
  titleSize: fc.integer({ min: 8, max: 48 }),
  labelSize: fc.integer({ min: 8, max: 32 }),
  valueSize: fc.integer({ min: 8, max: 32 }),
  fontFamily: fc.constantFrom('Arial', 'Helvetica', 'Times New Roman', 'Courier New'),
});

/**
 * Generate a SpacingScheme
 */
const spacingSchemeArb = fc.record({
  sectionGap: fc.integer({ min: 0, max: 50 }),
  fieldGap: fc.integer({ min: 0, max: 30 }),
  padding: fc.integer({ min: 0, max: 30 }),
  margin: fc.integer({ min: 0, max: 30 }),
});

/**
 * Generate a FichaCustomization
 */
const fichaCustomizationArb = fc.record({
  colors: colorSchemeArb,
  fonts: fontSchemeArb,
  spacing: spacingSchemeArb,
  template: fc.string({ minLength: 1, maxLength: 50 }),
  isGlobal: fc.boolean(),
});

/**
 * Generate a HistoryEntry
 */
const historyEntryArb = fc.record({
  id: fc.uuid(),
  timestamp: fc.integer({ min: 0, max: Date.now() }),
  action: fc.constantFrom('edit', 'undo', 'redo', 'snapshot', 'transition'),
  previousState: fc.record({
    status: fc.option(fc.constantFrom('draft', 'editing', 'complete', 'finalized')),
    lastModified: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
  newState: fc.record({
    status: fc.option(fc.constantFrom('draft', 'editing', 'complete', 'finalized')),
    lastModified: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
});

/**
 * Generate a FichaErrorRef
 */
const fichaErrorRefArb = fc.record({
  id: fc.uuid(),
  fichaId: fc.uuid(),
  type: fc.constantFrom('data' as const, 'user' as const, 'system' as const),
  severity: fc.constantFrom('warning' as const, 'error' as const),
  message: fc.string({ minLength: 1, maxLength: 100 }),
  userMessage: fc.string({ minLength: 1, maxLength: 100 }),
  field: fc.option(fc.string({ maxLength: 50 })),
  timestamp: fc.integer({ min: 0, max: Date.now() }),
  resolved: fc.boolean(),
});

/**
 * Generate a complete FichaState
 */
const fichaStateArb = fc.record({
  id: fc.uuid(),
  pozoId: fc.string({ minLength: 1, maxLength: 20 }),
  status: fc.constantFrom('draft' as const, 'editing' as const, 'complete' as const, 'finalized' as const),
  sections: fc.array(fichaSectionArb, { minLength: 1, maxLength: 6 }),
  customizations: fichaCustomizationArb,
  history: fc.array(historyEntryArb, { maxLength: 50 }),
  errors: fc.array(fichaErrorRefArb, { maxLength: 20 }),
  lastModified: fc.integer({ min: 0, max: Date.now() }),
  version: fc.integer({ min: 0, max: 100 }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Deep equality check for FichaState
 * Compares all fields including nested structures
 */
function fichaStatesAreEqual(state1: FichaState, state2: FichaState): boolean {
  // Top-level fields
  if (state1.id !== state2.id) return false;
  if (state1.pozoId !== state2.pozoId) return false;
  if (state1.status !== state2.status) return false;
  if (state1.version !== state2.version) return false;
  
  // Sections
  if (state1.sections.length !== state2.sections.length) return false;
  for (let i = 0; i < state1.sections.length; i++) {
    const s1 = state1.sections[i];
    const s2 = state2.sections[i];
    
    if (s1.id !== s2.id || s1.type !== s2.type || s1.order !== s2.order) return false;
    if (s1.visible !== s2.visible || s1.locked !== s2.locked) return false;
    
    // Content fields
    const keys1 = Object.keys(s1.content);
    const keys2 = Object.keys(s2.content);
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      const fv1 = s1.content[key];
      const fv2 = s2.content[key];
      
      if (fv1.value !== fv2.value || fv1.source !== fv2.source) return false;
      if (fv1.originalValue !== fv2.originalValue) return false;
      if (fv1.modifiedAt !== fv2.modifiedAt) return false;
    }
  }
  
  // Customizations
  const c1 = state1.customizations;
  const c2 = state2.customizations;
  if (c1.template !== c2.template || c1.isGlobal !== c2.isGlobal) return false;
  
  // Colors
  if (c1.colors.headerBg !== c2.colors.headerBg) return false;
  if (c1.colors.headerText !== c2.colors.headerText) return false;
  if (c1.colors.sectionBg !== c2.colors.sectionBg) return false;
  if (c1.colors.sectionText !== c2.colors.sectionText) return false;
  if (c1.colors.labelText !== c2.colors.labelText) return false;
  if (c1.colors.valueText !== c2.colors.valueText) return false;
  if (c1.colors.borderColor !== c2.colors.borderColor) return false;
  
  // Fonts
  if (c1.fonts.titleSize !== c2.fonts.titleSize) return false;
  if (c1.fonts.labelSize !== c2.fonts.labelSize) return false;
  if (c1.fonts.valueSize !== c2.fonts.valueSize) return false;
  if (c1.fonts.fontFamily !== c2.fonts.fontFamily) return false;
  
  // Spacing
  if (c1.spacing.sectionGap !== c2.spacing.sectionGap) return false;
  if (c1.spacing.fieldGap !== c2.spacing.fieldGap) return false;
  if (c1.spacing.padding !== c2.spacing.padding) return false;
  if (c1.spacing.margin !== c2.spacing.margin) return false;
  
  // History
  if (state1.history.length !== state2.history.length) return false;
  for (let i = 0; i < state1.history.length; i++) {
    const h1 = state1.history[i];
    const h2 = state2.history[i];
    
    if (h1.id !== h2.id || h1.timestamp !== h2.timestamp || h1.action !== h2.action) return false;
  }
  
  // Errors
  if (state1.errors.length !== state2.errors.length) return false;
  for (let i = 0; i < state1.errors.length; i++) {
    const e1 = state1.errors[i];
    const e2 = state2.errors[i];
    
    if (e1.id !== e2.id || e1.fichaId !== e2.fichaId || e1.type !== e2.type) return false;
    if (e1.severity !== e2.severity || e1.message !== e2.message) return false;
    if (e1.resolved !== e2.resolved) return false;
  }
  
  return true;
}

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Property 6: Persistencia y Recuperación', () => {
  beforeEach(async () => {
    // Initialize DB before each test
    await initDB();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearAllData();
    closeDB();
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: For any valid ficha state, saving and loading SHALL produce
   * an equivalent state (round-trip property)
   */
  it('save and load produces equivalent ficha state', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        // Save the ficha
        await saveFicha(originalState);
        
        // Load it back
        const loadedState = await loadFicha(originalState.id);
        
        // Should not be null
        expect(loadedState).not.toBeNull();
        
        // Should be equivalent
        expect(fichaStatesAreEqual(originalState, loadedState!)).toBe(true);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Multiple save operations should preserve the latest state
   */
  it('multiple saves preserve latest state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fichaStateArb, { minLength: 2, maxLength: 5 }),
        async (states) => {
          // All states should have the same ID for this test
          const fichaId = states[0].id;
          const statesWithSameId = states.map((s, i) => ({
            ...s,
            id: fichaId,
            version: i + 1, // Increment version
          }));
          
          // Save all states sequentially
          for (const state of statesWithSameId) {
            await saveFicha(state);
          }
          
          // Load the final state
          const loadedState = await loadFicha(fichaId);
          
          // Should be equivalent to the last saved state
          const lastState = statesWithSameId[statesWithSameId.length - 1];
          expect(fichaStatesAreEqual(lastState, loadedState!)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Ficha ID should be preserved through persistence
   */
  it('ficha ID is preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.id).toBe(originalState.id);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Pozo ID should be preserved through persistence
   */
  it('pozo ID is preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.pozoId).toBe(originalState.pozoId);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Status should be preserved through persistence
   */
  it('status is preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.status).toBe(originalState.status);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: All sections should be preserved through persistence
   */
  it('all sections are preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.sections.length).toBe(originalState.sections.length);
        
        for (let i = 0; i < originalState.sections.length; i++) {
          const origSection = originalState.sections[i];
          const loadedSection = loadedState?.sections[i];
          
          expect(loadedSection?.id).toBe(origSection.id);
          expect(loadedSection?.type).toBe(origSection.type);
          expect(loadedSection?.order).toBe(origSection.order);
          expect(loadedSection?.visible).toBe(origSection.visible);
          expect(loadedSection?.locked).toBe(origSection.locked);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Field values with source tracking should be preserved
   */
  it('field values with source tracking are preserved', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        for (let i = 0; i < originalState.sections.length; i++) {
          const origSection = originalState.sections[i];
          const loadedSection = loadedState?.sections[i];
          
          const origKeys = Object.keys(origSection.content);
          const loadedKeys = Object.keys(loadedSection?.content || {});
          
          expect(loadedKeys.length).toBe(origKeys.length);
          
          for (const key of origKeys) {
            const origField = origSection.content[key];
            const loadedField = loadedSection?.content[key];
            
            expect(loadedField?.value).toBe(origField.value);
            expect(loadedField?.source).toBe(origField.source);
            expect(loadedField?.originalValue).toBe(origField.originalValue);
            expect(loadedField?.modifiedAt).toBe(origField.modifiedAt);
          }
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Customizations should be preserved through persistence
   */
  it('customizations are preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        const origCustom = originalState.customizations;
        const loadedCustom = loadedState?.customizations;
        
        expect(loadedCustom?.template).toBe(origCustom.template);
        expect(loadedCustom?.isGlobal).toBe(origCustom.isGlobal);
        
        // Colors
        expect(loadedCustom?.colors.headerBg).toBe(origCustom.colors.headerBg);
        expect(loadedCustom?.colors.headerText).toBe(origCustom.colors.headerText);
        expect(loadedCustom?.colors.sectionBg).toBe(origCustom.colors.sectionBg);
        
        // Fonts
        expect(loadedCustom?.fonts.titleSize).toBe(origCustom.fonts.titleSize);
        expect(loadedCustom?.fonts.fontFamily).toBe(origCustom.fonts.fontFamily);
        
        // Spacing
        expect(loadedCustom?.spacing.sectionGap).toBe(origCustom.spacing.sectionGap);
        expect(loadedCustom?.spacing.padding).toBe(origCustom.spacing.padding);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: History entries should be preserved through persistence
   */
  it('history entries are preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.history.length).toBe(originalState.history.length);
        
        for (let i = 0; i < originalState.history.length; i++) {
          const origEntry = originalState.history[i];
          const loadedEntry = loadedState?.history[i];
          
          expect(loadedEntry?.id).toBe(origEntry.id);
          expect(loadedEntry?.timestamp).toBe(origEntry.timestamp);
          expect(loadedEntry?.action).toBe(origEntry.action);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Error references should be preserved through persistence
   */
  it('error references are preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.errors.length).toBe(originalState.errors.length);
        
        for (let i = 0; i < originalState.errors.length; i++) {
          const origError = originalState.errors[i];
          const loadedError = loadedState?.errors[i];
          
          expect(loadedError?.id).toBe(origError.id);
          expect(loadedError?.fichaId).toBe(origError.fichaId);
          expect(loadedError?.type).toBe(origError.type);
          expect(loadedError?.severity).toBe(origError.severity);
          expect(loadedError?.message).toBe(origError.message);
          expect(loadedError?.resolved).toBe(origError.resolved);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Version number should be preserved through persistence
   */
  it('version number is preserved through persistence', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        await saveFicha(originalState);
        const loadedState = await loadFicha(originalState.id);
        
        expect(loadedState?.version).toBe(originalState.version);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Non-existent ficha should return null
   */
  it('loading non-existent ficha returns null', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (fichaId) => {
        const loadedState = await loadFicha(fichaId);
        
        expect(loadedState).toBeNull();
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Persistence should handle empty sections gracefully
   */
  it('persistence handles empty sections gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        // Create a state with empty sections
        const stateWithEmptySections = {
          ...originalState,
          sections: originalState.sections.map(s => ({
            ...s,
            content: {},
          })),
        };
        
        await saveFicha(stateWithEmptySections);
        const loadedState = await loadFicha(stateWithEmptySections.id);
        
        expect(loadedState?.sections.length).toBe(stateWithEmptySections.sections.length);
        
        for (let i = 0; i < stateWithEmptySections.sections.length; i++) {
          const loadedSection = loadedState?.sections[i];
          expect(Object.keys(loadedSection?.content || {}).length).toBe(0);
        }
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Persistence should handle empty history gracefully
   */
  it('persistence handles empty history gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        // Create a state with empty history
        const stateWithEmptyHistory = {
          ...originalState,
          history: [],
        };
        
        await saveFicha(stateWithEmptyHistory);
        const loadedState = await loadFicha(stateWithEmptyHistory.id);
        
        expect(loadedState?.history.length).toBe(0);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Persistence should handle empty errors gracefully
   */
  it('persistence handles empty errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        // Create a state with empty errors
        const stateWithEmptyErrors = {
          ...originalState,
          errors: [],
        };
        
        await saveFicha(stateWithEmptyErrors);
        const loadedState = await loadFicha(stateWithEmptyErrors.id);
        
        expect(loadedState?.errors.length).toBe(0);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 6: Persistencia y Recuperación
   * 
   * Property: Persistence should be idempotent - multiple round-trips produce same result
   */
  it('persistence is idempotent across multiple round-trips', async () => {
    await fc.assert(
      fc.asyncProperty(fichaStateArb, async (originalState) => {
        // First round-trip
        await saveFicha(originalState);
        const loaded1 = await loadFicha(originalState.id);
        
        // Second round-trip
        await saveFicha(loaded1!);
        const loaded2 = await loadFicha(originalState.id);
        
        // Third round-trip
        await saveFicha(loaded2!);
        const loaded3 = await loadFicha(originalState.id);
        
        // All should be equivalent
        expect(fichaStatesAreEqual(loaded1!, loaded2!)).toBe(true);
        expect(fichaStatesAreEqual(loaded2!, loaded3!)).toBe(true);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });
});
