/**
 * Property Test: Excel Parsing Robustness
 * **Property 1: Robustez de Carga de Archivos**
 * **Validates: Requirements 1.8, 1.9, 1.10, 11.1-11.5**
 * 
 * For any Excel data with extra columns, missing columns, or malformed data,
 * the parser SHALL process it without throwing exceptions, extracting valid
 * data and marking problems found.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseExcelData } from '@/lib/parsers/excelParser';
import type { Pozo } from '@/types';

// Generators for valid data

// Pozo ID: Single letter followed by 1-4 digits
const pozoIdArb = fc.stringOf(fc.constantFrom('M', 'P', 'S', 'E', 'A'), { minLength: 1, maxLength: 1 })
  .chain(prefix => fc.integer({ min: 1, max: 9999 }).map(n => `${prefix}${n}`));

// Valid date in YYYY-MM-DD format
const validDateArb = fc.tuple(
  fc.integer({ min: 2020, max: 2024 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 28 })
).map(([year, month, day]) => 
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
);

// Inspector name
const inspectorNameArb = fc.stringOf(fc.char(), { minLength: 3, maxLength: 20 });

// Estado values
const estadoArb = fc.constantFrom('Bueno', 'Regular', 'Malo', 'Muy Malo', 'No Aplica');

// Coordinates (optional but valid if provided)
const coordinateArb = fc.float({ min: -180, max: 180, noNaN: true });

// Create a valid minimal row
const validRowArb = fc.record({
  codigo: pozoIdArb,
  fecha: validDateArb,
  levanto: inspectorNameArb,
  estado: estadoArb,
  coordenada_x: fc.option(coordinateArb, { freq: 2 }),
  coordenada_y: fc.option(coordinateArb, { freq: 2 }),
});

// Create rows with extra columns (should be ignored)
const rowWithExtraColumnsArb = validRowArb.chain(row =>
  fc.record({
    extraCol1: fc.string(),
    extraCol2: fc.integer(),
    extraCol3: fc.boolean(),
  }).map(extra => ({ ...row, ...extra }))
);

// Create rows with missing optional columns
const rowWithMissingColumnsArb = validRowArb.map(row => {
  const { coordenada_x, coordenada_y, ...rest } = row;
  return rest;
});

// Create rows with malformed data
const malformedDataArb = validRowArb.chain(row =>
  fc.oneof(
    // Invalid date
    fc.constant({ ...row, fecha: 'not-a-date' }),
    // Invalid coordinate
    fc.constant({ ...row, coordenada_x: 'not-a-number' }),
    // Empty required field
    fc.constant({ ...row, codigo: '' }),
    // Null values
    fc.constant({ ...row, levanto: null }),
  )
);

// Create rows with mixed valid and invalid data
const mixedDataArb = fc.array(
  fc.oneof(validRowArb, rowWithExtraColumnsArb, rowWithMissingColumnsArb, malformedDataArb),
  { minLength: 1, maxLength: 10 }
);

describe('Property 1: Robustez de Carga de Archivos', () => {
  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Parser never throws exceptions on any input
   */
  it('parser never throws exceptions on any input', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          validRowArb.chain(row => fc.array(fc.constant(row), { minLength: 1, maxLength: 5 })),
          rowWithExtraColumnsArb.chain(row => fc.array(fc.constant(row), { minLength: 1, maxLength: 5 })),
          rowWithMissingColumnsArb.chain(row => fc.array(fc.constant(row), { minLength: 1, maxLength: 5 })),
          malformedDataArb.chain(row => fc.array(fc.constant(row), { minLength: 1, maxLength: 5 })),
          mixedDataArb,
        ),
        (data) => {
          // Should never throw
          expect(() => {
            parseExcelData(data);
          }).not.toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Parser always returns a valid result object
   */
  it('parser always returns a valid result object', () => {
    fc.assert(
      fc.property(
        mixedDataArb,
        (data) => {
          const result = parseExcelData(data);
          
          // Result should have required fields
          expect(result).toHaveProperty('pozos');
          expect(result).toHaveProperty('warnings');
          expect(result).toHaveProperty('errors');
          expect(result).toHaveProperty('parseErrors');
          expect(result).toHaveProperty('stats');
          
          // Arrays should be arrays
          expect(Array.isArray(result.pozos)).toBe(true);
          expect(Array.isArray(result.warnings)).toBe(true);
          expect(Array.isArray(result.errors)).toBe(true);
          expect(Array.isArray(result.parseErrors)).toBe(true);
          
          // Stats should have required fields
          expect(result.stats).toHaveProperty('totalRows');
          expect(result.stats).toHaveProperty('validRows');
          expect(result.stats).toHaveProperty('skippedRows');
          expect(result.stats).toHaveProperty('columnsFound');
          expect(result.stats).toHaveProperty('columnsMissing');
          expect(result.stats).toHaveProperty('columnsIgnored');
          expect(result.stats).toHaveProperty('fieldsWithDefaults');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Valid rows are extracted successfully
   */
  it('valid rows are extracted successfully', () => {
    fc.assert(
      fc.property(
        fc.array(validRowArb, { minLength: 1, maxLength: 10 }),
        (data) => {
          const result = parseExcelData(data);
          
          // Should extract at least some valid pozos
          expect(result.pozos.length).toBeGreaterThan(0);
          
          // Valid rows count should match
          expect(result.stats.validRows).toBe(result.pozos.length);
          
          // Total rows should match input
          expect(result.stats.totalRows).toBe(data.length);
          
          // Each extracted pozo should have required fields
          result.pozos.forEach(pozo => {
            expect(pozo).toHaveProperty('id');
            expect(pozo).toHaveProperty('identificacion');
            expect(pozo).toHaveProperty('ubicacion');
            expect(pozo).toHaveProperty('componentes');
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Extra columns are ignored without error (Requirement 1.8)
   */
  it('extra columns are ignored without error', () => {
    fc.assert(
      fc.property(
        fc.array(rowWithExtraColumnsArb, { minLength: 1, maxLength: 5 }),
        (data) => {
          const result = parseExcelData(data);
          
          // Should have ignored columns
          expect(result.stats.columnsIgnored.length).toBeGreaterThan(0);
          
          // Should still extract valid pozos
          expect(result.pozos.length).toBeGreaterThan(0);
          
          // Should not have errors about extra columns
          const extraColErrors = result.errors.filter(e => e.includes('extra') || e.includes('unknown'));
          expect(extraColErrors.length).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Missing optional columns use default values (Requirement 1.9)
   */
  it('missing optional columns use default values', () => {
    fc.assert(
      fc.property(
        fc.array(rowWithMissingColumnsArb, { minLength: 1, maxLength: 5 }),
        (data) => {
          const result = parseExcelData(data);
          
          // Should have fields with defaults
          expect(result.stats.fieldsWithDefaults.length).toBeGreaterThan(0);
          
          // Should still extract valid pozos
          expect(result.pozos.length).toBeGreaterThan(0);
          
          // Should have warnings about missing columns
          expect(result.warnings.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Malformed data is handled gracefully without throwing
   */
  it('malformed data is handled gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(malformedDataArb, { minLength: 1, maxLength: 5 }),
        (data) => {
          // Should not throw
          expect(() => {
            parseExcelData(data);
          }).not.toThrow();
          
          const result = parseExcelData(data);
          
          // Should have parse errors
          expect(result.parseErrors.length).toBeGreaterThan(0);
          
          // Result should still be valid
          expect(result).toHaveProperty('pozos');
          expect(Array.isArray(result.pozos)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Mixed valid and invalid data extracts valid rows
   */
  it('mixed valid and invalid data extracts valid rows', () => {
    fc.assert(
      fc.property(
        mixedDataArb,
        (data) => {
          const result = parseExcelData(data);
          
          // validRows + skippedRows should equal totalRows
          expect(result.stats.validRows + result.stats.skippedRows).toBe(result.stats.totalRows);
          
          // Extracted pozos count should match validRows
          expect(result.pozos.length).toBe(result.stats.validRows);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Empty input returns empty result without error
   */
  it('empty input returns empty result without error', () => {
    const result = parseExcelData([]);
    
    expect(result.pozos.length).toBe(0);
    expect(result.stats.totalRows).toBe(0);
    expect(result.stats.validRows).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Null input returns empty result without error
   */
  it('null input returns empty result without error', () => {
    expect(() => {
      parseExcelData(null);
    }).not.toThrow();
    
    const result = parseExcelData(null);
    expect(result.pozos.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Non-array input returns empty result without error
   */
  it('non-array input returns empty result without error', () => {
    expect(() => {
      parseExcelData({ notAnArray: true });
    }).not.toThrow();
    
    const result = parseExcelData({ notAnArray: true });
    expect(result.pozos.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Each extracted pozo has a unique ID
   */
  it('each extracted pozo has a unique ID', () => {
    fc.assert(
      fc.property(
        fc.array(validRowArb, { minLength: 1, maxLength: 10 }),
        (data) => {
          const result = parseExcelData(data);
          
          if (result.pozos.length === 0) {
            return true; // Skip if no pozos extracted
          }
          
          // Collect all IDs
          const ids = result.pozos.map(p => p.id);
          
          // All IDs should be unique
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Parse errors have required fields
   */
  it('parse errors have required fields', () => {
    fc.assert(
      fc.property(
        mixedDataArb,
        (data) => {
          const result = parseExcelData(data);
          
          result.parseErrors.forEach(error => {
            expect(error).toHaveProperty('type');
            expect(error).toHaveProperty('severity');
            expect(error).toHaveProperty('message');
            expect(error).toHaveProperty('userMessage');
            
            // Type should be valid
            expect(['data', 'user', 'system']).toContain(error.type);
            
            // Severity should be valid
            expect(['warning', 'error']).toContain(error.severity);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 1: Robustez de Carga de Archivos
   * 
   * Property: Stats are always consistent
   */
  it('stats are always consistent', () => {
    fc.assert(
      fc.property(
        mixedDataArb,
        (data) => {
          const result = parseExcelData(data);
          
          // validRows + skippedRows = totalRows
          expect(result.stats.validRows + result.stats.skippedRows).toBe(result.stats.totalRows);
          
          // pozos.length = validRows
          expect(result.pozos.length).toBe(result.stats.validRows);
          
          // columnsFound should not be empty if data is valid
          if (result.stats.totalRows > 0 && result.stats.validRows > 0) {
            expect(result.stats.columnsFound.length).toBeGreaterThan(0);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
