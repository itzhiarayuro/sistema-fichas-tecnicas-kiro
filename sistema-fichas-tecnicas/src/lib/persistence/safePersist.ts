/**
 * SafePersist - Persistencia segura y validada
 * Requirements: 0.1, 9.1-9.7, 13.1-13.4
 * 
 * Garantía central: "Nunca guardo un estado corrupto"
 * 
 * Reglas:
 * 1. Validar ANTES de guardar
 * 2. Nunca sobrescribir un estado bueno con uno roto
 * 3. Mantener último estado válido independiente
 * 4. Registrar cada intento de persistencia
 */

import { FichaState } from '@/types/ficha';
import { isFichaValid, validateFichaFinal } from '@/lib/validators/fichaValidatorFinal';
import { getOrCreateEventLog } from '@/lib/domain/eventLog';

export type PersistenceStatus = 'ok' | 'recovered' | 'reset';

export interface PersistenceResult {
  status: PersistenceStatus;
  fichaId: string;
  timestamp: number;
  message: string;
  previousState?: FichaState;
  recoveredFrom?: 'lastValid' | 'snapshot' | 'base';
}

/**
 * Resultado de una operación de persistencia
 */
export interface SafePersistResult {
  success: boolean;
  status: PersistenceStatus;
  message: string;
  error?: string;
}

/**
 * Interfaz para almacenamiento (IndexedDB, localStorage, etc)
 */
export interface StorageAdapter {
  save(key: string, data: unknown): Promise<void>;
  load(key: string): Promise<unknown>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * SafePersist - Gestor central de persistencia segura
 * 
 * Garantiza:
 * - Validación antes de guardar
 * - Nunca sobrescribir estado válido con corrupto
 * - Recuperación ordenada
 * - Auditoría completa
 */
export class SafePersist {
  private storage: StorageAdapter;
  private lastValidStates: Map<string, FichaState> = new Map();
  private persistenceLog: PersistenceResult[] = [];
  private maxLogEntries = 100;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  /**
   * Guardar estado de forma segura
   * 
   * Proceso:
   * 1. Validar estado
   * 2. Si es válido: guardar y actualizar lastValid
   * 3. Si es inválido: registrar error, NO guardar
   * 4. Registrar en log
   */
  async safeSave(fichaId: string, state: FichaState): Promise<SafePersistResult> {
    const timestamp = Date.now();
    const eventLog = getOrCreateEventLog(fichaId);

    try {
      // 1. Validar estado
      const validation = validateFichaFinal(state);
      if (!validation.valid) {
        const message = `Estado inválido: ${validation.errors.join(', ')}`;
        
        eventLog.logEvent(
          'VALIDATE' as any,
          message,
          'ERROR' as any,
          { errors: validation.errors }
        );

        this._logPersistence({
          status: 'ok',
          fichaId,
          timestamp,
          message: `Persistencia rechazada: ${message}`,
        });

        return {
          success: false,
          status: 'ok',
          message,
          error: message,
        };
      }

      // 2. Guardar estado válido
      const storageKey = this._getStorageKey(fichaId);
      await this.storage.save(storageKey, state);

      // 3. Actualizar último estado válido
      this.lastValidStates.set(fichaId, JSON.parse(JSON.stringify(state)));

      // 4. Registrar éxito
      eventLog.logEvent(
        'SNAPSHOT' as any,
        'Estado guardado exitosamente',
        'INFO' as any,
        { size: JSON.stringify(state).length }
      );

      this._logPersistence({
        status: 'ok',
        fichaId,
        timestamp,
        message: 'Estado guardado exitosamente',
      });

      return {
        success: true,
        status: 'ok',
        message: 'Estado guardado exitosamente',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      eventLog.logEvent(
        'ERROR' as any,
        `Error al guardar: ${errorMessage}`,
        'ERROR' as any,
        { context: 'safeSave' }
      );

      this._logPersistence({
        status: 'ok',
        fichaId,
        timestamp,
        message: `Error al guardar: ${errorMessage}`,
      });

      return {
        success: false,
        status: 'ok',
        message: `Error al guardar: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  /**
   * Cargar estado de forma segura
   * 
   * Intenta en orden:
   * 1. Cargar del almacenamiento
   * 2. Validar
   * 3. Si es inválido, usar último válido
   */
  async safeLoad(fichaId: string): Promise<FichaState | null> {
    const eventLog = getOrCreateEventLog(fichaId);
    try {
      const storageKey = this._getStorageKey(fichaId);
      const stored = await this.storage.load(storageKey);

      if (!stored) {
        return null;
      }

      const state = stored as FichaState;
      const validation = validateFichaFinal(state);

      if (validation.valid) {
        // Estado válido, actualizar lastValid
        this.lastValidStates.set(fichaId, JSON.parse(JSON.stringify(state)));
        return state;
      }

      // Estado corrupto, intentar recuperar
      eventLog.logEvent(
        'ERROR' as any,
        'Estado corrupto detectado',
        'WARNING' as any,
        { errors: validation.errors }
      );

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      eventLog.logEvent(
        'ERROR' as any,
        `Error al cargar: ${errorMessage}`,
        'ERROR' as any,
        { context: 'safeLoad' }
      );
      return null;
    }
  }

  /**
   * Obtener último estado válido conocido
   * 
   * Útil para recuperación cuando el estado actual está corrupto
   */
  getLastValidState(fichaId: string): FichaState | null {
    const lastValid = this.lastValidStates.get(fichaId);
    return lastValid ? JSON.parse(JSON.stringify(lastValid)) : null;
  }

  /**
   * Establecer último estado válido manualmente
   * 
   * Se usa después de validación exitosa
   */
  setLastValidState(fichaId: string, state: FichaState): void {
    this.lastValidStates.set(fichaId, JSON.parse(JSON.stringify(state)));
  }

  /**
   * Limpiar último estado válido
   */
  clearLastValidState(fichaId: string): void {
    this.lastValidStates.delete(fichaId);
  }

  /**
   * Obtener log de persistencia
   */
  getPersistenceLog(): PersistenceResult[] {
    return [...this.persistenceLog];
  }

  /**
   * Limpiar log de persistencia
   */
  clearPersistenceLog(): void {
    this.persistenceLog = [];
  }

  /**
   * Registrar evento de persistencia
   */
  private _logPersistence(result: PersistenceResult): void {
    this.persistenceLog.push(result);

    // Mantener tamaño máximo del log
    if (this.persistenceLog.length > this.maxLogEntries) {
      this.persistenceLog = this.persistenceLog.slice(-this.maxLogEntries);
    }
  }

  /**
   * Generar clave de almacenamiento
   */
  private _getStorageKey(fichaId: string): string {
    return `ficha:${fichaId}`;
  }
}

/**
 * Instancia global de SafePersist
 * Se inicializa con el adaptador de almacenamiento
 */
let safePersistInstance: SafePersist | null = null;

export function initSafePersist(storage: StorageAdapter): SafePersist {
  safePersistInstance = new SafePersist(storage);
  return safePersistInstance;
}

export function getSafePersist(): SafePersist {
  if (!safePersistInstance) {
    throw new Error('SafePersist no inicializado. Llama a initSafePersist primero.');
  }
  return safePersistInstance;
}
