/**
 * SafeReset - Reset seguro, explícito y controlado
 * Requirements: 0.1, 12.1-12.4, 13.1-13.4
 * 
 * Permite volver a algo seguro sin romper nada:
 * - Snapshot previo
 * - Estado base
 * - Confirmación explícita
 * 
 * Clave en una demo: el usuario puede recuperarse de cualquier cosa
 */

import { FichaState } from '@/types/ficha';
import { BASE_STATE } from '@/lib/persistence/recoveryManager';
import { getSafePersist } from '@/lib/persistence/safePersist';
import { attachStatusInfo, createStatusInfo } from '@/lib/persistence/stateStatus';
import { getOrCreateEventLog } from '@/lib/domain/eventLog';

export type ResetTarget = 'lastSnapshot' | 'base';

export interface ResetResult {
  success: boolean;
  state: FichaState;
  target: ResetTarget;
  message: string;
  timestamp: number;
}

/**
 * SafeReset - Gestor de reset seguro
 */
export class SafeReset {
  /**
   * Resetear a último snapshot
   * 
   * Intenta:
   * 1. Obtener último snapshot
   * 2. Si existe y es válido, usarlo
   * 3. Si no, resetear a base
   */
  async resetToLastSnapshot(fichaId: string): Promise<ResetResult> {
    const timestamp = Date.now();
    const eventLog = getOrCreateEventLog(fichaId);

    try {
      // Obtener último estado válido
      const lastValid = getSafePersist().getLastValidState(fichaId);

      if (lastValid) {
        const state = attachStatusInfo(
          lastValid,
          createStatusInfo('recovered', 'Ficha restaurada a último snapshot', 'snapshot')
        );

        eventLog.logEvent(
          'RESTORE' as any,
          'Ficha restaurada a último snapshot',
          'INFO' as any,
          { target: 'lastSnapshot' }
        );

        return {
          success: true,
          state,
          target: 'lastSnapshot',
          message: 'Ficha restaurada a último snapshot',
          timestamp,
        };
      }

      // No hay snapshot, resetear a base
      return this.resetToBase(fichaId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      eventLog.logEvent(
        'ERROR' as any,
        `Error al resetear a snapshot: ${errorMessage}`,
        'ERROR' as any,
        { target: 'lastSnapshot' }
      );

      // Fallback a base
      return this.resetToBase(fichaId);
    }
  }

  /**
   * Resetear a estado base
   * 
   * Vuelve a un estado limpio y seguro
   * Siempre funciona
   */
  async resetToBase(fichaId: string): Promise<ResetResult> {
    const timestamp = Date.now();
    const eventLog = getOrCreateEventLog(fichaId);

    try {
      const baseState: FichaState = {
        ...BASE_STATE,
        id: fichaId,
        pozoId: fichaId,
        lastModified: timestamp,
      };

      const state = attachStatusInfo(
        baseState,
        createStatusInfo('reset', 'Ficha reiniciada a estado base', 'base')
      );

      // Guardar de forma segura
      await getSafePersist().safeSave(fichaId, state);

      eventLog.logEvent(
        'RESTORE' as any,
        'Ficha reiniciada a estado base',
        'WARNING' as any,
        { target: 'base' }
      );

      return {
        success: true,
        state,
        target: 'base',
        message: 'Ficha reiniciada a estado base',
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      eventLog.logEvent(
        'ERROR' as any,
        `Error al resetear a base: ${errorMessage}`,
        'ERROR' as any,
        { target: 'base' }
      );

      // Incluso si hay error, retornar estado base
      const baseState: FichaState = {
        ...BASE_STATE,
        id: fichaId,
        pozoId: fichaId,
        lastModified: timestamp,
      };

      return {
        success: false,
        state: baseState,
        target: 'base',
        message: `Error al reiniciar: ${errorMessage}. Usando estado base en memoria.`,
        timestamp,
      };
    }
  }

  /**
   * Resetear con confirmación
   * 
   * Requiere confirmación explícita del usuario
   */
  async resetWithConfirmation(
    fichaId: string,
    target: ResetTarget,
    onConfirm: () => Promise<boolean>
  ): Promise<ResetResult | null> {
    const eventLog = getOrCreateEventLog(fichaId);
    // Pedir confirmación
    const confirmed = await onConfirm();

    if (!confirmed) {
      eventLog.logEvent(
        'RESTORE' as any,
        'Reset cancelado por usuario',
        'INFO' as any,
        { target }
      );
      return null;
    }

    // Ejecutar reset
    if (target === 'lastSnapshot') {
      return this.resetToLastSnapshot(fichaId);
    } else {
      return this.resetToBase(fichaId);
    }
  }
}

/**
 * Instancia global de SafeReset
 */
let safeResetInstance: SafeReset | null = null;

export function initSafeReset(): SafeReset {
  safeResetInstance = new SafeReset();
  return safeResetInstance;
}

export function getSafeReset(): SafeReset {
  if (!safeResetInstance) {
    safeResetInstance = new SafeReset();
  }
  return safeResetInstance;
}
