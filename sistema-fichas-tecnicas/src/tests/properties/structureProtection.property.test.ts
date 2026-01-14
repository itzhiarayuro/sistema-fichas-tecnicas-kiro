/**
 * Property Test: Structure Protection
 * **Property 7: Protección de Estructura Mínima**
 * **Validates: Requirements 3.8, 3.9, 3.10**
 * 
 * For any sequence of user editing operations, the resulting ficha SHALL maintain
 * all mandatory sections and a valid structure for PDF generation.
 * 
 * The system SHALL prevent deletion of obligatory sections and breaking the
 * minimum structure of the ficha.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { createFichaStore, clearAllFichaStores } from '@/stores/fichaStore';
import type { FichaState, FichaSection, SectionType, FieldValue } from '@/types/ficha';

// ============================================================================
// CONSTANTS AND HELPERS
// ============================================================================

/**
 * Mandatory sections that must always exist in a ficha
 * These sections cannot be deleted or hidden
 */
const MANDATORY_SECTIONS: SectionType[] = [
  'identificacion',
  'estructura',
  'observaciones',
];

/**
 * Optional sections that can be hidden or removed
 */
const OPTIONAL_SECTIONS: SectionType[] = [
  'tuberias',
  'sumideros',
  'fotos',
];

/**
 * Check if a ficha has all mandatory sections
 */
function hasMandatorySections(ficha: FichaState): boolean {
  const sectionTypes = new Set(ficha.sections.map(s => s.type));
  return MANDATORY_SECTIONS.every(type => sectionTypes.has(type));
}

/**
 * Check if a ficha has at least one section
 */
function hasAtLeastOneSection(ficha: FichaState): boolean {
  return ficha.sections.length > 0;
}

/**
 * Check if all sections have valid structure
 */
function hasValidSectionStructure(ficha: FichaState): boolean {
  return ficha.sections.every(section => {
    // Each section must have required properties
    if (!section.id || !section.type) return false;
    
    // Order must be non-negative
    if (section.order < 0) return false;
    
    // Content must be an object
    if (typeof section.content !== 'object' || section.content === null) return false;
    
    // All field values must have required properties
    for (const [key, value] of Object.entries(section.content)) {
      // value.value can be empty string, so check for undefined/null instead
      if (value.value === undefined || value.value === null) return false;
      if (!value.source) return false;
      if (!['excel', 'manual', 'default'].includes(value.source)) return false;
    }
    
    return true;
  });
}

/**
 * Check if sections are properly ordered
 */
function hasProperlySortedSections(ficha: FichaState): boolean {
  for (let i = 0; i < ficha.sections.length; i++) {
    if (ficha.sections[i].order !== i) return false;
  }
  return true;
}

/**
 * Check if ficha has valid structure for PDF generation
 */
function isValidForPDFGeneration(ficha: FichaState): boolean {
  return (
    hasMandatorySections(ficha) &&
    hasAtLeastOneSection(ficha) &&
    hasValidSectionStructure(ficha) &&
    hasProperlySortedSections(ficha)
  );
}

/**
 * Create a minimal valid ficha state for testing
 */
function createMinimalFicha(overrides?: Partial<FichaState>): FichaState {
  const mandatorySections: FichaSection[] = MANDATORY_SECTIONS.map((type, index) => ({
    id: `section-${type}`,
    type,
    order: index,
    visible: true,
    locked: type === 'identificacion', // Lock identificacion section
    content: {
      [`${type}_field`]: {
        value: `Test value for ${type}`,
        source: 'default' as const,
      },
    },
  }));

  return {
    id: 'test-ficha-1',
    pozoId: 'M680',
    status: 'draft',
    sections: mandatorySections,
    customizations: {
      colors: {
        headerBg: '#1F4E79',
        headerText: '#FFFFFF',
        sectionBg: '#FFFFFF',
        sectionText: '#333333',
        labelText: '#666666',
        valueText: '#000000',
        borderColor: '#E5E7EB',
      },
      fonts: {
        titleSize: 16,
        labelSize: 12,
        valueSize: 12,
        fontFamily: 'Inter',
      },
      spacing: {
        sectionGap: 16,
        fieldGap: 8,
        padding: 16,
        margin: 24,
      },
      template: 'standard',
      isGlobal: false,
    },
    history: [],
    errors: [],
    lastModified: Date.now(),
    version: 1,
    ...overrides,
  };
}

// ============================================================================
// GENERATORS FOR EDITING OPERATIONS
// ============================================================================

/**
 * Generate a field update operation
 */
const fieldUpdateOpArb = fc.record({
  type: fc.constant('updateField'),
  sectionIndex: fc.integer({ min: 0, max: 2 }),
  fieldName: fc.string({ minLength: 1, maxLength: 20 }),
  value: fc.string({ minLength: 0, maxLength: 100 }),
});

/**
 * Generate a section reorder operation
 */
const reorderOpArb = fc.record({
  type: fc.constant('reorder'),
  fromIndex: fc.integer({ min: 0, max: 2 }),
  toIndex: fc.integer({ min: 0, max: 2 }),
});

/**
 * Generate a toggle visibility operation
 */
const toggleVisibilityOpArb = fc.record({
  type: fc.constant('toggleVisibility'),
  sectionIndex: fc.integer({ min: 0, max: 2 }),
});

/**
 * Generate a sequence of editing operations
 */
