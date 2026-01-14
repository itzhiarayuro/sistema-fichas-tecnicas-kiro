# Design Document: Sistema de Fichas Técnicas de Pozos

## Overview

Este documento describe la arquitectura técnica del Sistema de Fichas Técnicas de Pozos, una aplicación Next.js 14+ con App Router que implementa un editor visual en tiempo real para fichas técnicas de pozos de inspección de alcantarillado.

El sistema está diseñado bajo principios de robustez extrema (fail-safe, fool-proof) con aislamiento completo entre fichas y contención total de errores.

### Principios Arquitectónicos

1. **Fail-Safe by Design**: Toda operación tiene un fallback seguro
2. **Aislamiento Total**: Cada ficha es una unidad independiente con su propio estado
3. **Inmutabilidad**: Estado gestionado con patrones inmutables para facilitar undo/redo
4. **Sincronización Optimista**: Actualizaciones en tiempo real con reconciliación
5. **Persistencia Defensiva**: Múltiples capas de backup y recuperación

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  app/                                                            │
│  ├── layout.tsx          (Root layout con providers)            │
│  ├── page.tsx            (Dashboard principal)                  │
│  ├── upload/page.tsx     (Carga de archivos)                   │
│  ├── pozos/page.tsx      (Lista de pozos)                      │
│  ├── editor/[id]/page.tsx (Editor visual por ficha)            │
│  └── api/                                                       │
│      ├── upload/route.ts  (Procesamiento de archivos)          │
│      ├── pdf/route.ts     (Generación de PDF)                  │
│      └── export/route.ts  (Exportación ZIP)                    │
├─────────────────────────────────────────────────────────────────┤
│                      State Management Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GlobalStore  │  │ FichaStore   │  │ UIStore      │          │
│  │ (Zustand)    │  │ (Per-Ficha)  │  │ (Transient)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                      Persistence Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ IndexedDB    │  │ LocalStorage │  │ Snapshots    │          │
│  │ (Fichas)     │  │ (Config)     │  │ (Recovery)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                      Core Services                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ExcelParser  │  │ PhotoIndexer │  │ PDFGenerator │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Validator    │  │ ErrorHandler │  │ SyncEngine   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Components

```typescript
// components/layout/
├── AppShell.tsx           // Layout principal con sidebar
├── Sidebar.tsx            // Navegación lateral
├── Header.tsx             // Barra superior con contexto
└── ContextIndicator.tsx   // Indicador de ficha actual y estado

// components/upload/
├── DropZone.tsx           // Zona de drag & drop
├── FileList.tsx           // Lista de archivos cargados
├── UploadProgress.tsx     // Progreso de carga
└── FileValidationBadge.tsx // Estado de validación

// components/pozos/
├── PozosTable.tsx         // Tabla interactiva de pozos
├── PozoRow.tsx            // Fila individual con estado
├── PozoFilters.tsx        // Filtros y búsqueda
└── PozoStatusBadge.tsx    // Indicador de completitud

// components/editor/
├── EditorLayout.tsx       // Layout split editor/preview
├── EditorPanel.tsx        // Panel de edición
├── PreviewPanel.tsx       // Vista previa en tiempo real
├── SectionEditor.tsx      // Editor de sección individual
├── ImageEditor.tsx        // Editor de imágenes con resize
├── TextEditor.tsx         // Editor de texto inline
├── DragHandle.tsx         // Control de reordenamiento
└── ToolBar.tsx            // Barra de herramientas

// components/ficha/
├── FichaHeader.tsx        // Encabezado de ficha
├── FichaSection.tsx       // Sección genérica
├── IdentificacionSection.tsx
├── EstructuraSection.tsx
├── TuberiasSection.tsx
├── FotosSection.tsx
└── ObservacionesSection.tsx

// components/ui/
├── ConfirmDialog.tsx      // Diálogo de confirmación doble
├── Toast.tsx              // Notificaciones no intrusivas
├── Tooltip.tsx            // Tooltips con trazabilidad
├── LoadingSkeleton.tsx    // Estados de carga
└── ErrorBoundary.tsx      // Contención de errores por componente
```

