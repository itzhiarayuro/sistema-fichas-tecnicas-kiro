/**
 * History Manager - Gestión de Undo/Redo + Snapshots
 * Requirements: 3.7, 13.1-13.4
 * 
 * Define tres niveles de historia:
 * 1. Undo/Redo: Cambios recientes (últimos 50)
 * 2. Snapshots: Puntos de recuperación (últimos 10)
 * 3. Finalized: Estado congelado (no se puede modificar)
 * 
 * Regla: Restaurar snapshot resetea undo/redo
 */

import type { FichaState, HistoryEntry, Snapshot } from '@/types/ficha';

/**
 * Niveles de historia
 */
export enum HistoryLevel {
  UNDO_REDO = 'undo_redo',
  SNAPSHOT = 'snapshot',
  FINALIZED = 'finalized',
}

/**
 * Entrada de historial con nivel
 */
export interface HistoryLevelEntry {
  level: HistoryLevel;
  entry: HistoryEntry | Snapshot;
  timestamp: number;
}

/**
 * Configuración de límites
 */
export interface HistoryConfig {
  maxUndoRedoSize: number;
  maxSnapshots: number;
  autoSnapshotInterval: number; // ms
}

const DEFAULT_CONFIG: HistoryConfig = {
  maxUndoRedoSize: 50,
  maxSnapshots: 10,
  autoSnapshotInterval: 30000, // 30 segundos
};

/**
 * Gestor de historial con tres niveles
 */
export class HistoryManager {
  private fichaId: string;
  private config: HistoryConfig;

  // Nivel 1: Undo/Redo
  private undoRedoStack: HistoryEntry[] = [];
  private currentIndex: number = -1;

  // Nivel 2: Snapshots
  private snapshots: Snapshot[] = [];
  private lastAutoSnapshotTime: number = 0;

  // Nivel 3: Finalized state
  private finalizedState: FichaState | null = null;
  private isFinalizedLocked: boolean = false;

