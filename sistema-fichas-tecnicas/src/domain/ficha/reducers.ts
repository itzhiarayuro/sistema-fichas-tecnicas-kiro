/**
 * Reducers - Procesadores de comandos que aplican cambios al estado
 * Requirements: 16.1-16.5
 * 
 * Los reducers son funciones puras que toman un comando y estado,
 * y retornan el nuevo estado sin efectos secundarios.
 */

import type { FichaState } from '@/types/ficha';
import type { AnyCommand, CommandType } from './commands';
import { CommandType as CT } from './commands';

/**
 * Resultado de reducción
 */
export interface ReducerResult {
  state: FichaState;
  applied: boolean;
  reason?: string;
}

/**
 * Aplica un comando al estado
 */
export function applyCommand(state: FichaState, command: AnyCommand): ReducerResult {
  // No permitir cambios a fichas finalizadas
  if (state.status === 'finalized') {
    return {
      state,
      applied: false,
      reason: 'Cannot modify finalized ficha',
    };
  }

  switch (command.type) {
    case CT.UPDATE_FIELD:
      return reduceUpdateField(state, command as any);

    case CT.REORDER_SECTIONS:
      return reduceReorderSections(state, command as any);

    case CT.TOGGLE_SECTION_VISIBILITY:
      return reduceToggleSectionVisibility(state, command as any);

    case CT.ADD_IMAGE:
      return reduceAddImage(state, command as any);

    case CT.REMOVE_IMAGE:
      return reduceRemoveImage(state, command as any);

    case CT.RESIZE_IMAGE:
      return reduceResizeImage(state, command as any);

    case CT.UNDO:
      return reduceUndo(state, command as any);

    case CT.REDO:
      return reduceRedo(state, command as any);

    case CT.CREATE_SNAPSHOT:
      return reduceCreateSnapshot(state, command as any);

    case CT.RESTORE_SNAPSHOT:
      return reduceRestoreSnapshot(state, command as any);

    case CT.SET_STATUS:
      return reduceSetStatus(state, command as any);

    case CT.FINALIZE:
      return reduceFinalize(state, command as any);

    case CT.RESET:
      return reduceReset(state, command as any);

    case CT.ADD_ERROR:
      return reduceAddError(state, command as any);

    case CT.CLEAR_ERROR:
      return reduceClearError(state, command as any);

    case CT.CLEAR_ALL_ERRORS:
      return reduceClearAllErrors(state, command as any);

    default:
      return {
        state,
        applied: false,
        reason: `Unknown command type: ${(command as any).type}`,
      };
  }
}

/**
 * Reducer: UPDATE_FIELD
 */
function reduceUpdateField(state: FichaState, command: any): ReducerResult {
  const { sectionId, field, value } = command;

  const newSections = state.sections.map((section) => {
    if (section.id === sectionId) {
      return {
        ...section,
        content: {
          ...section.content,
          [field]: {
            value,
            source: 'manual' as const,
            modifiedAt: Date.now(),
          },
        },
      };
    }
    return section;
  });

  return {
    state: {
      ...state,
      sections: newSections,
      lastModified: Date.now(),
      version: state.version + 1,
      status: state.status === 'draft' ? 'editing' : state.status,
    },
    applied: true,
  };
}

/**
 * Reducer: REORDER_SECTIONS
 */