### Key Interfaces

```typescript
// types/pozo.ts
interface Pozo {
  id: string;
  codigo: string;
  direccion: string;
  barrio: string;
  sistema: string;
  estado: string;
  fecha: string;
  estructura: EstructuraPozo;
  tuberias: TuberiasPozo;
  observaciones: string;
  fotos: FotosPozo;
  metadata: PozoMetadata;
}

interface EstructuraPozo {
  alturaTotal: string;
  rasante: string;
  tapaMaterial: string;
  tapaEstado: string;
  conoTipo: string;
  conoMaterial: string;
  cuerpoDiametro: string;
  canuelaMaterial: string;
  peldanosCantidad: string;
  peldanosMaterial: string;
}

interface FotosPozo {
  principal: FotoInfo[];
  entradas: FotoInfo[];
  salidas: FotoInfo[];
  sumideros: FotoInfo[];
  otras: FotoInfo[];
}

interface FotoInfo {
  id: string;
  path: string;
  filename: string;
  categoria: 'PRINCIPAL' | 'ENTRADA' | 'SALIDA' | 'SUMIDERO' | 'OTRO';
  subcategoria: string;
  descripcion: string;
  dataUrl?: string;
}

// types/ficha.ts
interface FichaState {
  id: string;
  pozoId: string;
  status: 'draft' | 'editing' | 'complete' | 'finalized';
  sections: FichaSection[];
  customizations: FichaCustomization;
  history: HistoryEntry[];
  errors: FichaError[];
  lastModified: number;
  version: number;
}

interface FichaSection {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  locked: boolean;
  content: Record<string, FieldValue>;
}

interface FieldValue {
  value: string;
  source: 'excel' | 'manual' | 'default';
  originalValue?: string;
  modifiedAt?: number;
}

interface FichaCustomization {
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
  template: string;
  isGlobal: boolean;
}

// types/error.ts
interface FichaError {
  id: string;
  fichaId: string;
  type: 'data' | 'user' | 'system';
  severity: 'warning' | 'error';
  message: string;
  userMessage: string;
  field?: string;
  timestamp: number;
  resolved: boolean;
}

// types/snapshot.ts
interface Snapshot {
  id: string;
  fichaId: string;
  state: FichaState;
  timestamp: number;
  trigger: 'auto' | 'manual' | 'pre-action';
}
```

## Data Models

### State Architecture

```typescript
// stores/globalStore.ts
interface GlobalState {
  // Datos cargados (inmutables después de carga)
  pozos: Map<string, Pozo>;
  photos: Map<string, FotoInfo>;
  
  // Configuración global
  config: GlobalConfig;
  templates: Template[];
  
  // Estado de la aplicación
  currentStep: WorkflowStep;
  guidedMode: boolean;
  
  // Acciones
  loadPozos: (data: ExcelData) => void;
  indexPhotos: (files: File[]) => void;
  setConfig: (config: Partial<GlobalConfig>) => void;
}

// stores/fichaStore.ts - Una instancia por ficha
interface FichaStore {
  state: FichaState;
  
  // Edición
  updateField: (sectionId: string, field: string, value: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addImage: (sectionId: string, image: FotoInfo) => void;
  removeImage: (sectionId: string, imageId: string) => void;
  resizeImage: (imageId: string, size: ImageSize) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Errores
  errors: FichaError[];
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  
  // Snapshots
  createSnapshot: (trigger: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  snapshots: Snapshot[];
}

// stores/uiStore.ts
interface UIState {
  // Transient UI state
  selectedPozoId: string | null;
  editorMode: 'edit' | 'preview' | 'split';
  sidebarCollapsed: boolean;
  activeSection: string | null;
  
  // Modals
  confirmDialog: ConfirmDialogState | null;
  
  // Notifications
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}
```

### Persistence Strategy

