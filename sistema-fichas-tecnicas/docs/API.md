# API Documentation

## Visión General

El Sistema de Fichas Técnicas proporciona una API completa para gestionar fichas, diseños y generación de PDFs. La mayoría de las operaciones se realizan localmente en el navegador usando Zustand stores.

## Stores (Zustand)

### fichaStore

Gestiona el estado de fichas y editor visual.

#### Estado
```typescript
interface FichaStoreState {
  fichas: Map<string, FichaState>;
  editorState: EditorState | null;
  history: HistoryEntry[];
  historyIndex: number;
}
```

#### Acciones

##### `createFicha(pozoId: string): FichaState`
Crea una nueva ficha para un pozo.

```typescript
const store = useFichaStore();
const ficha = store.createFicha('pozo-123');
```

##### `updateField(fichaId: string, sectionId: string, field: string, value: string): void`
Actualiza un campo en una sección.

```typescript
store.updateField('ficha-1', 'identificacion', 'codigo', 'P001');
```

##### `updateSection(fichaId: string, sectionId: string, updates: Partial<FichaSection>): void`
Actualiza una sección completa.

```typescript
store.updateSection('ficha-1', 'identificacion', {
  visible: true,
  locked: false,
});
```

##### `undo(): void`
Deshace el último cambio.

```typescript
store.undo();
```

##### `redo(): void`
Rehace el último cambio deshecho.

```typescript
store.redo();
```

##### `createSnapshot(name: string): void`
Crea un snapshot del estado actual.

```typescript
store.createSnapshot('Antes de cambios importantes');
```

##### `restoreSnapshot(snapshotId: string): void`
Restaura un snapshot anterior.

```typescript
store.restoreSnapshot('snapshot-123');
```

##### `getFicha(fichaId: string): FichaState | undefined`
Obtiene una ficha por ID.

```typescript
const ficha = store.getFicha('ficha-1');
```

##### `getAllFichas(): FichaState[]`
Obtiene todas las fichas.

```typescript
const fichas = store.getAllFichas();
```

##### `deleteFicha(fichaId: string): void`
Elimina una ficha.

```typescript
store.deleteFicha('ficha-1');
```

### designStore

Gestiona diseños de fichas.

#### Estado
```typescript
interface DesignStoreState {
  designs: Map<string, FichaDesign>;
  templates: Map<string, DesignTemplate[]>;
  editorState: DesignEditorState | null;
  defaultDesignId: string | null;
}
```

#### Acciones

##### `createDesign(design: FichaDesign): void`
Crea un nuevo diseño.

```typescript
const store = useDesignStore();
store.createDesign({
  id: 'design-1',
  name: 'Mi Diseño',
  // ... configuración
});
```

##### `updateDesign(id: string, updates: Partial<FichaDesign>): void`
Actualiza un diseño.

```typescript
store.updateDesign('design-1', {
  name: 'Nuevo Nombre',
  fieldPlacements: [...],
});
```

##### `deleteDesign(id: string): void`
Elimina un diseño.

```typescript
store.deleteDesign('design-1');
```

##### `getDesignById(id: string): FichaDesign | undefined`
Obtiene un diseño por ID.

```typescript
const design = store.getDesignById('design-1');
```

##### `getAllDesigns(): FichaDesign[]`
Obtiene todos los diseños.

```typescript
const designs = store.getAllDesigns();
```

##### `createVersion(designId: string, versionName: string, changelog?: string): void`
Crea una versión de un diseño.

```typescript
store.createVersion('design-1', 'v1.0', 'Versión inicial');
```

##### `getVersions(designId: string): DesignTemplate[]`
Obtiene todas las versiones de un diseño.

```typescript
const versions = store.getVersions('design-1');
```

##### `restoreVersion(designId: string, versionId: string): void`
Restaura una versión anterior.

```typescript
store.restoreVersion('design-1', 'version-123');
```

##### `setDefaultDesign(designId: string): void`
Establece un diseño como predeterminado.

```typescript
store.setDefaultDesign('design-1');
```

