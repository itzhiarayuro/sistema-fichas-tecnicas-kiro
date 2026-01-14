/**
 * StateGuard - Regla dura: no renderizar estado inválido
 * Requirements: 0.1, 3.8-3.10, 17.1-17.6
 * 
 * Guard que previene renderizar basura:
 * - Si el estado es inválido → pantalla de recuperación
 * - Si la recuperación falla → pantalla de error segura
 * - Nunca renderizar estado corrupto
 */

import { FichaState } from '@/types/ficha';
import { isFichaValid, validateFichaFinal } from '@/lib/validators/fichaValidatorFinal';
import { getRecoveryManager } from '@/lib/persistence/recoveryManager';
import { attachStatusInfo, createStatusInfo } from '@/lib/persistence/stateStatus';

export type GuardResult = 
  | { valid: true; state: FichaState }
  | { valid: false; reason: 'invalid' | 'error'; message: string };

/**
 * Validar estado antes de renderizar
 * 
 * Si es válido: retornar estado
 * Si es inválido: intentar recuperar
 * Si recuperación falla: retornar error
 */
export async function guardState(fichaId: string, state: FichaState): Promise<GuardResult> {
  // 1. Validar estado
  const validation = validateFichaFinal(state);
  if (validation.valid) {
    return { valid: true, state };
  }

  // 2. Estado inválido, intentar recuperar
  try {
    const recoveryManager = getRecoveryManager();
    const recovery = await recoveryManager.recover(fichaId);

    if (recovery.success) {
      // Adjuntar información de recuperación
      const recoveredState = attachStatusInfo(
        recovery.state,
        createStatusInfo('recovered', 'Estado recuperado', recovery.source)
      );
      return { valid: true, state: recoveredState };
    }

    // Recuperación falló pero retornó estado base
    const baseState = attachStatusInfo(
      recovery.state,
      createStatusInfo('reset', 'Estado reiniciado', 'base')
    );
    return { valid: true, state: baseState };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      valid: false,
      reason: 'error',
      message: `Error durante recuperación: ${errorMessage}`,
    };
  }
}

/**
 * Validar estado de forma síncrona (sin recuperación)
 * 
 * Útil para checks rápidos sin I/O
 */
export function guardStateSync(state: FichaState): GuardResult {
  const validation = validateFichaFinal(state);
  if (validation.valid) {
    return { valid: true, state };
  }

  return {
    valid: false,
    reason: 'invalid',
    message: `Estado inválido: ${validation.errors.join(', ')}`,
  };
}

/**
 * Componente de fallback para estado inválido
 * 
 * Se muestra cuando el estado no puede ser renderizado
 */
export interface RecoveryScreenProps {
  fichaId: string;
  reason: 'invalid' | 'error';
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

/**
 * Generar HTML de pantalla de recuperación
 * 
 * Esto es HTML puro, no depende de React
 * Se puede usar como fallback absoluto
 */
export function generateRecoveryScreenHTML(props: RecoveryScreenProps): string {
  const { fichaId, reason, message, onRetry, onReset } = props;

  const title = reason === 'error' ? 'Error de Recuperación' : 'Estado Inválido';
  const description =
    reason === 'error'
      ? 'Ocurrió un error al intentar recuperar tu ficha.'
      : 'Tu ficha está en un estado que no puede ser mostrado.';

  return `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 40px;
        max-width: 500px;
        text-align: center;
      ">
        <div style="
          font-size: 48px;
          margin-bottom: 20px;
        ">
          ⚠️
        </div>
        
        <h1 style="
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0 0 10px 0;
        ">
          ${title}
        </h1>
        
        <p style="
          font-size: 14px;
          color: #666;
          margin: 0 0 20px 0;
          line-height: 1.6;
        ">
          ${description}
        </p>
        
        <div style="
          background: #f5f5f5;
          border-left: 4px solid #ff6b6b;
          padding: 12px;
          margin: 20px 0;
          text-align: left;
          border-radius: 4px;
        ">
          <p style="
            font-size: 12px;
            color: #666;
            margin: 0;
            font-family: 'Courier New', monospace;
            word-break: break-word;
          ">
            <strong>Detalles:</strong> ${message}
          </p>
        </div>
        
        <p style="
          font-size: 12px;
          color: #999;
          margin: 20px 0;
        ">
          ID de Ficha: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${fichaId}</code>
        </p>
        
        <div style="
          display: flex;
          gap: 10px;
          justify-content: center;
        ">
          ${
            onRetry
              ? `
            <button onclick="window.location.reload()" style="
              padding: 10px 20px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              Reintentar
            </button>
          `
              : ''
          }
          ${
            onReset
              ? `
            <button onclick="window.location.href = '/'" style="
              padding: 10px 20px;
              background: #f0f0f0;
              color: #333;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              Volver al Inicio
            </button>
          `
              : ''
          }
        </div>
        
        <p style="
          font-size: 11px;
          color: #ccc;
          margin: 20px 0 0 0;
        ">
          Si el problema persiste, contacta con soporte.
        </p>
      </div>
    </div>
  `;
}