```typescript
// lib/persistence/indexedDB.ts
const DB_NAME = 'fichas-tecnicas';
const STORES = {
  fichas: 'fichas',      // FichaState por ID
  snapshots: 'snapshots', // Snapshots para recovery
  photos: 'photos',       // Fotos en base64
};

// Cada ficha se persiste en su propio namespace
async function saveFicha(fichaId: string, state: FichaState): Promise<void>;
async function loadFicha(fichaId: string): Promise<FichaState | null>;
async function deleteFicha(fichaId: string): Promise<void>;

// lib/persistence/localStorage.ts
const KEYS = {
  globalConfig: 'fichas:config',
  templates: 'fichas:templates',
  lastSession: 'fichas:session',
};

// lib/persistence/snapshotManager.ts
class SnapshotManager {
  private maxSnapshots = 10;
  private autoSaveInterval = 30000; // 30 segundos
  
  async createSnapshot(fichaId: string, state: FichaState, trigger: string): Promise<void>;
  async getSnapshots(fichaId: string): Promise<Snapshot[]>;
  async restoreLatest(fichaId: string): Promise<FichaState | null>;
  async pruneOldSnapshots(fichaId: string): Promise<void>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Robustez de Carga de Archivos
*For any* archivo Excel con columnas extra, columnas faltantes, o datos malformados, el sistema SHALL procesarlo sin lanzar excepciones, extrayendo los datos válidos disponibles y marcando los problemas encontrados.
**Validates: Requirements 1.8, 1.9, 1.10, 11.1-11.5**

### Property 2: Parsing de Nomenclatura Round-Trip
*For any* nombre de archivo válido según la nomenclatura (ej: M680-P.jpg, M680-E1-T.jpg), parsear el nombre y reconstruirlo SHALL producir un resultado equivalente que identifica el mismo pozo y categoría.
**Validates: Requirements 10.1-10.4**

### Property 3: Sincronización Bidireccional
*For any* cambio realizado en el Editor_Visual, la Vista_Previa SHALL reflejar exactamente el mismo estado, y viceversa. La función sync(edit(state)) === sync(preview(state)) para todo estado válido.
**Validates: Requirements 4.1-4.5**

### Property 4: Historial Undo/Redo Consistente
*For any* secuencia de N operaciones de edición seguidas de N operaciones de undo, el estado final SHALL ser equivalente al estado inicial.
**Validates: Requirements 3.7, 12.3**

### Property 5: Aislamiento Total entre Fichas
*For any* error, modificación o estado inválido en una Ficha A, el estado de cualquier otra Ficha B SHALL permanecer completamente inalterado. Formalmente: mutate(fichaA) ∩ state(fichaB) = ∅
**Validates: Requirements 16.1-16.14, 17.1-17.6**

### Property 6: Persistencia y Recuperación
*For any* estado válido de ficha, guardar y luego restaurar SHALL producir un estado equivalente. serialize(state) |> deserialize === state
**Validates: Requirements 9.1-9.7, 13.1-13.4**

### Property 7: Protección de Estructura Mínima
*For any* secuencia de operaciones de edición del usuario, la ficha resultante SHALL mantener todas las secciones obligatorias y una estructura válida para generación de PDF.
**Validates: Requirements 3.8, 3.9, 3.10**

### Property 8: Contención de Errores
*For any* error que ocurra durante el procesamiento de una ficha, el error SHALL quedar encapsulado en el contexto de esa ficha sin afectar el estado global ni otras fichas.
**Validates: Requirements 0.1, 17.1-17.6**

### Property 9: Acciones Destructivas Requieren Confirmación
*For any* acción clasificada como destructiva (eliminar sección, eliminar imagen, resetear formato), el sistema SHALL requerir confirmación explícita antes de ejecutarla.
**Validates: Requirements 0.3, 12.1, 12.2, 12.4**

### Property 10: Validación No Bloqueante
*For any* dato de entrada inválido o incompleto, el sistema SHALL continuar funcionando, usando valores por defecto seguros y marcando visualmente los problemas sin bloquear el flujo.
**Validates: Requirements 11.1-11.5, 0.1**

## Error Handling

### Error Classification

```typescript
// lib/errors/errorTypes.ts
enum ErrorType {
  DATA = 'data',       // Datos inválidos o faltantes
  USER = 'user',       // Acción inválida del usuario
  SYSTEM = 'system',   // Error interno del sistema
}

