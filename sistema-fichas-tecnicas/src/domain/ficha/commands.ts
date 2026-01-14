/**
 * Commands - Acciones que la UI puede emitir
 * Requirements: 16.1-16.5
 * 
 * La UI solo emite commands, no muta estado directamente.
 * Los commands son procesados por reducers que aplican cambios.
 */

import type { ImageSize } from '@/types/ficha';
import type { FotoInfo } from '@/types/pozo';

/**
 * Tipos de comandos
 */
export enum CommandType {
  // Edición de campos
  UPDATE_FIELD = 'UPDATE_FIELD',
  
  // Edición de secciones
  REORDER_SECTIONS = 'REORDER_SECTIONS',
  TOGGLE_SECTION_VISIBILITY = 'TOGGLE_SECTION_VISIBILITY',
  
  // Edición de imágenes
  ADD_IMAGE = 'ADD_IMAGE',
  REMOVE_IMAGE = 'REMOVE_IMAGE',
  RESIZE_IMAGE = 'RESIZE_IMAGE',
  
  // Historial
  UNDO = 'UNDO',
  REDO = 'REDO',
  
  // Snapshots
  CREATE_SNAPSHOT = 'CREATE_SNAPSHOT',
  RESTORE_SNAPSHOT = 'RESTORE_SNAPSHOT',
  
  // Estado
  SET_STATUS = 'SET_STATUS',
  FINALIZE = 'FINALIZE',
  RESET = 'RESET',
  
  // Errores
  ADD_ERROR = 'ADD_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS = 'CLEAR_ALL_ERRORS',
}

/**
 * Comando base
 */
export interface Command {
  type: CommandType;
  fichaId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Comando: Actualizar campo
 */
export interface UpdateFieldCommand extends Command {
  type: CommandType.UPDATE_FIELD;
  sectionId: string;
  field: string;
  value: string;
}

/**
 * Comando: Reordenar secciones
 */
export interface ReorderSectionsCommand extends Command {
  type: CommandType.REORDER_SECTIONS;
  fromIndex: number;
  toIndex: number;
}

/**
 * Comando: Alternar visibilidad de sección
 */
export interface ToggleSectionVisibilityCommand extends Command {
  type: CommandType.TOGGLE_SECTION_VISIBILITY;
  sectionId: string;
}

/**
 * Comando: Agregar imagen
 */
export interface AddImageCommand extends Command {
  type: CommandType.ADD_IMAGE;
  sectionId: string;
  image: FotoInfo;
}

/**
 * Comando: Remover imagen
 */
export interface RemoveImageCommand extends Command {
  type: CommandType.REMOVE_IMAGE;
  sectionId: string;
  imageId: string;
}

/**
 * Comando: Redimensionar imagen
 */
export interface ResizeImageCommand extends Command {
  type: CommandType.RESIZE_IMAGE;
  imageId: string;
  size: ImageSize;
}

/**
 * Comando: Undo
 */
export interface UndoCommand extends Command {
  type: CommandType.UNDO;
}

/**
 * Comando: Redo
 */
export interface RedoCommand extends Command {
  type: CommandType.REDO;
}

/**
 * Comando: Crear snapshot
 */
export interface CreateSnapshotCommand extends Command {
  type: CommandType.CREATE_SNAPSHOT;
  trigger: 'auto' | 'manual' | 'pre-action';
}

/**
 * Comando: Restaurar snapshot
 */
export interface RestoreSnapshotCommand extends Command {
  type: CommandType.RESTORE_SNAPSHOT;
  snapshotId: string;
}

/**
 * Comando: Establecer estado
 */
export interface SetStatusCommand extends Command {
  type: CommandType.SET_STATUS;
  status: 'draft' | 'editing' | 'complete' | 'finalized';
}

/**
 * Comando: Finalizar
 */
export interface FinalizeCommand extends Command {
  type: CommandType.FINALIZE;
}

/**
 * Comando: Resetear
 */
export interface ResetCommand extends Command {
  type: CommandType.RESET;
}

/**
 * Comando: Agregar error
 */
export interface AddErrorCommand extends Command {
  type: CommandType.ADD_ERROR;
  error: {
    type: 'data' | 'user' | 'system';
    severity: 'warning' | 'error';
    message: string;
    userMessage: string;
    field?: string;
  };
}

/**
 * Comando: Limpiar error
 */
export interface ClearErrorCommand extends Command {
  type: CommandType.CLEAR_ERROR;
  errorId: string;
}

/**
 * Comando: Limpiar todos los errores
 */
export interface ClearAllErrorsCommand extends Command {
  type: CommandType.CLEAR_ALL_ERRORS;
}

/**
 * Unión de todos los comandos
 */
export type AnyCommand =
  | UpdateFieldCommand
  | ReorderSectionsCommand
  | ToggleSectionVisibilityCommand
  | AddImageCommand
  | RemoveImageCommand
  | ResizeImageCommand
  | UndoCommand
  | RedoCommand
  | CreateSnapshotCommand
  | RestoreSnapshotCommand
  | SetStatusCommand
  | FinalizeCommand
  | ResetCommand
  | AddErrorCommand
  | ClearErrorCommand
  | ClearAllErrorsCommand;

/**
 * Factory para crear comandos
 */
export class CommandFactory {
  static updateField(
    fichaId: string,
    sectionId: string,
    field: string,
    value: string
  ): UpdateFieldCommand {
    return {
      type: CommandType.UPDATE_FIELD,
      fichaId,
      sectionId,
      field,
      value,
      timestamp: Date.now(),
    };
  }

