/**
 * Property Test: Validation Non-Blocking
 * **Property 10: Validación No Bloqueante**
 * **Validates: Requirements 11.1-11.5, 0.1**
 * 
 * For any invalid or incomplete data, the system SHALL continue functioning,
 * using safe default values and marking problems visually without blocking
 * the workflow.
 * 
 * This property ensures that:
 * 1. Invalid data doesn't crash the system
 * 2. Incomplete data gets safe defaults
 * 3. The system continues operating normally
 * 4. Problems are reported but don't block the user
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validatePozo,
  validateField,
  getFieldsWithIssues,
  formatValidationResult,
} from '@/lib/validators/pozoValidator';
import { Pozo, FieldValue } from '@/types/pozo';

// ============================================================================
// GENERATORS FOR INVALID/INCOMPLETE DATA
// ============================================================================

/**
 * Generate a FieldValue with potentially invalid data
 */
const invalidFieldValueArb = fc.oneof(
  // Empty values
  fc.record({
    value: fc.constant(''),
    source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
    originalValue: fc.option(fc.string({ maxLength: 100 })),
    modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
  // Whitespace-only values
  fc.record({
    value: fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 }),
    source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
    originalValue: fc.option(fc.string({ maxLength: 100 })),
    modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
  // Invalid numbers
  fc.record({
    value: fc.oneof(
      fc.constant('abc'),
      fc.constant('-5'),
      fc.constant('0'),
      fc.constant('not-a-number')
    ),
    source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
    originalValue: fc.option(fc.string({ maxLength: 100 })),
    modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
  // Invalid dates
  fc.record({
    value: fc.oneof(
      fc.constant('15/01/2024'),
      fc.constant('2024-13-45'),
      fc.constant('invalid-date'),
      fc.constant('2024/01/15')
    ),
    source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
    originalValue: fc.option(fc.string({ maxLength: 100 })),
    modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
  }),
  // Out-of-range coordinates
  fc.record({
    value: fc.oneof(
      fc.constant('999.999'),
      fc.constant('-999.999'),
      fc.constant('180'),
      fc.constant('-180')
    ),
    source: fc.constantFrom('excel' as const, 'manual' as const, 'default' as const),
    originalValue: fc.option(fc.string({ maxLength: 100 })),
    modifiedAt: fc.option(fc.integer({ min: 0, max: Date.now() })),
  })
);

/**
 * Helper to create a FieldValue
 */
function fv(value: string): FieldValue {
  return { value, source: 'manual' };
}

/**
 * Helper to create a minimal pozo with potentially invalid data
 */
function createPozoWithInvalidData(overrides?: Partial<Pozo>): Pozo {
  const basePozo: Pozo = {
    id: 'PZ1',
    identificacion: {
      idPozo: fv('PZ1'),
      coordenadaX: fv('-74.123456'),
      coordenadaY: fv('4.678901'),
      fecha: fv('2024-01-15'),
      levanto: fv('Inspector 1'),
      estado: fv('Bueno'),
    },
    ubicacion: {
      direccion: fv('Calle 1 #1'),
      barrio: fv('Centro'),
      elevacion: fv('2600'),
      profundidad: fv('2.5'),
    },
    componentes: {
      existeTapa: fv('Sí'),
      estadoTapa: fv('Bueno'),
      existeCilindro: fv('No'),
      diametroCilindro: fv(''),
      sistema: fv('Sistema 1'),
      anoInstalacion: fv('2020'),
      tipoCamara: fv('TÍPICA DE FONDO DE CAÍDA'),
      estructuraPavimento: fv('Asfalto'),
      materialTapa: fv('Hierro'),
      existeCono: fv('No'),
      tipoCono: fv(''),
      materialCono: fv(''),
      estadoCono: fv(''),
      materialCilindro: fv(''),
      estadoCilindro: fv(''),
      existeCanuela: fv('No'),
      materialCanuela: fv(''),
      estadoCanuela: fv(''),
      existePeldanos: fv('No'),
      materialPeldanos: fv(''),
      numeroPeldanos: fv(''),
      estadoPeldanos: fv(''),
    },
    observaciones: {
      observaciones: fv('Sin observaciones'),
    },
    tuberias: {
      tuberias: [],
    },
    sumideros: {
      sumideros: [],
    },
    fotos: {
      fotos: [],
    },
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: 'manual',
      version: 1,
    },
  };

  return { ...basePozo, ...overrides };
}

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Property 10: Validación No Bloqueante', () => {
  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, validation SHALL complete without throwing
   * exceptions and SHALL return a result object (never null/undefined)
   */
  it('validation never throws exceptions for invalid data', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
          numeroPeldanos: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
              numeroPeldanos: invalidData.numeroPeldanos,
            },
          });

          // Should not throw
          let result;
          try {
            result = validatePozo(pozo);
          } catch (error) {
            throw new Error(`Validation threw exception: ${error}`);
          }

          // Should return a result object
          expect(result).toBeDefined();
          expect(result).not.toBeNull();
          expect(typeof result).toBe('object');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, validation result SHALL have errors array
   * (even if empty) and warnings array (even if empty)
   */
  it('validation result always has errors and warnings arrays', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);

          // Should have errors array
          expect(Array.isArray(result.errors)).toBe(true);

          // Should have warnings array
          expect(Array.isArray(result.warnings)).toBe(true);

          // Should have fieldsWithIssues array
          expect(Array.isArray(result.fieldsWithIssues)).toBe(true);

          // Should have isValid boolean
          expect(typeof result.isValid).toBe('boolean');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, the system SHALL report problems but
   * continue functioning (isValid is a boolean, never throws)
   */
  it('validation reports problems without blocking workflow', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
          numeroPeldanos: invalidFieldValueArb,
          coordenadaX: invalidFieldValueArb,
          coordenadaY: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
              coordenadaX: invalidData.coordenadaX,
              coordenadaY: invalidData.coordenadaY,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
              numeroPeldanos: invalidData.numeroPeldanos,
            },
          });

          const result = validatePozo(pozo);

          // isValid should be a boolean (never throws)
          expect(typeof result.isValid).toBe('boolean');

          // If there are errors, isValid should be false
          if (result.errors.length > 0) {
            expect(result.isValid).toBe(false);
          }

          // If there are no errors, isValid should be true
          if (result.errors.length === 0) {
            expect(result.isValid).toBe(true);
          }

          // Warnings don't affect isValid
          // (warnings are non-blocking)
          if (result.warnings.length > 0) {
            // isValid can be true or false regardless of warnings
            expect(typeof result.isValid).toBe('boolean');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, each error SHALL have a userMessage
   * (human-readable, not technical)
   */
  it('all errors have user-friendly messages', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
          numeroPeldanos: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
              numeroPeldanos: invalidData.numeroPeldanos,
            },
          });

          const result = validatePozo(pozo);

          // Every error should have a userMessage
          result.errors.forEach((error) => {
            expect(error.userMessage).toBeDefined();
            expect(typeof error.userMessage).toBe('string');
            expect(error.userMessage.length).toBeGreaterThan(0);

            // userMessage should not contain technical jargon
            // (should be in Spanish and understandable)
            expect(error.userMessage).not.toContain('undefined');
            expect(error.userMessage).not.toContain('null');
            expect(error.userMessage).not.toContain('[object Object]');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, each error SHALL have a type
   * (data, user, or system)
   */
  it('all errors have valid type classification', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);

          const validTypes = ['data', 'user', 'system'];

          result.errors.forEach((error) => {
            expect(validTypes).toContain(error.type);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, each error SHALL have a severity
   * (warning or error)
   */
  it('all errors have valid severity classification', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);

          const validSeverities = ['warning', 'error'];

          result.errors.forEach((error) => {
            expect(validSeverities).toContain(error.severity);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, formatValidationResult SHALL always
   * return a formatted object with summary, errors, and warnings
   */
  it('formatValidationResult always returns formatted object', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);
          const formatted = formatValidationResult(result);

          // Should have summary
          expect(formatted.summary).toBeDefined();
          expect(typeof formatted.summary).toBe('string');
          expect(formatted.summary.length).toBeGreaterThan(0);

          // Should have errors array
          expect(Array.isArray(formatted.errors)).toBe(true);

          // Should have warnings array
          expect(Array.isArray(formatted.warnings)).toBe(true);

          // All error messages should be strings
          formatted.errors.forEach((msg) => {
            expect(typeof msg).toBe('string');
          });

          // All warning messages should be strings
          formatted.warnings.forEach((msg) => {
            expect(typeof msg).toBe('string');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, getFieldsWithIssues SHALL return an array
   * of field paths (never null/undefined)
   */
  it('getFieldsWithIssues always returns array of field paths', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);
          const fieldsWithIssues = getFieldsWithIssues(result);

          // Should be an array
          expect(Array.isArray(fieldsWithIssues)).toBe(true);

          // All elements should be strings (field paths)
          fieldsWithIssues.forEach((field) => {
            expect(typeof field).toBe('string');
            expect(field.length).toBeGreaterThan(0);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, validateField SHALL return an array
   * of errors (never throws)
   */
  it('validateField never throws for invalid data', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          // Should not throw
          let errors;
          try {
            errors = validateField(pozo, 'ubicacion.profundidad');
          } catch (error) {
            throw new Error(`validateField threw exception: ${error}`);
          }

          // Should return an array
          expect(Array.isArray(errors)).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, errors count SHALL match fieldsWithIssues
   * count (each field with issues has at least one error)
   */
  it('fieldsWithIssues count correlates with errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
          numeroPeldanos: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
              numeroPeldanos: invalidData.numeroPeldanos,
            },
          });

          const result = validatePozo(pozo);
          const fieldsWithIssues = getFieldsWithIssues(result);

          // If there are errors, there should be fields with issues
          if (result.errors.length > 0) {
            expect(fieldsWithIssues.length).toBeGreaterThan(0);
          }

          // Each field with issues should have at least one error
          fieldsWithIssues.forEach((field) => {
            const fieldErrors = result.errors.filter((e) => e.field?.startsWith(field));
            expect(fieldErrors.length).toBeGreaterThan(0);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, warnings SHALL NOT affect isValid
   * (warnings are non-blocking)
   */
  it('warnings do not affect isValid status', () => {
    fc.assert(
      fc.property(
        fc.record({
          levanto: invalidFieldValueArb,
          estado: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            identificacion: {
              ...createPozoWithInvalidData().identificacion,
              levanto: invalidData.levanto,
              estado: invalidData.estado,
            },
          });

          const result = validatePozo(pozo);

          // If there are only warnings (no errors), isValid should be true
          if (result.errors.length === 0 && result.warnings.length > 0) {
            expect(result.isValid).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, the validation result SHALL be consistent
   * across multiple calls (deterministic)
   */
  it('validation is deterministic for same input', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          // Validate multiple times
          const result1 = validatePozo(pozo);
          const result2 = validatePozo(pozo);
          const result3 = validatePozo(pozo);

          // Should have same isValid status
          expect(result1.isValid).toBe(result2.isValid);
          expect(result2.isValid).toBe(result3.isValid);

          // Should have same number of errors
          expect(result1.errors.length).toBe(result2.errors.length);
          expect(result2.errors.length).toBe(result3.errors.length);

          // Should have same number of warnings
          expect(result1.warnings.length).toBe(result2.warnings.length);
          expect(result2.warnings.length).toBe(result3.warnings.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, each error SHALL have a code
   * (for programmatic handling)
   */
  it('all errors have error codes', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
            },
          });

          const result = validatePozo(pozo);

          result.errors.forEach((error) => {
            expect(error.code).toBeDefined();
            expect(typeof error.code).toBe('string');
            expect(error.code.length).toBeGreaterThan(0);
            // Code should be uppercase with underscores
            expect(error.code).toMatch(/^[A-Z_]+$/);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, each warning SHALL have a code
   * (for programmatic handling)
   */
  it('all warnings have warning codes', () => {
    fc.assert(
      fc.property(
        fc.record({
          levanto: invalidFieldValueArb,
          estado: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            identificacion: {
              ...createPozoWithInvalidData().identificacion,
              levanto: invalidData.levanto,
              estado: invalidData.estado,
            },
          });

          const result = validatePozo(pozo);

          result.warnings.forEach((warning) => {
            expect(warning.code).toBeDefined();
            expect(typeof warning.code).toBe('string');
            expect(warning.code.length).toBeGreaterThan(0);
            // Code should be uppercase with underscores
            expect(warning.code).toMatch(/^[A-Z_]+$/);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: sistema-fichas-tecnicas-nextjs, Property 10: Validación No Bloqueante
   * 
   * Property: For any invalid data, the system SHALL continue functioning
   * (validation never blocks the workflow)
   */
  it('validation never blocks workflow regardless of data quality', () => {
    fc.assert(
      fc.property(
        fc.record({
          profundidad: invalidFieldValueArb,
          diametroCilindro: invalidFieldValueArb,
          numeroPeldanos: invalidFieldValueArb,
          coordenadaX: invalidFieldValueArb,
          coordenadaY: invalidFieldValueArb,
          fecha: invalidFieldValueArb,
        }),
        (invalidData) => {
          const pozo = createPozoWithInvalidData({
            identificacion: {
              ...createPozoWithInvalidData().identificacion,
              fecha: invalidData.fecha,
            },
            ubicacion: {
              ...createPozoWithInvalidData().ubicacion,
              profundidad: invalidData.profundidad,
              coordenadaX: invalidData.coordenadaX,
              coordenadaY: invalidData.coordenadaY,
            },
            componentes: {
              ...createPozoWithInvalidData().componentes,
              diametroCilindro: invalidData.diametroCilindro,
              numeroPeldanos: invalidData.numeroPeldanos,
            },
          });

          // Validation should complete
          const result = validatePozo(pozo);

          // Should have a result
          expect(result).toBeDefined();

          // Should be able to format the result
          const formatted = formatValidationResult(result);
          expect(formatted).toBeDefined();

          // Should be able to get fields with issues
          const fieldsWithIssues = getFieldsWithIssues(result);
          expect(fieldsWithIssues).toBeDefined();

          // Should be able to validate specific fields
          const fieldErrors = validateField(pozo, 'ubicacion.profundidad');
          expect(fieldErrors).toBeDefined();

          // All operations should complete without throwing
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