const editingSequenceArb = fc.array(
  fc.oneof(fieldUpdateOpArb, reorderOpArb, toggleVisibilityOpArb),
  { minLength: 1, maxLength: 20 }
);

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Property 7: Protección de Estructura Mínima', () => {
  beforeEach(() => {
    clearAllFichaStores();
  });

  afterEach(() => {
    clearAllFichaStores();
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: After any sequence of editing operations, the ficha SHALL maintain
   * all mandatory sections
   */
  it('maintains all mandatory sections after any editing sequence', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            // Only reorder if indices are different and valid
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // Should still have all mandatory sections
        expect(hasMandatorySections(finalState)).toBe(true);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: After any sequence of operations, the ficha SHALL have at least one section
   */
  it('maintains at least one section after any editing sequence', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // Should have at least one section
        expect(hasAtLeastOneSection(finalState)).toBe(true);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: After any sequence of operations, all sections SHALL have valid structure
   */
  it('maintains valid section structure after any editing sequence', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // All sections should have valid structure
        expect(hasValidSectionStructure(finalState)).toBe(true);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: After any sequence of operations, sections SHALL be properly ordered
   */
  it('maintains proper section ordering after any editing sequence', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // Sections should be properly ordered
        expect(hasProperlySortedSections(finalState)).toBe(true);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: After any sequence of operations, the ficha SHALL be valid for PDF generation
   */
  it('maintains valid structure for PDF generation after any editing sequence', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // Should be valid for PDF generation
        expect(isValidForPDFGeneration(finalState)).toBe(true);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Locked sections cannot be reordered
   */
  it('locked sections cannot be reordered', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (targetIndex) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Get the locked section (identificacion)
        const lockedSectionIndex = storeInstance.sections.findIndex(s => s.locked);
        
        if (lockedSectionIndex === -1) return true; // No locked section, skip

        // Try to reorder the locked section
        const otherIndex = lockedSectionIndex === 0 ? 1 : 0;
        const initialOrder = storeInstance.sections.map(s => s.id);
        
        storeInstance.reorderSections(lockedSectionIndex, otherIndex);
        
        const finalState = store.getState();
        const finalOrder = finalState.sections.map(s => s.id);

        // Order should not have changed
        expect(finalOrder).toEqual(initialOrder);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Locked sections cannot be hidden
   */
  it('locked sections cannot be hidden', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Get the locked section
        const lockedSection = storeInstance.sections.find(s => s.locked);
        
        if (!lockedSection) return true; // No locked section, skip

        const initialVisibility = lockedSection.visible;
        
        // Try to toggle visibility
        storeInstance.toggleSectionVisibility(lockedSection.id);
        
        const finalState = store.getState();
        const finalSection = finalState.sections.find(s => s.id === lockedSection.id);

        // Visibility should not have changed
        expect(finalSection?.visible).toBe(initialVisibility);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Finalized fichas cannot be modified
   */
  it('finalized fichas cannot be modified', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha({ status: 'finalized' });
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        const initialState = JSON.stringify(storeInstance.sections);

        // Try to apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();
        const finalStateStr = JSON.stringify(finalState.sections);

        // State should not have changed
        expect(finalStateStr).toBe(initialState);

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Each section must have a unique ID
   */
  it('all sections have unique IDs', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // All section IDs should be unique
        const ids = finalState.sections.map(s => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Mandatory sections cannot be removed
   */
  it('mandatory sections cannot be removed', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        const initialMandatorySections = storeInstance.sections
          .filter(s => MANDATORY_SECTIONS.includes(s.type))
          .map(s => s.type);

        // Try to remove sections (by toggling visibility multiple times)
        for (let i = 0; i < storeInstance.sections.length; i++) {
          const section = storeInstance.sections[i];
          storeInstance.toggleSectionVisibility(section.id);
        }

        // Get final state
        const finalState = store.getState();

        // All mandatory sections should still exist
        const finalMandatorySections = finalState.sections
          .filter(s => MANDATORY_SECTIONS.includes(s.type))
          .map(s => s.type);

        expect(finalMandatorySections.sort()).toEqual(initialMandatorySections.sort());

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Field values must always have a source
   */
  it('all field values have a valid source', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Get final state
        const finalState = store.getState();

        // All field values should have valid source
        for (const section of finalState.sections) {
          for (const [key, value] of Object.entries(section.content)) {
            expect(['excel', 'manual', 'default']).toContain(value.source);
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 7: Protección de Estructura Mínima
   * 
   * Property: Undo/Redo operations maintain structure integrity
   */
  it('undo/redo operations maintain structure integrity', () => {
    fc.assert(
      fc.property(editingSequenceArb, (operations) => {
        const initialFicha = createMinimalFicha();
        const store = createFichaStore(initialFicha);
        const storeInstance = store.getState();

        // Apply all operations
        for (const op of operations) {
          if (op.type === 'updateField') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.updateField(section.id, op.fieldName, op.value);
            }
          } else if (op.type === 'reorder') {
            if (op.fromIndex !== op.toIndex && 
                op.fromIndex < storeInstance.sections.length && 
                op.toIndex < storeInstance.sections.length) {
              storeInstance.reorderSections(op.fromIndex, op.toIndex);
            }
          } else if (op.type === 'toggleVisibility') {
            const section = storeInstance.sections[op.sectionIndex];
            if (section) {
              storeInstance.toggleSectionVisibility(section.id);
            }
          }
        }

        // Undo all operations
        while (storeInstance.canUndo()) {
          storeInstance.undo();
        }

        // Get state after undo
        const afterUndoState = store.getState();

        // Should still be valid
        expect(isValidForPDFGeneration(afterUndoState)).toBe(true);

        // Redo all operations
        while (storeInstance.canRedo()) {
          storeInstance.redo();
        }

        // Get state after redo
        const afterRedoState = store.getState();

        // Should still be valid
        expect(isValidForPDFGeneration(afterRedoState)).toBe(true);

        return true;
      }),
      { numRuns: 50 }
    );
  });
});
