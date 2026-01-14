/**
 * StateStatus - Concepto formal de "estado recuperado"
 * Requirements: 0.1, 13.1-13.4, 17.1-17.6
 * 
 * Cada estado tiene un status que explica su condición:
 * - ok: Estado normal, sin problemas
 * - recovered: Estado fue recuperado de un fallo
 * - reset: Estado fue reiniciado a base
 * 
 * Esto permite:
 * - Saber qué pasó
 * - Comunicar al usuario
 * - Tomar decisiones en la UI
 */

import { FichaState } from '@/types/ficha';

export type StateStatusType = 'ok' | 'recovered' | 'reset';

/**
 * Información sobre el status de un estado
 */
export interface StateStatusInfo {
  status: StateStatusType;
  message: string;
  timestamp: number;
  recoveredFrom?: 'lastValid' | 'snapshot' | 'base';
  userMessage: string; // Mensaje amigable para mostrar al usuario
}

/**
 * Extensión de FichaState con información de status
 */
export interface FichaStateWithStatus extends FichaState {
  _statusInfo?: StateStatusInfo;
}

/**
 * Crear información de status
 */
export function createStatusInfo(
  status: StateStatusType,
  message: string,
  recoveredFrom?: 'lastValid' | 'snapshot' | 'base'
): StateStatusInfo {
  const userMessages: Record<StateStatusType, string> = {
    ok: 'Tu ficha está en buen estado',
    recovered: 'Tu ficha fue recuperada de un estado anterior',
    reset: 'Tu ficha fue reiniciada. Algunos cambios pueden haberse perdido.',
  };

  return {
    status,
    message,
    timestamp: Date.now(),
    recoveredFrom,
    userMessage: userMessages[status],
  };
}

/**
 * Adjuntar información de status a un estado
 */
export function attachStatusInfo(
  state: FichaState,
  statusInfo: StateStatusInfo
): FichaStateWithStatus {
  return {
    ...state,
    _statusInfo: statusInfo,
  };
}

/**
 * Obtener información de status de un estado
 */
export function getStatusInfo(state: FichaStateWithStatus): StateStatusInfo | undefined {
  return state._statusInfo;
}

/**
 * Verificar si un estado fue recuperado
 */
export function isRecovered(state: FichaStateWithStatus): boolean {
  return state._statusInfo?.status === 'recovered' || state._statusInfo?.status === 'reset';
}

/**
 * Obtener mensaje de status para mostrar al usuario
 */
export function getStatusMessage(state: FichaStateWithStatus): string | null {
  if (!state._statusInfo) {
    return null;
  }

  const { status, userMessage, recoveredFrom } = state._statusInfo;

  if (status === 'ok') {
    return null; // No mostrar mensaje si está ok
  }

  if (status === 'recovered') {
    return `${userMessage} (desde ${recoveredFrom || 'backup'})`;
  }

  if (status === 'reset') {
    return `${userMessage} Algunos cambios pueden haberse perdido.`;
  }

  return userMessage;
}

/**
 * Limpiar información de status
 * Útil cuando el usuario confirma que vio el mensaje
 */
export function clearStatusInfo(state: FichaStateWithStatus): FichaState {
  const { _statusInfo, ...cleanState } = state;
  return cleanState as FichaState;
}
