/**
 * State Machine explícito para Fichas Técnicas
 * Requirements: 16.1-16.5
 * 
 * Define estados formales y transiciones válidas para fichas.
 * Cada transición es validada y registrada en el historial.
 */

import type { FichaStatus } from '@/types/ficha';

/**
 * Estados válidos de una ficha
 */
export type FichaStateMachineState = 'draft' | 'editing' | 'complete' | 'finalized';

/**
 * Eventos que disparan transiciones
 */
export enum FichaStateMachineEvent {
  START_EDITING = 'START_EDITING',
  COMPLETE = 'COMPLETE',
  FINALIZE = 'FINALIZE',
  RESET = 'RESET',
  REVERT = 'REVERT',
}

/**
 * Transición de estado
 */
export interface StateTransition {
  id: string;
  fromState: FichaStateMachineState;
  toState: FichaStateMachineState;
  event: FichaStateMachineEvent;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Configuración de transiciones válidas
 * Define qué transiciones son permitidas desde cada estado
 */
const VALID_TRANSITIONS: Record<FichaStateMachineState, FichaStateMachineEvent[]> = {
  draft: [
    FichaStateMachineEvent.START_EDITING,
    FichaStateMachineEvent.FINALIZE,
  ],
  editing: [
    FichaStateMachineEvent.COMPLETE,
    FichaStateMachineEvent.FINALIZE,
    FichaStateMachineEvent.RESET,
  ],
  complete: [
    FichaStateMachineEvent.FINALIZE,
    FichaStateMachineEvent.REVERT,
  ],
  finalized: [
    // Finalized state is terminal - no transitions allowed
  ],
};

/**
 * Mapeo de eventos a estados destino
 */
const EVENT_TO_STATE: Record<FichaStateMachineEvent, FichaStateMachineState> = {
  [FichaStateMachineEvent.START_EDITING]: 'editing',
  [FichaStateMachineEvent.COMPLETE]: 'complete',
  [FichaStateMachineEvent.FINALIZE]: 'finalized',
  [FichaStateMachineEvent.RESET]: 'draft',
  [FichaStateMachineEvent.REVERT]: 'editing',
};

/**
 * Máquina de estados para fichas
 */
export class FichaStateMachine {
  private currentState: FichaStateMachineState;
  private transitions: StateTransition[] = [];
  private fichaId: string;

  constructor(fichaId: string, initialState: FichaStateMachineState = 'draft') {
    this.fichaId = fichaId;
    this.currentState = initialState;
  }

  /**
   * Obtiene el estado actual
   */
  getState(): FichaStateMachineState {
    return this.currentState;
  }

  /**
   * Verifica si una transición es válida
   */
  canTransition(event: FichaStateMachineEvent): boolean {
    const validEvents = VALID_TRANSITIONS[this.currentState];
    return validEvents.includes(event);
  }

  /**
   * Obtiene los eventos válidos desde el estado actual
   */
  getValidEvents(): FichaStateMachineEvent[] {
    return VALID_TRANSITIONS[this.currentState];
  }

  /**
   * Realiza una transición de estado
   * @throws Error si la transición no es válida
   */
  transition(event: FichaStateMachineEvent, metadata?: Record<string, unknown>): StateTransition {
    if (!this.canTransition(event)) {
      throw new Error(
        `Invalid transition: cannot perform ${event} from state ${this.currentState}`
      );
    }

    const fromState = this.currentState;
    const toState = EVENT_TO_STATE[event];

    const transition: StateTransition = {
      id: crypto.randomUUID(),
      fromState,
      toState,
      event,
      timestamp: Date.now(),
      metadata,
    };

    this.transitions.push(transition);
    this.currentState = toState;

    return transition;
  }

  /**
   * Obtiene el historial de transiciones
   */
  getTransitionHistory(): StateTransition[] {
    return [...this.transitions];
  }

  /**
   * Obtiene el número de transiciones realizadas
   */
  getTransitionCount(): number {
    return this.transitions.length;
  }

  /**
   * Verifica si la ficha está finalizada
   */
  isFinalized(): boolean {
    return this.currentState === 'finalized';
  }

  /**
   * Verifica si la ficha está en edición
   */
  isEditing(): boolean {
    return this.currentState === 'editing';
  }

  /**
   * Verifica si la ficha está completa
   */
  isComplete(): boolean {
    return this.currentState === 'complete';
  }

  /**
   * Verifica si la ficha está en borrador
   */
  isDraft(): boolean {
    return this.currentState === 'draft';
  }

  /**
   * Obtiene información de la máquina de estados
   */
  getInfo(): {
    fichaId: string;
    currentState: FichaStateMachineState;
    validEvents: FichaStateMachineEvent[];
    transitionCount: number;
    isFinalized: boolean;
  } {
    return {
      fichaId: this.fichaId,
      currentState: this.currentState,
      validEvents: this.getValidEvents(),
      transitionCount: this.getTransitionCount(),
      isFinalized: this.isFinalized(),
    };
  }

  /**
   * Serializa la máquina de estados para persistencia
   */
  serialize(): {
    fichaId: string;
    currentState: FichaStateMachineState;
    transitions: StateTransition[];
  } {
    return {
      fichaId: this.fichaId,
      currentState: this.currentState,
      transitions: this.transitions,
    };
  }

  /**
   * Deserializa una máquina de estados desde datos persistidos
   */
  static deserialize(data: {
    fichaId: string;
    currentState: FichaStateMachineState;
    transitions: StateTransition[];
  }): FichaStateMachine {
    const machine = new FichaStateMachine(data.fichaId, data.currentState);
    machine.transitions = data.transitions;
    return machine;
  }
}

/**
 * Registry para máquinas de estado por ficha
 */
const stateMachineRegistry = new Map<string, FichaStateMachine>();

/**
 * Obtiene o crea una máquina de estados para una ficha
 */
export function getOrCreateStateMachine(
  fichaId: string,
  initialState: FichaStateMachineState = 'draft'
): FichaStateMachine {
  let machine = stateMachineRegistry.get(fichaId);
  if (!machine) {
    machine = new FichaStateMachine(fichaId, initialState);
    stateMachineRegistry.set(fichaId, machine);
  }
  return machine;
}

/**
 * Obtiene una máquina de estados existente
 */
export function getStateMachine(fichaId: string): FichaStateMachine | undefined {
  return stateMachineRegistry.get(fichaId);
}

/**
 * Elimina una máquina de estados
 */
export function removeStateMachine(fichaId: string): boolean {
  return stateMachineRegistry.delete(fichaId);
}

/**
 * Limpia todas las máquinas de estado (útil para testing)
 */
export function clearAllStateMachines(): void {
  stateMachineRegistry.clear();
}