enum ErrorSeverity {
  WARNING = 'warning', // No bloquea, solo informa
  ERROR = 'error',     // Requiere atención pero no bloquea
}

// Nunca hay errores "fatales" - siempre hay recuperación
```

### Error Boundary Strategy

```typescript
// components/ErrorBoundary.tsx
// Cada sección de la ficha tiene su propio ErrorBoundary
// Un error en una sección no afecta a otras

<FichaEditor>
  <ErrorBoundary fallback={<SectionErrorFallback />} onError={logError}>
    <IdentificacionSection />
  </ErrorBoundary>
  <ErrorBoundary fallback={<SectionErrorFallback />} onError={logError}>
    <EstructuraSection />
  </ErrorBoundary>
  {/* ... */}
</FichaEditor>
```

### Error Recovery

```typescript
// lib/errors/recovery.ts
class ErrorRecovery {
  // Intenta recuperar automáticamente
  async attemptRecovery(error: FichaError): Promise<boolean> {
    switch (error.type) {
      case 'data':
        return this.recoverFromDataError(error);
      case 'user':
        return this.recoverFromUserError(error);
      case 'system':
        return this.recoverFromSystemError(error);
    }
  }
  
  private async recoverFromDataError(error: FichaError): Promise<boolean> {
    // Usar valor por defecto
    // Marcar campo como incompleto
    // Continuar sin bloquear
    return true;
  }
  
  private async recoverFromSystemError(error: FichaError): Promise<boolean> {
    // Restaurar último snapshot válido
    // Notificar al usuario discretamente
    return true;
  }
}
```

## Testing Strategy

### Dual Testing Approach

El sistema utiliza tanto tests unitarios como property-based tests:

- **Unit Tests**: Casos específicos, edge cases, integración de componentes
- **Property-Based Tests**: Verificación de propiedades universales con inputs generados

### Property-Based Testing Configuration

```typescript
// tests/properties/config.ts
import * as fc from 'fast-check';

// Mínimo 100 iteraciones por propiedad
const PBT_CONFIG = {
  numRuns: 100,
  verbose: true,
};

// Generadores personalizados
const pozoIdArb = fc.stringOf(fc.constantFrom('M', 'P', 'S'), { minLength: 1, maxLength: 1 })
  .chain(prefix => fc.integer({ min: 1, max: 9999 }).map(n => `${prefix}${n}`));

const nomenclaturaArb = fc.tuple(
  pozoIdArb,
  fc.constantFrom('P', 'T', 'I', 'A', 'F', 'M', 'E1', 'E2', 'S', 'S1', 'SUM1'),
  fc.constantFrom('T', 'Z', '')
).map(([id, tipo, subtipo]) => subtipo ? `${id}-${tipo}-${subtipo}` : `${id}-${tipo}`);
```

### Test Structure

```
tests/
├── unit/
│   ├── parsers/
│   │   ├── excelParser.test.ts
│   │   └── nomenclatura.test.ts
│   ├── stores/
│   │   ├── fichaStore.test.ts
│   │   └── globalStore.test.ts
│   └── components/
│       └── editor.test.tsx
├── properties/
│   ├── nomenclatura.property.ts    // Property 2
│   ├── sync.property.ts            // Property 3
│   ├── undoRedo.property.ts        // Property 4
│   ├── isolation.property.ts       // Property 5
│   ├── persistence.property.ts     // Property 6
│   ├── structure.property.ts       // Property 7
│   ├── errorContainment.property.ts // Property 8
│   └── validation.property.ts      // Property 10
└── integration/
    ├── uploadFlow.test.ts
    ├── editorFlow.test.ts
    └── pdfGeneration.test.ts
```
