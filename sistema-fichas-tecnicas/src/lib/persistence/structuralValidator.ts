/**
 * StructuralValidator - Validación estructural mínima centralizada
 * Requirements: 0.1, 1.8-1.10, 3.8-3.10
 * 
 * Responde SOLO a: "¿Este estado es renderizable y persistible?"
 * 
 * NO valida reglas de negocio, solo estructura.
 * Usado en: persistencia, render, recuperación
 */

import { FichaState, FichaSection, FieldValue } from '@/types/ficha';
import { validateFichaFinal } from '@/lib/validators/fichaValidatorFinal';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validar estructura mínima de FichaState
 * 
 * Checks:
 * - ID no vacío
 * - Status válido
 * - Sections es array
 * - Customizations existe
 * - History es array
 * - Errors es array
 */
export function validateFichaStateStructure(state: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Verificar que es un objeto
  if (!state || typeof state !== 'object') {
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message: 'Estado no es un objeto válido',
          severity: 'critical',
        },
      ],
    };
  }

  const s = state as Record<string, unknown>;

  // 2. Verificar ID
  if (!s.id || typeof s.id !== 'string') {
    errors.push({
      field: 'id',
      message: 'ID debe ser un string no vacío',
      severity: 'critical',
    });
  }

  // 3. Verificar status
  const validStatuses = ['draft', 'editing', 'complete', 'finalized'];
  if (!s.status || !validStatuses.includes(s.status as string)) {
    errors.push({
      field: 'status',
      message: `Status debe ser uno de: ${validStatuses.join(', ')}`,
      severity: 'critical',
    });
  }

  // 4. Verificar sections
  if (!Array.isArray(s.sections)) {
    errors.push({
      field: 'sections',
      message: 'Sections debe ser un array',
      severity: 'critical',
    });
  } else {
    // Validar cada sección
    for (let i = 0; i < (s.sections as unknown[]).length; i++) {
      const sectionErrors = validateSectionStructure((s.sections as unknown[])[i], i);
      errors.push(...sectionErrors);
    }
  }

  // 5. Verificar customizations
  if (!s.customizations || typeof s.customizations !== 'object') {
    errors.push({
      field: 'customizations',
      message: 'Customizations debe ser un objeto',
      severity: 'critical',
    });
  }

  // 6. Verificar history
  if (!Array.isArray(s.history)) {
    errors.push({
      field: 'history',
      message: 'History debe ser un array',
      severity: 'warning',
    });
  }

  // 7. Verificar errors
  if (!Array.isArray(s.errors)) {
    errors.push({
      field: 'errors',
      message: 'Errors debe ser un array',
      severity: 'warning',
    });
  }

  // 8. Verificar lastModified
  if (typeof s.lastModified !== 'number') {
    errors.push({
      field: 'lastModified',
      message: 'LastModified debe ser un número (timestamp)',
      severity: 'warning',
    });
  }

  // 9. Verificar version
  if (typeof s.version !== 'number') {
    errors.push({
      field: 'version',
      message: 'Version debe ser un número',
      severity: 'warning',
    });
  }

  const hasCritical = errors.some((e) => e.severity === 'critical');
  return {
    valid: !hasCritical,
    errors,
  };
}

/**
 * Validar estructura de una sección
 */
function validateSectionStructure(section: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!section || typeof section !== 'object') {
    errors.push({
      field: `sections[${index}]`,
      message: 'Sección no es un objeto válido',
      severity: 'critical',
    });
    return errors;
  }

  const s = section as Record<string, unknown>;

  // Verificar campos obligatorios
  if (!s.id || typeof s.id !== 'string') {
    errors.push({
      field: `sections[${index}].id`,
      message: 'ID de sección debe ser un string',
      severity: 'critical',
    });
  }

  if (!s.type || typeof s.type !== 'string') {
    errors.push({
      field: `sections[${index}].type`,
      message: 'Type de sección debe ser un string',
      severity: 'critical',
    });
  }

  if (typeof s.order !== 'number') {
    errors.push({
      field: `sections[${index}].order`,
      message: 'Order debe ser un número',
      severity: 'warning',
    });
  }

  if (typeof s.visible !== 'boolean') {
    errors.push({
      field: `sections[${index}].visible`,
      message: 'Visible debe ser un booleano',
      severity: 'warning',
    });
  }

  if (typeof s.locked !== 'boolean') {
    errors.push({
      field: `sections[${index}].locked`,
      message: 'Locked debe ser un booleano',
      severity: 'warning',
    });
  }

  if (!s.content || typeof s.content !== 'object') {
    errors.push({
      field: `sections[${index}].content`,
      message: 'Content debe ser un objeto',
      severity: 'critical',
    });
  }

  return errors;
}

/**
 * Validar estructura de FieldValue
 */
export function validateFieldValueStructure(field: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!field || typeof field !== 'object') {
    errors.push({
      field: 'fieldValue',
      message: 'FieldValue no es un objeto válido',
      severity: 'critical',
    });
    return errors;
  }

  const f = field as Record<string, unknown>;

  // Verificar value
  if (typeof f.value !== 'string') {
    errors.push({
      field: 'value',
      message: 'Value debe ser un string',
      severity: 'critical',
    });
  }

  // Verificar source
  const validSources = ['excel', 'manual', 'default'];
  if (!f.source || !validSources.includes(f.source as string)) {
    errors.push({
      field: 'source',
      message: `Source debe ser uno de: ${validSources.join(', ')}`,
      severity: 'critical',
    });
  }

  return errors;
}

/**
 * Verificación rápida: ¿es renderizable?
 * 
 * Checks mínimos para saber si se puede mostrar en UI
 */
export function isRenderizable(state: FichaState): boolean {
  const validation = validateFichaStateStructure(state);
  return validation.valid;
}

/**
 * Verificación rápida: ¿es persistible?
 * 
 * Checks mínimos para saber si se puede guardar
 */
export function isPersistible(state: FichaState): boolean {
  const validation = validateFichaStateStructure(state);
  return validation.valid;
}
