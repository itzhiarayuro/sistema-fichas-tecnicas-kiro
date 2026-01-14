/**
 * Design Store - Gestión de diseños de fichas técnicas
 * Requirements: 6.1-6.4, 9.1, 16.10
 * 
 * Store Zustand para CRUD de diseños, persistencia en IndexedDB
 * y gestión de versiones de diseños.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FichaDesign, DesignTemplate, DesignEditorState } from '@/types';

interface DesignStoreState {
  // Diseños guardados
  designs: Map<string, FichaDesign>;
  
  // Plantillas (versiones históricas)
  templates: Map<string, DesignTemplate[]>;
  
  // Estado del editor
  editorState: DesignEditorState | null;
  
  // Diseño por defecto del sistema
  defaultDesignId: string | null;
  
  // Acciones CRUD de diseños
  createDesign: (design: FichaDesign) => void;
  updateDesign: (id: string, updates: Partial<FichaDesign>) => void;
  deleteDesign: (id: string) => void;
  getDesignById: (id: string) => FichaDesign | undefined;
  getAllDesigns: () => FichaDesign[];
  
  // Acciones de versiones
  createVersion: (designId: string, versionName: string, changelog?: string) => void;
  getVersions: (designId: string) => DesignTemplate[];
  restoreVersion: (designId: string, versionId: string) => void;
  deleteVersion: (designId: string, versionId: string) => void;
  
  // Acciones de editor
  setEditorState: (state: DesignEditorState) => void;
  updateEditorState: (updates: Partial<DesignEditorState>) => void;
  clearEditorState: () => void;
  
  // Acciones de diseño por defecto
  setDefaultDesign: (designId: string) => void;
  getDefaultDesign: () => FichaDesign | undefined;
  
  // Acciones de duplicación
  duplicateDesign: (designId: string, newName: string) => FichaDesign | undefined;
  
  // Acciones de búsqueda
  searchDesigns: (query: string) => FichaDesign[];
  
  // Acciones de limpieza
  reset: () => void;
}

// Custom storage para manejar Map serialization
const mapStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      if (parsed.state) {
        // Convertir arrays de vuelta a Maps
        if (parsed.state.designs && Array.isArray(parsed.state.designs)) {
          parsed.state.designs = new Map(parsed.state.designs);
        }
        if (parsed.state.templates && Array.isArray(parsed.state.templates)) {
          parsed.state.templates = new Map(parsed.state.templates);
        }
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing design store:', e);
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      const toStore = JSON.parse(JSON.stringify(value, (key, val) => {
        if (val instanceof Map) {
          return Array.from(val.entries());
        }
        return val;
      }));
      localStorage.setItem(name, JSON.stringify(toStore));
    } catch (e) {
      console.error('Error storing design store:', e);
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

// Diseño por defecto del sistema
const createDefaultDesign = (): FichaDesign => ({
  id: 'default-design-' + Date.now(),
  name: 'Diseño Estándar',
  description: 'Diseño estándar del sistema para fichas técnicas',
  isDefault: true,
  isGlobal: true,
  version: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pageConfig: {
    size: 'A4',
    orientation: 'portrait',
    width: 210,
    height: 297,
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    showGrid: false,
    gridSize: 10,
    snapToGrid: true,
  },
  theme: {
    primaryColor: '#1F4E79',
    secondaryColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    borderColor: '#CCCCCC',
    fontFamily: 'Inter',
    baseFontSize: 12,
  },
  fieldPlacements: [],
  shapes: [],
  metadata: {},
});

export const useDesignStore = create<DesignStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      designs: new Map(),
      templates: new Map(),
      editorState: null,
      defaultDesignId: null,
      
      // CRUD actions
      createDesign: (design) => set((state) => {
        const newDesigns = new Map(state.designs);
        newDesigns.set(design.id, design);
        return { designs: newDesigns };
      }),
      
      updateDesign: (id, updates) => set((state) => {
        const design = state.designs.get(id);
        if (!design) return state;
        
        const updated: FichaDesign = {
          ...design,
          ...updates,
          updatedAt: Date.now(),
        };
        
        const newDesigns = new Map(state.designs);
        newDesigns.set(id, updated);
        return { designs: newDesigns };
      }),
      
      deleteDesign: (id) => set((state) => {
        const newDesigns = new Map(state.designs);
        newDesigns.delete(id);
        
        // También eliminar versiones asociadas
        const newTemplates = new Map(state.templates);
        newTemplates.delete(id);
        
        // Si era el diseño por defecto, limpiar
        const newDefaultId = state.defaultDesignId === id ? null : state.defaultDesignId;
        
        return {
          designs: newDesigns,
          templates: newTemplates,
          defaultDesignId: newDefaultId,
        };
      }),
      
      getDesignById: (id) => get().designs.get(id),
      
      getAllDesigns: () => Array.from(get().designs.values()),
      
      // Version actions
      createVersion: (designId, versionName, changelog) => set((state) => {
        const design = state.designs.get(designId);
        if (!design) return state;
        
        const versions = state.templates.get(designId) || [];
        const versionNumber = versions.length + 1;
        
        const newTemplate: DesignTemplate = {
          id: `version-${designId}-${versionNumber}-${Date.now()}`,
          designId,
          versionName,
          versionNumber,
          changelog,
          design: JSON.parse(JSON.stringify(design)), // Deep copy
          isCurrent: true,
          createdAt: Date.now(),
        };
        
        // Marcar versiones anteriores como no actuales
        const updatedVersions = versions.map((v) => ({
          ...v,
          isCurrent: false,
        }));
        updatedVersions.push(newTemplate);
        
        const newTemplates = new Map(state.templates);
        newTemplates.set(designId, updatedVersions);
        
        return { templates: newTemplates };
      }),
      
      getVersions: (designId) => get().templates.get(designId) || [],
      
      restoreVersion: (designId, versionId) => set((state) => {
        const versions = state.templates.get(designId);
        if (!versions) return state;
        
        const versionToRestore = versions.find((v) => v.id === versionId);
        if (!versionToRestore) return state;
        
        // Crear nueva versión basada en la restaurada
        const restoredDesign: FichaDesign = {
          ...versionToRestore.design,
          updatedAt: Date.now(),
          version: versionToRestore.design.version + 1,
        };
        
        const newDesigns = new Map(state.designs);
        newDesigns.set(designId, restoredDesign);
        
        return { designs: newDesigns };
      }),
      
      deleteVersion: (designId, versionId) => set((state) => {
        const versions = state.templates.get(designId);
        if (!versions) return state;
        
        const filtered = versions.filter((v) => v.id !== versionId);
        const newTemplates = new Map(state.templates);
        
        if (filtered.length === 0) {
          newTemplates.delete(designId);
        } else {
          newTemplates.set(designId, filtered);
        }
        
        return { templates: newTemplates };
      }),
      
      // Editor state actions
      setEditorState: (state) => set({ editorState: state }),
      
      updateEditorState: (updates) => set((state) => ({
        editorState: state.editorState
          ? { ...state.editorState, ...updates }
          : null,
      })),
      
      clearEditorState: () => set({ editorState: null }),
      
      // Default design actions
      setDefaultDesign: (designId) => set((state) => {
        const design = state.designs.get(designId);
        if (!design) return state;
        
        // Actualizar el diseño para marcar como default
        const updated: FichaDesign = {
          ...design,
          isDefault: true,
          updatedAt: Date.now(),
        };
        
        // Desmarcar otros diseños como default
        const newDesigns = new Map(state.designs);
        newDesigns.forEach((d) => {
          if (d.id !== designId && d.isDefault) {
            newDesigns.set(d.id, { ...d, isDefault: false });
          }
        });
        newDesigns.set(designId, updated);
        
        return {
          designs: newDesigns,
          defaultDesignId: designId,
        };
      }),
      
      getDefaultDesign: () => {
        const defaultId = get().defaultDesignId;
        if (defaultId) {
          return get().designs.get(defaultId);
        }
        
        // Buscar el primer diseño marcado como default
        const designs = Array.from(get().designs.values());
        for (let i = 0; i < designs.length; i++) {
          if (designs[i] && 'isDefault' in designs[i] && designs[i].isDefault === true) {
            return designs[i];
          }
        }
        
        return undefined;
      },
      
      // Duplicate design
      duplicateDesign: (designId, newName) => {
        const state = get();
        const original = state.designs.get(designId);
        if (!original) return undefined;
        
        const duplicated: FichaDesign = {
          ...original,
          id: `design-${Date.now()}`,
          name: newName,
          isDefault: false,
          version: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          fieldPlacements: JSON.parse(JSON.stringify(original.fieldPlacements)),
        };
        
        set((s) => {
          const newDesigns = new Map(s.designs);
          newDesigns.set(duplicated.id, duplicated);
          return { designs: newDesigns };
        });
        
        return duplicated;
      },
      
      // Search designs
      searchDesigns: (query) => {
        const lowerQuery = query.toLowerCase();
        return Array.from(get().designs.values()).filter(
          (design) =>
            design.name.toLowerCase().includes(lowerQuery) ||
            design.description?.toLowerCase().includes(lowerQuery)
        );
      },
      
      // Reset
      reset: () => set({
        designs: new Map(),
        templates: new Map(),
        editorState: null,
        defaultDesignId: null,
      }),
    }),
    {
      name: 'fichas:designs',
      storage: mapStorage,
      partialize: (state) => ({
        designs: state.designs,
        templates: state.templates,
        defaultDesignId: state.defaultDesignId,
        // No persistir editorState - es transient
      }),
    }
  )
);

// Hook para inicializar con diseño por defecto si no hay ninguno
export const useInitializeDesignStore = () => {
  const designs = useDesignStore((state) => state.designs);
  const createDesign = useDesignStore((state) => state.createDesign);
  const setDefaultDesign = useDesignStore((state) => state.setDefaultDesign);
  
  if (designs.size === 0) {
    const defaultDesign = createDefaultDesign();
    createDesign(defaultDesign);
    setDefaultDesign(defaultDesign.id);
  }
};
