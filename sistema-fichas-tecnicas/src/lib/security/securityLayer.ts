/**
 * Security Layer - Sanitización, validación de tamaños y base64
 * Requirements: 1.3, 1.10
 * 
 * Proporciona funciones de seguridad para:
 * - Sanitización HTML (DOMPurify)
 * - Validación de tamaños (ficha, fotos)
 * - Validación de base64
 */

/**
 * Límites de tamaño
 */
export interface SizeLimits {
  maxFichaSize: number; // bytes
  maxPhotoSize: number; // bytes
  maxPhotoCount: number;
  maxBase64Size: number; // bytes
  maxFieldLength: number; // caracteres
}

const DEFAULT_SIZE_LIMITS: SizeLimits = {
  maxFichaSize: 50 * 1024 * 1024, // 50 MB
  maxPhotoSize: 10 * 1024 * 1024, // 10 MB
  maxPhotoCount: 100,
  maxBase64Size: 15 * 1024 * 1024, // 15 MB
  maxFieldLength: 10000, // caracteres
};

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Capa de seguridad
 */
export class SecurityLayer {
  private sizeLimits: SizeLimits;

  constructor(sizeLimits: Partial<SizeLimits> = {}) {
    this.sizeLimits = { ...DEFAULT_SIZE_LIMITS, ...sizeLimits };
  }

  /**
   * Sanitiza HTML usando DOMPurify
   * Nota: En un entorno real, usaríamos la librería DOMPurify
   * Por ahora, implementamos una sanitización básica
   */
  sanitizeHTML(html: string): string {
    if (typeof html !== 'string') return '';

    // Crear un elemento temporal para parsear HTML
    const temp = document.createElement('div');
    temp.textContent = html;

    // Remover scripts y atributos peligrosos
    const sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '');

