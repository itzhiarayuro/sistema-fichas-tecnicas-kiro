/**
 * RecoveryManager - Pipeline único de recuperación
 * Requirements: 0.1, 13.1-13.4, 17.1-17.6
 * 
 * Garantía: "De aquí me recupero así, siempre"
 * 
 * Orden de recuperación (inmutable):
 * 1. Último estado válido (lastValidState)
 * 2. Snapshots (más reciente primero)
 * 3. Estado base (BASE_STATE)
 * 
 * Nunca falla - siempre hay un fallback
 */

import { FichaState } from '@/types/ficha';
import { getSafePersist } from '@/lib/persistence/safePersist';
import { getOrCreateEventLog } from '@/lib/domain/eventLog';
import { isFichaValid, validateFichaFinal } from '@/lib/validators/fichaValidatorFinal';

export type RecoverySource = 'lastValid' | 'snapshot' | 'base';

export interface RecoveryResult {
  success: boolean;
  state: FichaState;
  source: RecoverySource;
  message: string;
  timestamp: number;
}

/**
 * Estado base inmutable y canónico
 * 
 * Este es el último fallback absoluto.
 * Siempre es válido, siempre es renderizable.
 */
export const BASE_STATE: FichaState = {
  id: '',
  pozoId: '',
  status: 'draft',
  sections: [],
  customizations: {
    colors: {
      headerBg: '#1F4E79',
      headerText: '#FFFFFF',
      sectionBg: '#F5F5F5',
      sectionText: '#333333',
      labelText: '#666666',
      valueText: '#000000',
      borderColor: '#CCCCCC',
    },
    fonts: {
      titleSize: 16,
      labelSize: 12,
      valueSize: 14,
      fontFamily: 'Inter',
    },
    spacing: {
      sectionGap: 16,
      fieldGap: 8,
      padding: 12,
      margin: 8,
    },
    template: 'default',
    isGlobal: false,
  },
  history: [],
  errors: [],
  lastModified: Date.now(),
  version: 1,
};

/**
 * Interfaz para acceso a snapshots
 */
export interface SnapshotStore {
  getLatestSnapshot(fichaId: string): Promise<FichaState | null>;
  getAllSnapshots(fichaId: string): Promise<FichaState[]>;
}

/**
 * RecoveryManager - Gestor central de recuperación
 * 
 * Responsabilidades:
 * - Intentar recuperación en orden fijo
 * - Registrar cada intento
 * - Garantizar que siempre hay un estado válido
 * - Notificar al usuario sobre recuperación
 */
export class RecoveryManager {
  private snapshotStore: SnapshotStore;
  private recoveryLog: RecoveryResult[] = [];
  private maxLogEntries = 50;

  constructor(snapshotStore: SnapshotStore) {
    this.snapshotStore = snapshotStore;
  }

  /**
   * Recuperar estado usando pipeline ordenado
   * 
   * Intenta en orden:
   * 1. Último estado válido
   * 2. Snapshots (más reciente primero)
   * 3. Estado base
   * 
   * Nunca falla - siempre retorna un estado válido
   */
  async recover(fichaId: string): Promise<RecoveryResult> {
    const timestamp = Date.now();
    const eventLog = getOrCreateEventLog(fichaId);

    try {
      // 1. Intentar último estado válido
      const lastValid = getSafePersist().getLastValidState(fichaId);
      if (lastValid && validateFichaFinal(lastValid).valid) {
        const result: RecoveryResult = {
          success: true,
          state: lastValid,
          source: 'lastValid',
          message: 'Recuperado desde último estado válido',
          timestamp,
        };
        this._logRecovery(result);
        eventLog.logEvent(
          'RESTORE' as any,
          'Recuperado desde último estado válido',
          'INFO' as any,
          { source: 'lastValid' }
        );
        return result;
      }

      // 2. Intentar snapshots
      const snapshots = await this.snapshotStore.getAllSnapshots(fichaId);
      for (const snapshot of snapshots) {
        if (validateFichaFinal(snapshot).valid) {
          const result: RecoveryResult = {
            success: true,
            state: snapshot,
            source: 'snapshot',
            message: 'Recuperado desde snapshot',
            timestamp,
          };
          this._logRecovery(result);
          eventLog.logEvent(
            'RESTORE' as any,
            'Recuperado desde snapshot',
            'INFO' as any,
            { source: 'snapshot' }
          );
          return result;
        }
      }

      // 3. Fallback a estado base
      const baseState: FichaState = {
        ...BASE_STATE,
        id: fichaId,
        pozoId: fichaId,
        lastModified: timestamp,
      };

      const result: RecoveryResult = {
        success: true,
        state: baseState,
        source: 'base',
        message: 'Recuperado desde estado base (reinicio)',
        timestamp,
      };
      this._logRecovery(result);
      eventLog.logEvent(
        'RESTORE' as any,
        'Recuperado desde estado base',
        'WARNING' as any,
        { source: 'base' }
      );
      return result;
    } catch (error) {
      // Incluso si hay error, retornar estado base
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const baseState: FichaState = {
        ...BASE_STATE,
        id: fichaId,
        pozoId: fichaId,
        lastModified: timestamp,
      };

      const result: RecoveryResult = {
        success: false,
        state: baseState,
        source: 'base',
        message: `Error durante recuperación: ${errorMessage}. Usando estado base.`,
        timestamp,
      };
      this._logRecovery(result);
      eventLog.logEvent(
        'ERROR' as any,
        `Error durante recuperación: ${errorMessage}`,
        'ERROR' as any,
        { context: 'recover' }
      );
      return result;
    }
  }

  /**
   * Validar y recuperar si es necesario
   * 
   * Si el estado es válido, retornarlo.
   * Si es inválido, recuperar.
   */
  async validateAndRecover(fichaId: string, state: FichaState): Promise<RecoveryResult> {
    const validation = validateFichaFinal(state);

    if (validation.valid) {
      // Estado válido, no necesita recuperación
      return {
        success: true,
        state,
        source: 'lastValid',
        message: 'Estado válido',
        timestamp: Date.now(),
      };
    }

    // Estado inválido, recuperar
    const eventLog = getOrCreateEventLog(fichaId);
    eventLog.logEvent(
      'VALIDATE' as any,
      'Estado inválido detectado',
      'WARNING' as any,
      { errors: validation.errors }
    );

    return this.recover(fichaId);
  }

  /**
   * Obtener log de recuperación
   */
  getRecoveryLog(): RecoveryResult[] {
    return [...this.recoveryLog];
  }

  /**
   * Limpiar log de recuperación
   */
  clearRecoveryLog(): void {
    this.recoveryLog = [];
  }

  /**
   * Registrar evento de recuperación
   */
  private _logRecovery(result: RecoveryResult): void {
    this.recoveryLog.push(result);

    // Mantener tamaño máximo del log
    if (this.recoveryLog.length > this.maxLogEntries) {
      this.recoveryLog = this.recoveryLog.slice(-this.maxLogEntries);
    }
  }
}

/**
 * Instancia global de RecoveryManager
 */
let recoveryManagerInstance: RecoveryManager | null = null;

export function initRecoveryManager(snapshotStore: SnapshotStore): RecoveryManager {
  recoveryManagerInstance = new RecoveryManager(snapshotStore);
  return recoveryManagerInstance;
}

export function getRecoveryManager(): RecoveryManager {
  if (!recoveryManagerInstance) {
    throw new Error('RecoveryManager no inicializado. Llama a initRecoveryManager primero.');
  }
  return recoveryManagerInstance;
}