function reduceReorderSections(state: FichaState, command: any): ReducerResult {
  const { fromIndex, toIndex } = command;

  // Validar índices
  if (fromIndex < 0 || fromIndex >= state.sections.length || toIndex < 0 || toIndex >= state.sections.length) {
    return {
      state,
      applied: false,
      reason: 'Invalid section indices',
    };
  }

  // Validar que la sección no esté bloqueada
  if (state.sections[fromIndex]?.locked) {
    return {
      state,
      applied: false,
      reason: 'Cannot reorder locked section',
    };
  }

  const newSections = [...state.sections];
  const [removed] = newSections.splice(fromIndex, 1);
  newSections.splice(toIndex, 0, removed);

  // Actualizar orden
  const reorderedSections = newSections.map((section, index) => ({
    ...section,
    order: index,
  }));

  return {
    state: {
      ...state,
      sections: reorderedSections,
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: TOGGLE_SECTION_VISIBILITY
 */
function reduceToggleSectionVisibility(state: FichaState, command: any): ReducerResult {
  const { sectionId } = command;

  const section = state.sections.find((s) => s.id === sectionId);
  if (!section) {
    return {
      state,
      applied: false,
      reason: 'Section not found',
    };
  }

  if (section.locked) {
    return {
      state,
      applied: false,
      reason: 'Cannot toggle visibility of locked section',
    };
  }

  const newSections = state.sections.map((s) => {
    if (s.id === sectionId) {
      return { ...s, visible: !s.visible };
    }
    return s;
  });

  return {
    state: {
      ...state,
      sections: newSections,
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: ADD_IMAGE
 */
function reduceAddImage(state: FichaState, command: any): ReducerResult {
  const { sectionId, image } = command;

  const newSections = state.sections.map((section) => {
    if (section.id === sectionId) {
      const images = section.content.images?.value
        ? JSON.parse(section.content.images.value)
        : [];

      return {
        ...section,
        content: {
          ...section.content,
          images: {
            value: JSON.stringify([...images, image]),
            source: 'manual' as const,
            modifiedAt: Date.now(),
          },
        },
      };
    }
    return section;
  });

  return {
    state: {
      ...state,
      sections: newSections,
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: REMOVE_IMAGE
 */
function reduceRemoveImage(state: FichaState, command: any): ReducerResult {
  const { sectionId, imageId } = command;

  const newSections = state.sections.map((section) => {
    if (section.id === sectionId) {
      const images = section.content.images?.value
        ? JSON.parse(section.content.images.value)
        : [];

      const filteredImages = images.filter((img: any) => img.id !== imageId);

      return {
        ...section,
        content: {
          ...section.content,
          images: {
            value: JSON.stringify(filteredImages),
            source: 'manual' as const,
            modifiedAt: Date.now(),
          },
        },
      };
    }
    return section;
  });

  return {
    state: {
      ...state,
      sections: newSections,
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: RESIZE_IMAGE
 */
function reduceResizeImage(state: FichaState, command: any): ReducerResult {
  // Este reducer no modifica el estado, solo registra el tamaño
  // El tamaño se maneja en el store de UI
  return {
    state,
    applied: true,
  };
}

/**
 * Reducer: UNDO
 */
function reduceUndo(state: FichaState, command: any): ReducerResult {
  // El undo se maneja en el store, no aquí
  return {
    state,
    applied: true,
  };
}

/**
 * Reducer: REDO
 */
function reduceRedo(state: FichaState, command: any): ReducerResult {
  // El redo se maneja en el store, no aquí
  return {
    state,
    applied: true,
  };
}

/**
 * Reducer: CREATE_SNAPSHOT
 */
function reduceCreateSnapshot(state: FichaState, command: any): ReducerResult {
  // Los snapshots se manejan en el store, no aquí
  return {
    state,
    applied: true,
  };
}

/**
 * Reducer: RESTORE_SNAPSHOT
 */
function reduceRestoreSnapshot(state: FichaState, command: any): ReducerResult {
  // La restauración de snapshots se maneja en el store, no aquí
  return {
    state,
    applied: true,
  };
}

/**
 * Reducer: SET_STATUS
 */
function reduceSetStatus(state: FichaState, command: any): ReducerResult {
  const { status } = command;

  // No permitir cambiar estado de ficha finalizada
  if (state.status === 'finalized' && status !== 'finalized') {
    return {
      state,
      applied: false,
      reason: 'Cannot change status of finalized ficha',
    };
  }

  return {
    state: {
      ...state,
      status,
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: FINALIZE
 */
function reduceFinalize(state: FichaState, command: any): ReducerResult {
  if (state.status === 'finalized') {
    return {
      state,
      applied: false,
      reason: 'Ficha is already finalized',
    };
  }

  return {
    state: {
      ...state,
      status: 'finalized',
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: RESET
 */
function reduceReset(state: FichaState, command: any): ReducerResult {
  if (state.status === 'finalized') {
    return {
      state,
      applied: false,
      reason: 'Cannot reset finalized ficha',
    };
  }

  // El reset se maneja en el store con el estado inicial
  return {
    state: {
      ...state,
      status: 'draft',
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: ADD_ERROR
 */
function reduceAddError(state: FichaState, command: any): ReducerResult {
  const { error } = command;

  const newError = {
    id: crypto.randomUUID(),
    fichaId: state.id,
    type: error.type,
    severity: error.severity,
    message: error.message,
    userMessage: error.userMessage,
    field: error.field,
    timestamp: Date.now(),
    resolved: false,
  };

  return {
    state: {
      ...state,
      errors: [...state.errors, newError],
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: CLEAR_ERROR
 */
function reduceClearError(state: FichaState, command: any): ReducerResult {
  const { errorId } = command;

  return {
    state: {
      ...state,
      errors: state.errors.filter((e) => e.id !== errorId),
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}

/**
 * Reducer: CLEAR_ALL_ERRORS
 */
function reduceClearAllErrors(state: FichaState, command: any): ReducerResult {
  return {
    state: {
      ...state,
      errors: [],
      lastModified: Date.now(),
      version: state.version + 1,
    },
    applied: true,
  };
}
