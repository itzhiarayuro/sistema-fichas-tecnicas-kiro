/**
 * Schema Versioning Layer - Migraciones automáticas y backward compatibility
 * Requirements: 9.1, 16.10
 * 
 * Soporta versiones de esquema (v1, v2, v3, v4) con migraciones automáticas
 * y compatibilidad hacia atrás.
 */

import type { FichaState } from '@/types/ficha';

/**
 * Versión actual del esquema
 */
export const CURRENT_SCHEMA_VERSION = 4;

/**
 * Tipos de esquema por versión
 */
export interface SchemaV1 {
  version: 1;
  id: string;
  pozoId: string;
  status: string;
  sections: unknown[];
  customizations: unknown;
  lastModified: number;
}

export interface SchemaV2 {
  version: 2;
  id: string;
  pozoId: string;
  status: string;
  sections: unknown[];
  customizations: unknown;
  history: unknown[];
  lastModified: number;
}

export interface SchemaV3 {
  version: 3;
  id: string;
  pozoId: string;
  status: string;
  sections: unknown[];
  customizations: unknown;
  history: unknown[];
  errors: unknown[];
  lastModified: number;
  version: number;
}

export interface SchemaV4 {
  version: 4;
  id: string;
  pozoId: string;
  status: string;
  sections: unknown[];
  customizations: unknown;
  history: unknown[];
  errors: unknown[];
  lastModified: number;
  version: number;
  schemaVersion: number;
}

export type AnySchema = SchemaV1 | SchemaV2 | SchemaV3 | SchemaV4;

/**
 * Información de migración
 */
export interface MigrationInfo {
  fromVersion: number;
  toVersion: number;
  timestamp: number;
  success: boolean;
  changes: string[];
}

/**
 * Gestor de versiones de esquema
 */
export class SchemaVersionManager {
  private migrationHistory: MigrationInfo[] = [];

  /**
   * Detecta la versión del esquema
   */
  detectVersion(data: unknown): number {
    if (!data || typeof data !== 'object') return CURRENT_SCHEMA_VERSION;

    const obj = data as Record<string, unknown>;

    // Si tiene schemaVersion explícito, usarlo
    if (typeof obj.schemaVersion === 'number') {
      return obj.schemaVersion;
    }

    // Si tiene version, usarlo
    if (typeof obj.version === 'number') {
      return obj.version;
    }

    // Heurística: detectar por estructura
    if ('errors' in obj && 'history' in obj) {
      return 3; // V3 o superior
    }

    if ('history' in obj) {
      return 2; // V2
    }

    return 1; // V1 (más antiguo)
  }

  /**
   * Migra datos de cualquier versión a la versión actual
   */
  migrate(data: unknown): FichaState {
    const detectedVersion = this.detectVersion(data);

    if (detectedVersion === CURRENT_SCHEMA_VERSION) {
      return data as FichaState;
    }

    let current = data;
    const changes: string[] = [];

    // Migrar paso a paso
    if (detectedVersion < 2) {
      current = this.migrateV1toV2(current as SchemaV1);
      changes.push('V1 → V2: Added history field');
    }

    if (detectedVersion < 3) {
      current = this.migrateV2toV3(current as SchemaV2);
      changes.push('V2 → V3: Added errors field and version tracking');
    }

    if (detectedVersion < 4) {
      current = this.migrateV3toV4(current as SchemaV3);
      changes.push('V3 → V4: Added explicit schemaVersion field');
    }

    // Registrar migración
    this.migrationHistory.push({
      fromVersion: detectedVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now(),
      success: true,
      changes,
    });

    return current as FichaState;
  }

  /**
   * Migración V1 → V2: Agregar historial
   */
  private migrateV1toV2(data: SchemaV1): SchemaV2 {
    return {
      ...data,
      version: 2,
      history: [],
    };
  }

  /**
   * Migración V2 → V3: Agregar errores y versionado
   */
  private migrateV2toV3(data: SchemaV2): SchemaV3 {
    return {
      ...data,
      version: 3,
      errors: [],
    };
  }

  /**
   * Migración V3 → V4: Agregar schemaVersion explícito
   */
  private migrateV3toV4(data: SchemaV3): SchemaV4 {
    return {
      ...data,
      version: 4,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }

  /**
   * Valida que los datos cumplan con el esquema actual
   */
  validate(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { valid: false, errors };
    }

    const obj = data as Record<string, unknown>;

    // Campos requeridos
    if (typeof obj.id !== 'string') errors.push('Missing or invalid id');
    if (typeof obj.pozoId !== 'string') errors.push('Missing or invalid pozoId');
    if (typeof obj.status !== 'string') errors.push('Missing or invalid status');
    if (!Array.isArray(obj.sections)) errors.push('Missing or invalid sections');
    if (typeof obj.lastModified !== 'number') errors.push('Missing or invalid lastModified');
    if (typeof obj.version !== 'number') errors.push('Missing or invalid version');

    // Validar status
    const validStatuses = ['draft', 'editing', 'complete', 'finalized'];
    if (!validStatuses.includes(obj.status as string)) {
      errors.push(`Invalid status: ${obj.status}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtiene el historial de migraciones
   */
  getMigrationHistory(): MigrationInfo[] {
    return [...this.migrationHistory];
  }

  /**
   * Limpia el historial de migraciones
   */
  clearMigrationHistory(): void {
    this.migrationHistory = [];
  }

  /**
   * Obtiene información del gestor
   */
  getInfo(): {
    currentVersion: number;
    migrationCount: number;
    lastMigration: MigrationInfo | null;
  } {
    return {
      currentVersion: CURRENT_SCHEMA_VERSION,
      migrationCount: this.migrationHistory.length,
      lastMigration: this.migrationHistory[this.migrationHistory.length - 1] || null,
    };
  }
}

/**
 * Instancia global del gestor de versiones
 */
let globalSchemaManager: SchemaVersionManager | null = null;

/**
 * Obtiene la instancia global del gestor de versiones
 */
export function getSchemaVersionManager(): SchemaVersionManager {
  if (!globalSchemaManager) {
    globalSchemaManager = new SchemaVersionManager();
  }
  return globalSchemaManager;
}

/**
 * Migra datos usando el gestor global
 */
export function migrateData(data: unknown): FichaState {
  return getSchemaVersionManager().migrate(data);
}

/**
 * Detecta la versión usando el gestor global
 */
export function detectDataVersion(data: unknown): number {
  return getSchemaVersionManager().detectVersion(data);
}

/**
 * Valida datos usando el gestor global
 */
export function validateData(data: unknown): { valid: boolean; errors: string[] } {
  return getSchemaVersionManager().validate(data);
}

/**
 * Resetea el gestor global (útil para testing)
 */
export function resetSchemaVersionManager(): void {
  globalSchemaManager = null;
}
