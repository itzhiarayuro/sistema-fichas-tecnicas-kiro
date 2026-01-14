/**
 * Invariants - Propiedades que siempre deben ser verdaderas
 * Requirements: 16.1-16.5
 * 
 * Los invariantes definen las reglas que el estado debe cumplir
 * en todo momento para mantener la integridad de la ficha.
 */

import type { FichaState, FichaSection } from '@/types/ficha';

/**
 * Resultado de verificación de invariante
 */
export interface InvariantCheckResult {
  valid: boolean;
  violations: string[];
}

/**
 * Verifica todos los invariantes de una ficha
 */
export function checkAllInvariants(state: FichaState): InvariantCheckResult {
  const violations: string[] = [];

  // Invariante 1: ID debe existir
  if (!invariantIdExists(state)) {
    violations.push('Invariant violated: Ficha ID must exist');
  }

  // Invariante 2: Pozo ID debe existir
  if (!invariantPozoIdExists(state)) {
    violations.push('Invariant violated: Pozo ID must exist');
  }

  // Invariante 3: Status debe ser válido
  if (!invariantValidStatus(state)) {
    violations.push('Invariant violated: Status must be one of: draft, editing, complete, finalized');
  }

  // Invariante 4: Secciones deben tener IDs únicos
  if (!invariantUniqueSectionIds(state)) {
    violations.push('Invariant violated: Section IDs must be unique');
  }

  // Invariante 5: Secciones deben tener orden válido
  if (!invariantValidSectionOrder(state)) {
    violations.push('Invariant violated: Section order must be sequential starting from 0');
  }

  // Invariante 6: Versión debe ser positiva
  if (!invariantValidVersion(state)) {
    violations.push('Invariant violated: Version must be a positive number');
  }

  // Invariante 7: LastModified debe ser válido
  if (!invariantValidTimestamp(state)) {
    violations.push('Invariant violated: LastModified must be a valid timestamp');
  }

  // Invariante 8: Fichas finalizadas no pueden cambiar
  if (!invariantFinalizedImmutable(state)) {
    violations.push('Invariant violated: Finalized ficha cannot be modified');
  }

  // Invariante 9: Customizations debe tener estructura válida
  if (!invariantValidCustomizations(state)) {
    violations.push('Invariant violated: Customizations must have valid structure');
  }

  // Invariante 10: Errores deben tener fichaId correcto
  if (!invariantErrorsHaveCorrectFichaId(state)) {
    violations.push('Invariant violated: All errors must have correct fichaId');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Invariante 1: ID debe existir
 */
export function invariantIdExists(state: FichaState): boolean {
  return typeof state.id === 'string' && state.id.length > 0;
}

/**
 * Invariante 2: Pozo ID debe existir
 */
export function invariantPozoIdExists(state: FichaState): boolean {
  return typeof state.pozoId === 'string' && state.pozoId.length > 0;
}

/**
 * Invariante 3: Status debe ser válido
 */
export function invariantValidStatus(state: FichaState): boolean {
  const validStatuses = ['draft', 'editing', 'complete', 'finalized'];
  return validStatuses.includes(state.status);
}

/**
 * Invariante 4: Secciones deben tener IDs únicos
 */
export function invariantUniqueSectionIds(state: FichaState): boolean {
  const ids = new Set<string>();

  for (const section of state.sections) {
    if (!section.id || ids.has(section.id)) {
      return false;
    }
    ids.add(section.id);
  }

  return true;
}

/**
 * Invariante 5: Secciones deben tener orden válido
 */
export function invariantValidSectionOrder(state: FichaState): boolean {
  for (let i = 0; i < state.sections.length; i++) {
    if (state.sections[i].order !== i) {
      return false;
    }
  }

  return true;
}

/**
 * Invariante 6: Versión debe ser positiva
 */
export function invariantValidVersion(state: FichaState): boolean {
  return typeof state.version === 'number' && state.version > 0;
}

/**
 * Invariante 7: LastModified debe ser válido
 */
export function invariantValidTimestamp(state: FichaState): boolean {
  return (
    typeof state.lastModified === 'number' &&
    state.lastModified > 0 &&
    state.lastModified <= Date.now()
  );
}

/**
 * Invariante 8: Fichas finalizadas no pueden cambiar
 * Nota: Este invariante se verifica en los reducers, no en el estado
 */
export function invariantFinalizedImmutable(state: FichaState): boolean {
  // Este invariante se verifica en los reducers
  // Aquí solo verificamos que si está finalizada, tenga un estado consistente
  if (state.status === 'finalized') {
    // Una ficha finalizada debe tener al menos una sección
    return state.sections.length > 0;
  }

  return true;
}

/**
 * Invariante 9: Customizations debe tener estructura válida
 */
export function invariantValidCustomizations(state: FichaState): boolean {
  const c = state.customizations;

  if (!c) return false;

  // Validar colors
  if (!c.colors || typeof c.colors !== 'object') return false;
  if (typeof c.colors.headerBg !== 'string') return false;
  if (typeof c.colors.headerText !== 'string') return false;

  // Validar fonts
  if (!c.fonts || typeof c.fonts !== 'object') return false;
  if (typeof c.fonts.titleSize !== 'number' || c.fonts.titleSize <= 0) return false;
  if (typeof c.fonts.fontFamily !== 'string') return false;

  // Validar spacing
  if (!c.spacing || typeof c.spacing !== 'object') return false;
  if (typeof c.spacing.sectionGap !== 'number' || c.spacing.sectionGap < 0) return false;

  // Validar template
  if (typeof c.template !== 'string') return false;

  // Validar isGlobal
  if (typeof c.isGlobal !== 'boolean') return false;

  return true;
}

/**
 * Invariante 10: Errores deben tener fichaId correcto
 */
export function invariantErrorsHaveCorrectFichaId(state: FichaState): boolean {
  for (const error of state.errors) {
    if (error.fichaId !== state.id) {
      return false;
    }
  }

  return true;
}

/**
 * Invariante adicional: Secciones deben tener contenido válido
 */
export function invariantValidSectionContent(section: FichaSection): boolean {
  if (!section.id || typeof section.id !== 'string') return false;
  if (!section.type || typeof section.type !== 'string') return false;
  if (typeof section.order !== 'number' || section.order < 0) return false;
  if (typeof section.visible !== 'boolean') return false;
  if (typeof section.locked !== 'boolean') return false;
  if (!section.content || typeof section.content !== 'object') return false;

  // Validar que todos los valores en content sean FieldValue
  for (const [key, value] of Object.entries(section.content)) {
    if (!value || typeof value !== 'object') return false;
    if (typeof (value as any).value !== 'string') return false;
    if (!['excel', 'manual', 'default'].includes((value as any).source)) return false;
  }

  return true;
}

/**
 * Invariante adicional: Ficha debe tener al menos una sección
 */
export function invariantHasAtLeastOneSection(state: FichaState): boolean {
  return state.sections && state.sections.length > 0;
}

/**
 * Invariante adicional: Ficha no puede tener más de 100 secciones
 */
export function invariantMaxSections(state: FichaState, maxSections: number = 100): boolean {
  return state.sections && state.sections.length <= maxSections;
}

/**
 * Invariante adicional: Ficha no puede tener más de 1000 errores
 */
export function invariantMaxErrors(state: FichaState, maxErrors: number = 1000): boolean {
  return state.errors && state.errors.length <= maxErrors;
}

/**
 * Verifica invariantes de secciones
 */
export function checkSectionInvariants(state: FichaState): InvariantCheckResult {
  const violations: string[] = [];

  for (const section of state.sections) {
    if (!invariantValidSectionContent(section)) {
      violations.push(`Section ${section.id} has invalid content`);
    }
  }

  if (!invariantHasAtLeastOneSection(state)) {
    violations.push('Ficha must have at least one section');
  }

  if (!invariantMaxSections(state)) {
    violations.push('Ficha has too many sections');
  }

  if (!invariantMaxErrors(state)) {
    violations.push('Ficha has too many errors');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Verifica todos los invariantes (completo)
 */
export function verifyAllInvariants(state: FichaState): {
  allValid: boolean;
  mainViolations: string[];
  sectionViolations: string[];
} {
  const mainCheck = checkAllInvariants(state);
  const sectionCheck = checkSectionInvariants(state);

  return {
    allValid: mainCheck.valid && sectionCheck.valid,
    mainViolations: mainCheck.violations,
    sectionViolations: sectionCheck.violations,
  };
}