##### `duplicateDesign(designId: string, newName: string): FichaDesign | undefined`
Duplica un diseño.

```typescript
const newDesign = store.duplicateDesign('design-1', 'Copia de Mi Diseño');
```

## Funciones Utilitarias

### Parsers

#### `parseExcel(file: File): Promise<ParseResult>`
Parsea un archivo Excel.

```typescript
import { parseExcel } from '@/lib/parsers/excelParser';

const file = new File(['...'], 'pozos.xlsx');
const result = await parseExcel(file);

if (result.success) {
  console.log('Pozos cargados:', result.pozos);
} else {
  console.error('Errores:', result.errors);
}
```

#### `parseNomenclatura(filename: string): NomenclaturaResult`
Parsea la nomenclatura de un archivo de foto.

```typescript
import { parseNomenclatura } from '@/lib/parsers/nomenclaturaParser';

const result = parseNomenclatura('P001_PRINCIPAL_001.jpg');
console.log(result.pozoId); // 'P001'
console.log(result.tipo); // 'PRINCIPAL'
console.log(result.numero); // 1
```

### Validadores

#### `validatePozo(pozo: Pozo): ValidationResult`
Valida un pozo.

```typescript
import { validatePozo } from '@/lib/validators/pozoValidator';

const result = validatePozo(pozo);
if (!result.isValid) {
  console.error('Errores de validación:', result.errors);
}
```

#### `isFichaValid(ficha: FichaState): boolean`
Valida una ficha completa (para PDF).

```typescript
import { isFichaValid } from '@/lib/validators/fichaValidatorFinal';

if (isFichaValid(ficha)) {
  // Generar PDF
}
```

### PDF

#### `generatePDF(ficha: FichaState, design: FichaDesign): Promise<Blob>`
Genera un PDF de una ficha.

```typescript
import { generatePDF } from '@/lib/pdf/designBasedPdfGenerator';

const blob = await generatePDF(ficha, design);
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `ficha-${ficha.id}.pdf`;
a.click();
```

#### `generateBatchPDF(fichas: FichaState[], design: FichaDesign): Promise<Blob>`
Genera un PDF con múltiples fichas.

```typescript
import { generateBatchPDF } from '@/lib/pdf/designBasedPdfGenerator';

const blob = await generateBatchPDF(fichas, design);
// Descargar blob
```

### Persistencia

#### `saveFicha(ficha: FichaState): Promise<void>`
Guarda una ficha en IndexedDB.

```typescript
import { saveFicha } from '@/lib/persistence/safePersist';

await saveFicha(ficha);
```

#### `loadFicha(fichaId: string): Promise<FichaState | null>`
Carga una ficha de IndexedDB.

```typescript
import { loadFicha } from '@/lib/persistence/safePersist';

const ficha = await loadFicha('ficha-1');
```

#### `getAllFichas(): Promise<FichaState[]>`
Carga todas las fichas de IndexedDB.

```typescript
import { getAllFichas } from '@/lib/persistence/safePersist';

const fichas = await getAllFichas();
```

#### `deleteFicha(fichaId: string): Promise<void>`
Elimina una ficha de IndexedDB.

```typescript
import { deleteFicha } from '@/lib/persistence/safePersist';

await deleteFicha('ficha-1');
```

## Hooks React

### `useFichaStore()`
Hook para acceder al store de fichas.

```typescript
import { useFichaStore } from '@/stores';

export function MyComponent() {
  const fichas = useFichaStore((state) => state.fichas);
  const updateField = useFichaStore((state) => state.updateField);
  
  return (
    // ...
  );
}
```

### `useDesignStore()`
Hook para acceder al store de diseños.

```typescript
import { useDesignStore } from '@/stores';

export function MyComponent() {
  const designs = useDesignStore((state) => state.designs);
  const createDesign = useDesignStore((state) => state.createDesign);
  
  return (
    // ...
  );
}
```

## Ejemplos de Uso

### Cargar y Editar Ficha

