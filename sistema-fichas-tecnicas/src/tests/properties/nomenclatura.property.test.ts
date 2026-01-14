/**
 * Property Test: Nomenclatura Parsing Round-Trip
 * **Property 2: Parsing de Nomenclatura Round-Trip**
 * **Validates: Requirements 10.1-10.4**
 * 
 * For any valid filename according to nomenclatura, parsing and then
 * reconstructing SHALL produce an equivalent result that identifies
 * the same pozo and category.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseNomenclatura, buildNomenclatura, isValidNomenclatura } from '@/lib/parsers/nomenclatura';

// Generators for valid nomenclatura filenames

// Pozo ID: Single letter (M, P, S, E, etc.) followed by 1-4 digits
const pozoIdArb = fc.stringOf(fc.constantFrom('M', 'P', 'S', 'E', 'A'), { minLength: 1, maxLength: 1 })
  .chain(prefix => fc.integer({ min: 1, max: 9999 }).map(n => `${prefix}${n}`));

// Tipos principales: P (Panorámica), I (Interna), T (Tubería)
const tiposPrincipalesArb = fc.constantFrom('P', 'I', 'T');

// Números de entrada: 1-9
const numeroEntradaArb = fc.integer({ min: 1, max: 9 });

// Números de salida: 0-9 (0 = sin número, 1-9 = con número)
const numeroSalidaArb = fc.integer({ min: 0, max: 9 });

// Números de sumidero: 1-9
const numeroSumideroArb = fc.integer({ min: 1, max: 9 });

// Generador para fotos principales: M680-P, M680-I, M680-T
const fotoPrincipalArb = fc.tuple(pozoIdArb, tiposPrincipalesArb)
  .map(([pozoId, tipo]) => `${pozoId}-${tipo}`);

// Generador para fotos de entrada: M680-E1-T, M680-E2-T, etc.
const fotoEntradaArb = fc.tuple(pozoIdArb, numeroEntradaArb)
  .map(([pozoId, num]) => `${pozoId}-E${num}-T`);

// Generador para fotos de salida: M680-S-T, M680-S1-T, M680-S2-T, etc.
const fotoSalidaArb = fc.tuple(pozoIdArb, numeroSalidaArb)
  .map(([pozoId, num]) => num === 0 ? `${pozoId}-S-T` : `${pozoId}-S${num}-T`);

// Generador para fotos de sumidero: M680-SUM1, M680-SUM2, etc.
const fotoSumideroArb = fc.tuple(pozoIdArb, numeroSumideroArb)
  .map(([pozoId, num]) => `${pozoId}-SUM${num}`);

// Generador para cualquier nomenclatura válida
const validNomenclaturaArb = fc.oneof(
  fotoPrincipalArb,
  fotoEntradaArb,
  fotoSalidaArb,
  fotoSumideroArb
);

// Generador para nomenclatura con extensión
const validNomenclaturaWithExtArb = validNomenclaturaArb
  .chain(name => fc.constantFrom('.jpg', '.jpeg', '.png', '.JPG', '.PNG')
    .map(ext => `${name}${ext}`)
  );

describe('Property 2: Parsing de Nomenclatura Round-Trip', () => {
  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: For any valid nomenclatura filename, parsing and reconstructing
   * SHALL produce an equivalent result that identifies the same pozo and category
   */
  it('valid nomenclatura round-trip preserves pozo ID and category', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        // Parse the filename
        const parsed = parseNomenclatura(filename);
        
        // Should be valid
        expect(parsed.isValid).toBe(true);
        
        // Should have extracted a pozo ID
        expect(parsed.pozoId).toBeTruthy();
        expect(parsed.pozoId.length).toBeGreaterThan(0);
        
        // Should have a valid category
        expect(['PRINCIPAL', 'ENTRADA', 'SALIDA', 'SUMIDERO']).toContain(parsed.categoria);
        
        // Reconstruct the nomenclatura
        const reconstructed = buildNomenclatura(parsed);
        
        // Reconstructed should not be empty
        expect(reconstructed).toBeTruthy();
        
        // Parse the reconstructed nomenclatura
        const reparsed = parseNomenclatura(reconstructed);
        
        // Should still be valid
        expect(reparsed.isValid).toBe(true);
        
        // Should have the same pozo ID
        expect(reparsed.pozoId).toBe(parsed.pozoId);
        
        // Should have the same category
        expect(reparsed.categoria).toBe(parsed.categoria);
        
        // Should have the same subcategoria
        expect(reparsed.subcategoria).toBe(parsed.subcategoria);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Parsing with file extension should work the same as without
   */
  it('nomenclatura with file extension parses same as without', () => {
    fc.assert(
      fc.property(validNomenclaturaWithExtArb, (filenameWithExt) => {
        // Parse with extension
        const parsedWithExt = parseNomenclatura(filenameWithExt);
        
        // Remove extension and parse
        const filenameWithoutExt = filenameWithExt.replace(/\.[^/.]+$/, '');
        const parsedWithoutExt = parseNomenclatura(filenameWithoutExt);
        
        // Both should be valid
        expect(parsedWithExt.isValid).toBe(true);
        expect(parsedWithoutExt.isValid).toBe(true);
        
        // Should have same results
        expect(parsedWithExt.pozoId).toBe(parsedWithoutExt.pozoId);
        expect(parsedWithExt.categoria).toBe(parsedWithoutExt.categoria);
        expect(parsedWithExt.subcategoria).toBe(parsedWithoutExt.subcategoria);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: isValidNomenclatura should match parseNomenclatura.isValid
   */
  it('isValidNomenclatura matches parseNomenclatura.isValid', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        const isValid = isValidNomenclatura(filename);
        
        expect(isValid).toBe(parsed.isValid);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Pozo ID should always be uppercase after parsing
   */
  it('pozo ID is always uppercase after parsing', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        if (parsed.isValid) {
          expect(parsed.pozoId).toBe(parsed.pozoId.toUpperCase());
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Subcategoria should always be uppercase after parsing
   */
  it('subcategoria is always uppercase after parsing', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        if (parsed.isValid) {
          expect(parsed.subcategoria).toBe(parsed.subcategoria.toUpperCase());
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Categoria should be one of the valid categories
   */
  it('categoria is always one of valid categories', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        const validCategories = ['PRINCIPAL', 'ENTRADA', 'SALIDA', 'SUMIDERO', 'OTRO'];
        expect(validCategories).toContain(parsed.categoria);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Tipo should have a non-empty description
   */
  it('tipo always has non-empty description', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        if (parsed.isValid) {
          expect(parsed.tipo).toBeTruthy();
          expect(parsed.tipo.length).toBeGreaterThan(0);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Multiple round-trips should be idempotent
   */
  it('multiple round-trips are idempotent', () => {
    fc.assert(
      fc.property(validNomenclaturaArb, (filename) => {
        // First round-trip
        const parsed1 = parseNomenclatura(filename);
        const rebuilt1 = buildNomenclatura(parsed1);
        
        // Second round-trip
        const parsed2 = parseNomenclatura(rebuilt1);
        const rebuilt2 = buildNomenclatura(parsed2);
        
        // Third round-trip
        const parsed3 = parseNomenclatura(rebuilt2);
        const rebuilt3 = buildNomenclatura(parsed3);
        
        // All should be equivalent
        expect(rebuilt1).toBe(rebuilt2);
        expect(rebuilt2).toBe(rebuilt3);
        
        expect(parsed1.pozoId).toBe(parsed2.pozoId);
        expect(parsed2.pozoId).toBe(parsed3.pozoId);
        
        expect(parsed1.categoria).toBe(parsed2.categoria);
        expect(parsed2.categoria).toBe(parsed3.categoria);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Entrada photos should have ENTRADA category
   */
  it('entrada photos have ENTRADA category', () => {
    fc.assert(
      fc.property(fotoEntradaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.categoria).toBe('ENTRADA');
        expect(parsed.subcategoria).toMatch(/^E\d+-T$/);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Salida photos should have SALIDA category
   */
  it('salida photos have SALIDA category', () => {
    fc.assert(
      fc.property(fotoSalidaArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.categoria).toBe('SALIDA');
        expect(parsed.subcategoria).toMatch(/^S\d*-T$/);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Sumidero photos should have SUMIDERO category
   */
  it('sumidero photos have SUMIDERO category', () => {
    fc.assert(
      fc.property(fotoSumideroArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.categoria).toBe('SUMIDERO');
        expect(parsed.subcategoria).toMatch(/^SUM\d+$/);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 2: Parsing de Nomenclatura Round-Trip
   * 
   * Property: Principal photos should have PRINCIPAL category
   */
  it('principal photos have PRINCIPAL category', () => {
    fc.assert(
      fc.property(fotoPrincipalArb, (filename) => {
        const parsed = parseNomenclatura(filename);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.categoria).toBe('PRINCIPAL');
        expect(['P', 'I', 'T']).toContain(parsed.subcategoria);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
