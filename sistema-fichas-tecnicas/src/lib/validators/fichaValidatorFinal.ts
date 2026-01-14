/**
 * Validador Determinístico Final - Validación canónica para PDF y Finalize
 * Requirements: 1.8, 1.9
 * 
 * Función canónica: isFichaValid()
 * Usado por: Generate PDF, Finalize
 * Diferente del validador no bloqueante (pozoValidator.ts)
 * 
 * Este validador es ESTRICTO y determina si una ficha puede ser finalizada
 * o si puede generar un PDF válido.
 */

import type { FichaState, FichaSection } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';

/**
 * Resultado de validación final
 */
export interface FinalValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  invalidFields: string[];
}

/**
 * Configuración de validación final
 */
export interface FinalValidationConfig {
  requireAllSections: boolean;
  requireAllFields: boolean;
  requirePhotos: boolean;
  requireCoordinates: boolean;
  strictMode: boolean;
}

const DEFAULT_CONFIG: FinalValidationConfig = {
  requireAllSections: false, // No requerir todas las secciones
  requireAllFields: false, // No requerir todos los campos
  requirePhotos: false, // No requerir fotos
  requireCoordinates: false, // No requerir coordenadas
  strictMode: false, // Modo no estricto por defecto
};

/**
 * Campos obligatorios mínimos para una ficha válida
 */
const REQUIRED_FIELDS = {
  identificacion: [
    'idPozo',
    'fecha',
    'levanto',
    'estado',
  ],
  ubicacion: [
    'direccion',
    'barrio',
  ],
  componentes: [
    'existeTapa',
    'existeCilindro',
  ],
};

/**
 * Validador determinístico final
 */
export class FichaValidatorFinal {
  private config: FinalValidationConfig;