    return sanitized;
  }

  /**
   * Sanitiza texto plano (remover caracteres de control)
   */
  sanitizeText(text: string): string {
    if (typeof text !== 'string') return '';

    // Remover caracteres de control (excepto newline, tab)
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Valida el tamaño de una ficha
   */
  validateFichaSize(fichaData: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const jsonString = JSON.stringify(fichaData);
      const sizeInBytes = new Blob([jsonString]).size;

      if (sizeInBytes > this.sizeLimits.maxFichaSize) {
        errors.push(
          `Ficha size (${this.formatBytes(sizeInBytes)}) exceeds limit (${this.formatBytes(this.sizeLimits.maxFichaSize)})`
        );
      }

      if (sizeInBytes > this.sizeLimits.maxFichaSize * 0.8) {
        warnings.push(
          `Ficha size is approaching limit (${this.formatBytes(sizeInBytes)} / ${this.formatBytes(this.sizeLimits.maxFichaSize)})`
        );
      }
    } catch (error) {
      errors.push(`Error calculating ficha size: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida el tamaño de una foto
   */
  validatePhotoSize(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (file.size > this.sizeLimits.maxPhotoSize) {
      errors.push(
        `Photo size (${this.formatBytes(file.size)}) exceeds limit (${this.formatBytes(this.sizeLimits.maxPhotoSize)})`
      );
    }

    if (file.size > this.sizeLimits.maxPhotoSize * 0.8) {
      warnings.push(
        `Photo size is approaching limit (${this.formatBytes(file.size)} / ${this.formatBytes(this.sizeLimits.maxPhotoSize)})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la cantidad de fotos
   */
  validatePhotoCount(count: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (count > this.sizeLimits.maxPhotoCount) {
      errors.push(
        `Photo count (${count}) exceeds limit (${this.sizeLimits.maxPhotoCount})`
      );
    }

    if (count > this.sizeLimits.maxPhotoCount * 0.8) {
      warnings.push(
        `Photo count is approaching limit (${count} / ${this.sizeLimits.maxPhotoCount})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida una cadena base64
   */
  validateBase64(base64String: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar formato base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64String)) {
      errors.push('Invalid base64 format');
    }

    // Validar tamaño
    if (base64String.length > this.sizeLimits.maxBase64Size) {
      errors.push(
        `Base64 size (${this.formatBytes(base64String.length)}) exceeds limit (${this.formatBytes(this.sizeLimits.maxBase64Size)})`
      );
    }

    if (base64String.length > this.sizeLimits.maxBase64Size * 0.8) {
      warnings.push(
        `Base64 size is approaching limit (${this.formatBytes(base64String.length)} / ${this.formatBytes(this.sizeLimits.maxBase64Size)})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la longitud de un campo
   */
  validateFieldLength(value: string, fieldName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value.length > this.sizeLimits.maxFieldLength) {
      errors.push(
        `Field "${fieldName}" length (${value.length}) exceeds limit (${this.sizeLimits.maxFieldLength})`
      );
    }

    if (value.length > this.sizeLimits.maxFieldLength * 0.8) {
      warnings.push(
        `Field "${fieldName}" length is approaching limit (${value.length} / ${this.sizeLimits.maxFieldLength})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un tipo MIME
   */
  validateMimeType(file: File, allowedTypes: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un archivo de imagen
   */
  validateImageFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tipo MIME
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const mimeValidation = this.validateMimeType(file, allowedImageTypes);
    errors.push(...mimeValidation.errors);
    warnings.push(...mimeValidation.warnings);

    // Validar tamaño
    const sizeValidation = this.validatePhotoSize(file);
    errors.push(...sizeValidation.errors);
    warnings.push(...sizeValidation.warnings);

    // Validar extensión
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(extension)) {
      errors.push(`File extension "${extension}" is not allowed`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un archivo Excel
   */
  validateExcelFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tipo MIME
    const allowedExcelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const mimeValidation = this.validateMimeType(file, allowedExcelTypes);
    errors.push(...mimeValidation.errors);
    warnings.push(...mimeValidation.warnings);

    // Validar tamaño (Excel puede ser más grande)
    if (file.size > this.sizeLimits.maxFichaSize) {
      errors.push(
        `Excel file size (${this.formatBytes(file.size)}) exceeds limit (${this.formatBytes(this.sizeLimits.maxFichaSize)})`
      );
    }

    // Validar extensión
    const validExtensions = ['.xlsx', '.xls'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(extension)) {
      errors.push(`File extension "${extension}" is not allowed for Excel files`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Obtiene los límites de tamaño actuales
   */
  getSizeLimits(): SizeLimits {
    return { ...this.sizeLimits };
  }

  /**
   * Actualiza los límites de tamaño
   */
  setSizeLimits(limits: Partial<SizeLimits>): void {
    this.sizeLimits = { ...this.sizeLimits, ...limits };
  }

  /**
   * Formatea bytes a formato legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Instancia global de la capa de seguridad
 */
let globalSecurityLayer: SecurityLayer | null = null;

/**
 * Obtiene la instancia global de la capa de seguridad
 */
export function getSecurityLayer(sizeLimits?: Partial<SizeLimits>): SecurityLayer {
  if (!globalSecurityLayer) {
    globalSecurityLayer = new SecurityLayer(sizeLimits);
  }
  return globalSecurityLayer;
}

/**
 * Sanitiza HTML usando la instancia global
 */
export function sanitizeHTML(html: string): string {
  return getSecurityLayer().sanitizeHTML(html);
}

/**
 * Sanitiza texto usando la instancia global
 */
export function sanitizeText(text: string): string {
  return getSecurityLayer().sanitizeText(text);
}

/**
 * Valida tamaño de ficha usando la instancia global
 */
export function validateFichaSize(fichaData: unknown): ValidationResult {
  return getSecurityLayer().validateFichaSize(fichaData);
}

/**
 * Valida tamaño de foto usando la instancia global
 */
export function validatePhotoSize(file: File): ValidationResult {
  return getSecurityLayer().validatePhotoSize(file);
}

/**
 * Valida base64 usando la instancia global
 */
export function validateBase64(base64String: string): ValidationResult {
  return getSecurityLayer().validateBase64(base64String);
}

/**
 * Valida archivo de imagen usando la instancia global
 */
export function validateImageFile(file: File): ValidationResult {
  return getSecurityLayer().validateImageFile(file);
}

/**
 * Valida archivo Excel usando la instancia global
 */
export function validateExcelFile(file: File): ValidationResult {
  return getSecurityLayer().validateExcelFile(file);
}

/**
 * Resetea la instancia global (útil para testing)
 */
export function resetSecurityLayer(): void {
  globalSecurityLayer = null;
}