  static reorderSections(
    fichaId: string,
    fromIndex: number,
    toIndex: number
  ): ReorderSectionsCommand {
    return {
      type: CommandType.REORDER_SECTIONS,
      fichaId,
      fromIndex,
      toIndex,
      timestamp: Date.now(),
    };
  }

  static toggleSectionVisibility(fichaId: string, sectionId: string): ToggleSectionVisibilityCommand {
    return {
      type: CommandType.TOGGLE_SECTION_VISIBILITY,
      fichaId,
      sectionId,
      timestamp: Date.now(),
    };
  }

  static addImage(fichaId: string, sectionId: string, image: FotoInfo): AddImageCommand {
    return {
      type: CommandType.ADD_IMAGE,
      fichaId,
      sectionId,
      image,
      timestamp: Date.now(),
    };
  }

  static removeImage(fichaId: string, sectionId: string, imageId: string): RemoveImageCommand {
    return {
      type: CommandType.REMOVE_IMAGE,
      fichaId,
      sectionId,
      imageId,
      timestamp: Date.now(),
    };
  }

  static resizeImage(fichaId: string, imageId: string, size: ImageSize): ResizeImageCommand {
    return {
      type: CommandType.RESIZE_IMAGE,
      fichaId,
      imageId,
      size,
      timestamp: Date.now(),
    };
  }

  static undo(fichaId: string): UndoCommand {
    return {
      type: CommandType.UNDO,
      fichaId,
      timestamp: Date.now(),
    };
  }

  static redo(fichaId: string): RedoCommand {
    return {
      type: CommandType.REDO,
      fichaId,
      timestamp: Date.now(),
    };
  }

  static createSnapshot(
    fichaId: string,
    trigger: 'auto' | 'manual' | 'pre-action'
  ): CreateSnapshotCommand {
    return {
      type: CommandType.CREATE_SNAPSHOT,
      fichaId,
      trigger,
      timestamp: Date.now(),
    };
  }

  static restoreSnapshot(fichaId: string, snapshotId: string): RestoreSnapshotCommand {
    return {
      type: CommandType.RESTORE_SNAPSHOT,
      fichaId,
      snapshotId,
      timestamp: Date.now(),
    };
  }

  static setStatus(
    fichaId: string,
    status: 'draft' | 'editing' | 'complete' | 'finalized'
  ): SetStatusCommand {
    return {
      type: CommandType.SET_STATUS,
      fichaId,
      status,
      timestamp: Date.now(),
    };
  }

  static finalize(fichaId: string): FinalizeCommand {
    return {
      type: CommandType.FINALIZE,
      fichaId,
      timestamp: Date.now(),
    };
  }

  static reset(fichaId: string): ResetCommand {
    return {
      type: CommandType.RESET,
      fichaId,
      timestamp: Date.now(),
    };
  }

  static addError(
    fichaId: string,
    error: {
      type: 'data' | 'user' | 'system';
      severity: 'warning' | 'error';
      message: string;
      userMessage: string;
      field?: string;
    }
  ): AddErrorCommand {
    return {
      type: CommandType.ADD_ERROR,
      fichaId,
      error,
      timestamp: Date.now(),
    };
  }

  static clearError(fichaId: string, errorId: string): ClearErrorCommand {
    return {
      type: CommandType.CLEAR_ERROR,
      fichaId,
      errorId,
      timestamp: Date.now(),
    };
  }

  static clearAllErrors(fichaId: string): ClearAllErrorsCommand {
    return {
      type: CommandType.CLEAR_ALL_ERRORS,
      fichaId,
      timestamp: Date.now(),
    };
  }
}