  constructor(config: Partial<FinalValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Función canónica: Valida si una ficha es válida para PDF/Finalize
   */
  isFichaValid(ficha: FichaState): boolean {
    const result = this.validate(ficha);
    return result.valid;
  }

  /**
   * Valida una ficha completa
   */
  validate(ficha: FichaState): FinalValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    // Validar estructura básica
    if (!ficha.id) {
      errors.push('Ficha ID is missing');
    }

    if (!ficha.pozoId) {
      errors.push('Pozo ID is missing');
    }

    if (!ficha.sections || ficha.sections.length === 0) {
      errors.push('Ficha has no sections');
    }

    // Validar secciones
    const sectionValidation = this.validateSections(ficha.sections);
    errors.push(...sectionValidation.errors);
    warnings.push(...sectionValidation.warnings);
    missingFields.push(...sectionValidation.missingFields);
    invalidFields.push(...sectionValidation.invalidFields);

    // Validar customizaciones
    if (!ficha.customizations) {
      errors.push('Ficha customizations are missing');
    }

    // Validar estado
    const validStatuses = ['draft', 'editing', 'complete', 'finalized'];
    if (!validStatuses.includes(ficha.status)) {
      errors.push(`Invalid ficha status: ${ficha.status}`);
    }

    // Validar timestamps
    if (!ficha.lastModified || typeof ficha.lastModified !== 'number') {
      errors.push('Invalid lastModified timestamp');
    }

    if (!ficha.version || typeof ficha.version !== 'number') {
      errors.push('Invalid version number');
    }

    // En modo estricto, requerir más validaciones
    if (this.config.strictMode) {
      if (this.config.requireAllSections && ficha.sections.length < 5) {
        warnings.push('Ficha has fewer than 5 sections (expected: identificacion, ubicacion, componentes, tuberias, fotos)');
      }

      if (this.config.requirePhotos) {
        const fotosSection = ficha.sections.find((s) => s.type === 'fotos');
        if (!fotosSection || !fotosSection.content.images) {
          errors.push('Ficha requires at least one photo');
        }
      }

      if (this.config.requireCoordinates) {
        const identificacionSection = ficha.sections.find((s) => s.type === 'identificacion');
        if (identificacionSection) {
          const hasCoordinates =
            identificacionSection.content.coordenadaX &&
            identificacionSection.content.coordenadaY;
          if (!hasCoordinates) {
            errors.push('Ficha requires coordinates (X, Y)');
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      invalidFields,
    };
  }

  /**
   * Valida las secciones de una ficha
   */
  private validateSections(sections: FichaSection[]): {
    errors: string[];
    warnings: string[];
    missingFields: string[];
    invalidFields: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    if (!sections || sections.length === 0) {
      errors.push('No sections found');
      return { errors, warnings, missingFields, invalidFields };
    }

    // Validar cada sección
    for (const section of sections) {
      const sectionValidation = this.validateSection(section);
      errors.push(...sectionValidation.errors);
      warnings.push(...sectionValidation.warnings);
      missingFields.push(...sectionValidation.missingFields);
      invalidFields.push(...sectionValidation.invalidFields);
    }

    return { errors, warnings, missingFields, invalidFields };
  }

  /**
   * Valida una sección individual
   */
  private validateSection(section: FichaSection): {
    errors: string[];
    warnings: string[];
    missingFields: string[];
    invalidFields: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    // Validar estructura básica
    if (!section.id) {
      errors.push(`Section has no ID`);
    }

    if (!section.type) {
      errors.push(`Section has no type`);
    }

    if (typeof section.order !== 'number') {
      errors.push(`Section has invalid order`);
    }

    if (typeof section.visible !== 'boolean') {
      errors.push(`Section has invalid visible flag`);
    }

    if (!section.content || typeof section.content !== 'object') {
      errors.push(`Section ${section.type} has no content`);
      return { errors, warnings, missingFields, invalidFields };
    }

    // Validar campos requeridos por sección
    const requiredFields = REQUIRED_FIELDS[section.type as keyof typeof REQUIRED_FIELDS];
    if (requiredFields) {
      for (const field of requiredFields) {
        const fieldValue = section.content[field];

        if (!fieldValue) {
          missingFields.push(`${section.type}.${field}`);
          if (this.config.requireAllFields) {
            errors.push(`Required field missing: ${section.type}.${field}`);
          } else {
            warnings.push(`Recommended field missing: ${section.type}.${field}`);
          }
        } else if (!fieldValue.value || fieldValue.value.trim() === '') {
          invalidFields.push(`${section.type}.${field}`);
          if (this.config.requireAllFields) {
            errors.push(`Required field is empty: ${section.type}.${field}`);
          } else {
            warnings.push(`Recommended field is empty: ${section.type}.${field}`);
          }
        }
      }
    }

    // Validar contenido de campos
    for (const [fieldName, fieldValue] of Object.entries(section.content)) {
      if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
        // Validar que value sea string
        if (typeof fieldValue.value !== 'string') {
          invalidFields.push(`${section.type}.${fieldName}`);
          errors.push(`Field value must be string: ${section.type}.${fieldName}`);
        }

        // Validar que source sea válido
        const validSources = ['excel', 'manual', 'default'];
        if (!validSources.includes(fieldValue.source)) {
          errors.push(`Invalid field source: ${section.type}.${fieldName}`);
        }
      }
    }

    return { errors, warnings, missingFields, invalidFields };
  }

  /**
   * Valida si una ficha puede ser finalizada
   */
  canFinalize(ficha: FichaState): { canFinalize: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // No se puede finalizar si ya está finalizada
    if (ficha.status === 'finalized') {
      reasons.push('Ficha is already finalized');
      return { canFinalize: false, reasons };
    }

    // Validar que la ficha sea válida
    const validation = this.validate(ficha);
    if (!validation.valid) {
      reasons.push(...validation.errors);
      return { canFinalize: false, reasons };
    }

    // Validar que tenga al menos una sección
    if (!ficha.sections || ficha.sections.length === 0) {
      reasons.push('Ficha must have at least one section');
      return { canFinalize: false, reasons };
    }

    // Validar que tenga datos mínimos
    const hasData = ficha.sections.some((s) =>
      Object.values(s.content).some((f) => f && f.value && f.value.trim() !== '')
    );

    if (!hasData) {
      reasons.push('Ficha must have at least some data');
      return { canFinalize: false, reasons };
    }

    return { canFinalize: true, reasons };
  }

  /**
   * Valida si una ficha puede generar PDF
   */
  canGeneratePDF(ficha: FichaState): { canGenerate: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Validar que la ficha sea válida
    const validation = this.validate(ficha);
    if (!validation.valid) {
      reasons.push(...validation.errors);
      return { canGenerate: false, reasons };
    }

    // Validar que tenga secciones
    if (!ficha.sections || ficha.sections.length === 0) {
      reasons.push('Ficha must have at least one section to generate PDF');
      return { canGenerate: false, reasons };
    }

    // Validar que tenga datos
    const hasData = ficha.sections.some((s) =>
      Object.values(s.content).some((f) => f && f.value && f.value.trim() !== '')
    );

    if (!hasData) {
      reasons.push('Ficha must have at least some data to generate PDF');
      return { canGenerate: false, reasons };
    }

    return { canGenerate: true, reasons };
  }

  /**
   * Obtiene un resumen de validación
   */
  getSummary(ficha: FichaState): {
    isValid: boolean;
    canFinalize: boolean;
    canGeneratePDF: boolean;
    errorCount: number;
    warningCount: number;
    completeness: number; // 0-100
  } {
    const validation = this.validate(ficha);
    const finalizeCheck = this.canFinalize(ficha);
    const pdfCheck = this.canGeneratePDF(ficha);

    // Calcular completeness
    let filledFields = 0;
    let totalFields = 0;

    for (const section of ficha.sections) {
      for (const field of Object.values(section.content)) {
        if (field && typeof field === 'object' && 'value' in field) {
          totalFields++;
          if (field.value && field.value.trim() !== '') {
            filledFields++;
          }
        }
      }
    }

    const completeness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    return {
      isValid: validation.valid,
      canFinalize: finalizeCheck.canFinalize,
      canGeneratePDF: pdfCheck.canGenerate,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      completeness,
    };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): FinalValidationConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración
   */
  setConfig(config: Partial<FinalValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Instancia global del validador final
 */
let globalFinalValidator: FichaValidatorFinal | null = null;

/**
 * Obtiene la instancia global del validador final
 */
export function getFichaValidatorFinal(
  config?: Partial<FinalValidationConfig>
): FichaValidatorFinal {
  if (!globalFinalValidator) {
    globalFinalValidator = new FichaValidatorFinal(config);
  }
  return globalFinalValidator;
}

/**
 * Función canónica: Valida si una ficha es válida
 */
export function isFichaValid(ficha: FichaState): boolean {
  return getFichaValidatorFinal().isFichaValid(ficha);
}

/**
 * Valida una ficha completa
 */
export function validateFichaFinal(ficha: FichaState): FinalValidationResult {
  return getFichaValidatorFinal().validate(ficha);
}

/**
 * Verifica si una ficha puede ser finalizada
 */
export function canFinalizeFicha(ficha: FichaState): { canFinalize: boolean; reasons: string[] } {
  return getFichaValidatorFinal().canFinalize(ficha);
}

/**
 * Verifica si una ficha puede generar PDF
 */
export function canGeneratePDF(ficha: FichaState): { canGenerate: boolean; reasons: string[] } {
  return getFichaValidatorFinal().canGeneratePDF(ficha);
}

/**
 * Obtiene un resumen de validación
 */
export function getFichaValidationSummary(ficha: FichaState): {
  isValid: boolean;
  canFinalize: boolean;
  canGeneratePDF: boolean;
  errorCount: number;
  warningCount: number;
  completeness: number;
} {
  return getFichaValidatorFinal().getSummary(ficha);
}

/**
 * Resetea el validador global (útil para testing)
 */
export function resetFichaValidatorFinal(): void {
  globalFinalValidator = null;
}