```typescript
import { useFichaStore } from '@/stores';
import { parseExcel } from '@/lib/parsers/excelParser';

export function LoadAndEditExample() {
  const createFicha = useFichaStore((state) => state.createFicha);
  const updateField = useFichaStore((state) => state.updateField);
  
  const handleFileUpload = async (file: File) => {
    // Parsear Excel
    const result = await parseExcel(file);
    
    if (result.success) {
      // Crear fichas para cada pozo
      result.pozos.forEach((pozo) => {
        const ficha = createFicha(pozo.id);
        
        // Actualizar campos
        updateField(ficha.id, 'identificacion', 'codigo', pozo.codigo);
        updateField(ficha.id, 'identificacion', 'direccion', pozo.direccion);
      });
    }
  };
  
  return (
    <input
      type="file"
      accept=".xlsx"
      onChange={(e) => handleFileUpload(e.target.files?.[0]!)}
    />
  );
}
```

### Generar PDF

```typescript
import { useFichaStore, useDesignStore } from '@/stores';
import { generatePDF } from '@/lib/pdf/designBasedPdfGenerator';

export function GeneratePDFExample() {
  const fichas = useFichaStore((state) => state.fichas);
  const defaultDesign = useDesignStore((state) => state.getDefaultDesign());
  
  const handleGeneratePDF = async (fichaId: string) => {
    const ficha = fichas.get(fichaId);
    
    if (ficha && defaultDesign) {
      const blob = await generatePDF(ficha, defaultDesign);
      
      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha-${fichaId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <button onClick={() => handleGeneratePDF('ficha-1')}>
      Generar PDF
    </button>
  );
}
```

### Crear Diseño Personalizado

```typescript
import { useDesignStore } from '@/stores';

export function CreateDesignExample() {
  const createDesign = useDesignStore((state) => state.createDesign);
  
  const handleCreateDesign = () => {
    createDesign({
      id: `design-${Date.now()}`,
      name: 'Mi Diseño Personalizado',
      description: 'Diseño para fichas de pozos profundos',
      pageConfig: {
        size: 'A4',
        orientation: 'portrait',
        width: 210,
        height: 297,
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
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
      fieldPlacements: [
        {
          id: 'placement-1',
          fieldId: 'codigo',
          fieldName: 'Código',
          fieldType: 'text',
          position: { x: 10, y: 10, width: 100, height: 20 },
          style: {
            fontSize: 12,
            fontFamily: 'Inter',
            color: '#333333',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 4,
          },
          isRepeatable: false,
          zIndex: 1,
          locked: false,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      shapes: [],
      isDefault: false,
      isGlobal: false,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };
  
  return (
    <button onClick={handleCreateDesign}>
      Crear Diseño
    </button>
  );
}
```

## Códigos de Error

### Validación
- `VALIDATION_ERROR`: Error de validación de datos
- `INVALID_FIELD`: Campo inválido
- `MISSING_REQUIRED_FIELD`: Campo requerido faltante

### Persistencia
- `PERSISTENCE_ERROR`: Error al guardar/cargar
- `STORAGE_QUOTA_EXCEEDED`: Cuota de almacenamiento excedida
- `CORRUPTED_DATA`: Datos corruptos

### PDF
- `PDF_GENERATION_ERROR`: Error al generar PDF
- `INVALID_DESIGN`: Diseño inválido
- `MISSING_REQUIRED_FIELDS`: Campos requeridos faltantes

### Parser
- `PARSE_ERROR`: Error al parsear archivo
- `INVALID_FILE_FORMAT`: Formato de archivo inválido
- `UNSUPPORTED_FILE_TYPE`: Tipo de archivo no soportado

## Rate Limiting

No hay rate limiting en operaciones locales. Las operaciones son instantáneas.

## Versionado

La API sigue versionado semántico:
- **MAJOR**: Cambios incompatibles
- **MINOR**: Nuevas características compatibles
- **PATCH**: Correcciones de bugs

Versión actual: 0.1.0

## Soporte

Para preguntas o problemas con la API, contacta al equipo de desarrollo.