  constructor(fichaId: string, config: Partial<HistoryConfig> = {}) {
    this.fichaId = fichaId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Agrega una entrada al historial de undo/redo
   * Descarta cualquier redo que estuviera disponible
   */
  addUndoRedoEntry(entry: HistoryEntry): void {
    if (this.isFinalizedLocked) {
      throw new Error('Cannot modify history of finalized ficha');
    }

    // Descartar redo stack
    this.undoRedoStack = this.undoRedoStack.slice(0, this.currentIndex + 1);

    // Agregar nueva entrada
    this.undoRedoStack.push(entry);
    this.currentIndex++;

    // Limitar tamaño
    if (this.undoRedoStack.length > this.config.maxUndoRedoSize) {
      this.undoRedoStack.shift();
      this.currentIndex--;
    }
  }

  /**
   * Obtiene la entrada anterior para undo
   */
  getUndoEntry(): HistoryEntry | null {
    if (this.currentIndex < 0) return null;
    return this.undoRedoStack[this.currentIndex] || null;
  }

  /**
   * Realiza undo
   */
  undo(): HistoryEntry | null {
    if (this.currentIndex < 0) return null;
    const entry = this.undoRedoStack[this.currentIndex];
    this.currentIndex--;
    return entry || null;
  }

  /**
   * Realiza redo
   */
  redo(): HistoryEntry | null {
    if (this.currentIndex >= this.undoRedoStack.length - 1) return null;
    this.currentIndex++;
    return this.undoRedoStack[this.currentIndex] || null;
  }

  /**
   * Verifica si se puede hacer undo
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Verifica si se puede hacer redo
   */
  canRedo(): boolean {
    return this.currentIndex < this.undoRedoStack.length - 1;
  }

  /**
   * Obtiene el historial de undo/redo
   */
  getUndoRedoHistory(): HistoryEntry[] {
    return [...this.undoRedoStack];
  }

  /**
   * Obtiene el índice actual en el historial
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Crea un snapshot
   */
  createSnapshot(state: FichaState, trigger: 'auto' | 'manual' | 'pre-action'): Snapshot {
    if (this.isFinalizedLocked) {
      throw new Error('Cannot create snapshot of finalized ficha');
    }

    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      fichaId: this.fichaId,
      state: JSON.parse(JSON.stringify(state)),
      timestamp: Date.now(),
      trigger,
    };

    this.snapshots.push(snapshot);
    this.lastAutoSnapshotTime = Date.now();

    // Limitar cantidad de snapshots
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Obtiene todos los snapshots
   */
  getSnapshots(): Snapshot[] {
    return [...this.snapshots];
  }

  /**
   * Obtiene un snapshot específico
   */
  getSnapshot(snapshotId: string): Snapshot | null {
    return this.snapshots.find((s) => s.id === snapshotId) || null;
  }

  /**
   * Restaura un snapshot
   * IMPORTANTE: Restaurar snapshot resetea undo/redo
   */
  restoreSnapshot(snapshotId: string): Snapshot | null {
    if (this.isFinalizedLocked) {
      throw new Error('Cannot restore snapshot of finalized ficha');
    }

    const snapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return null;

    // REGLA: Restaurar snapshot resetea undo/redo
    this.undoRedoStack = [];
    this.currentIndex = -1;

    return snapshot;
  }

  /**
   * Elimina un snapshot
   */
  deleteSnapshot(snapshotId: string): boolean {
    const index = this.snapshots.findIndex((s) => s.id === snapshotId);
    if (index === -1) return false;
    this.snapshots.splice(index, 1);
    return true;
  }

  /**
   * Limpia snapshots antiguos
   */
  pruneOldSnapshots(maxSnapshots?: number): void {
    const limit = maxSnapshots ?? this.config.maxSnapshots;
    if (this.snapshots.length > limit) {
      this.snapshots = this.snapshots.slice(-limit);
    }
  }

  /**
   * Verifica si es tiempo de hacer auto-snapshot
   */
  shouldAutoSnapshot(): boolean {
    const elapsed = Date.now() - this.lastAutoSnapshotTime;
    return elapsed >= this.config.autoSnapshotInterval;
  }

  /**
   * Finaliza la ficha (estado terminal)
   * Congela el historial y no permite más cambios
   */
  finalize(finalState: FichaState): void {
    if (this.isFinalizedLocked) {
      throw new Error('Ficha is already finalized');
    }

    this.finalizedState = JSON.parse(JSON.stringify(finalState));
    this.isFinalizedLocked = true;

    // Crear snapshot final
    this.createSnapshot(finalState, 'manual');
  }

  /**
   * Verifica si la ficha está finalizada
   */
  isFinalized(): boolean {
    return this.isFinalizedLocked;
  }

  /**
   * Obtiene el estado finalizado
   */
  getFinalizedState(): FichaState | null {
    return this.finalizedState ? JSON.parse(JSON.stringify(this.finalizedState)) : null;
  }

  /**
   * Limpia el historial de undo/redo
   * Útil después de restaurar un snapshot
   */
  clearUndoRedo(): void {
    if (this.isFinalizedLocked) {
      throw new Error('Cannot modify history of finalized ficha');
    }
    this.undoRedoStack = [];
    this.currentIndex = -1;
  }

  /**
   * Obtiene información del gestor de historial
   */
  getInfo(): {
    fichaId: string;
    undoRedoSize: number;
    currentIndex: number;
    snapshotCount: number;
    isFinalized: boolean;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      fichaId: this.fichaId,
      undoRedoSize: this.undoRedoStack.length,
      currentIndex: this.currentIndex,
      snapshotCount: this.snapshots.length,
      isFinalized: this.isFinalizedLocked,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  /**
   * Serializa el gestor de historial
   */
  serialize(): {
    fichaId: string;
    undoRedoStack: HistoryEntry[];
    currentIndex: number;
    snapshots: Snapshot[];
    finalizedState: FichaState | null;
    isFinalizedLocked: boolean;
  } {
    return {
      fichaId: this.fichaId,
      undoRedoStack: this.undoRedoStack,
      currentIndex: this.currentIndex,
      snapshots: this.snapshots,
      finalizedState: this.finalizedState,
      isFinalizedLocked: this.isFinalizedLocked,
    };
  }

  /**
   * Deserializa un gestor de historial
   */
  static deserialize(data: {
    fichaId: string;
    undoRedoStack: HistoryEntry[];
    currentIndex: number;
    snapshots: Snapshot[];
    finalizedState: FichaState | null;
    isFinalizedLocked: boolean;
  }): HistoryManager {
    const manager = new HistoryManager(data.fichaId);
    manager.undoRedoStack = data.undoRedoStack;
    manager.currentIndex = data.currentIndex;
    manager.snapshots = data.snapshots;
    manager.finalizedState = data.finalizedState;
    manager.isFinalizedLocked = data.isFinalizedLocked;
    return manager;
  }
}

/**
 * Registry para gestores de historial por ficha
 */
const historyManagerRegistry = new Map<string, HistoryManager>();

/**
 * Obtiene o crea un gestor de historial para una ficha
 */
export function getOrCreateHistoryManager(
  fichaId: string,
  config?: Partial<HistoryConfig>
): HistoryManager {
  let manager = historyManagerRegistry.get(fichaId);
  if (!manager) {
    manager = new HistoryManager(fichaId, config);
    historyManagerRegistry.set(fichaId, manager);
  }
  return manager;
}

/**
 * Obtiene un gestor de historial existente
 */
export function getHistoryManager(fichaId: string): HistoryManager | undefined {
  return historyManagerRegistry.get(fichaId);
}

/**
 * Elimina un gestor de historial
 */
export function removeHistoryManager(fichaId: string): boolean {
  return historyManagerRegistry.delete(fichaId);
}

/**
 * Limpia todos los gestores de historial
 */
export function clearAllHistoryManagers(): void {
  historyManagerRegistry.clear();
}
