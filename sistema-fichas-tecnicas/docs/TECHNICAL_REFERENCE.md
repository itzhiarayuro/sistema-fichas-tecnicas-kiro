# Referencia Técnica - Sistema de Fichas Técnicas

## Índice Rápido

- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Directorios](#estructura-de-directorios)
- [Flujo de Datos](#flujo-de-datos)
- [APIs Principales](#apis-principales)
- [Persistencia](#persistencia)
- [Generación de PDF](#generación-de-pdf)
- [Manejo de Errores](#manejo-de-errores)
- [Performance](#performance)
- [Seguridad](#seguridad)

---

## Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────┐
│      Interfaz de Usuario (UI)       │
│  (React Components, Next.js Pages)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Capa de Presentación             │
│  (Componentes, Hooks, Estado)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Capa de Lógica de Negocio        │
│  (Adaptadores, Validadores)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Capa de Persistencia             │
│  (IndexedDB, LocalStorage)          │
└─────────────────────────────────────┘
```

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
2. **Adaptadores**: Conversión explícita entre formatos externos e internos
3. **Validación Multicapa**: Validación en parser, adaptador y persistencia
4. **Recuperación ante Errores**: Estados seguros y snapshots para recuperación
5. **Tipado Fuerte**: TypeScript para prevenir errores en tiempo de compilación

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Type Safety**: TypeScript 5+

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: IndexedDB (cliente)

### Librerías Clave
- **PDF Generation**: jsPDF, html2canvas
- **Excel Parsing**: xlsx
- **Validation**: Zod
- **Date Handling**: date-fns

### Herramientas de Desarrollo
- **Build**: Next.js built-in
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint
- **Formatting**: Prettier

---

## Estructura de Directorios

```
sistema-fichas-tecnicas/
├── src/
│   ├── app/                          # Páginas Next.js
│   │   ├── page.tsx                  # Página principal
│   │   ├── editor/
│   │   │   └── page.tsx              # Editor de fichas
│   │   ├── upload/
│   │   │   └── page.tsx              # Carga de Excel
│   │   └── api/                      # API Routes
│   │
│   ├── components/                   # Componentes React
│   │   ├── editor/                   # Componentes del editor
│   │   ├── upload/                   # Componentes de carga
│   │   ├── common/                   # Componentes reutilizables
│   │   └── layout/                   # Componentes de layout
│   │
│   ├── lib/                          # Lógica de negocio
│   │   ├── parsers/                  # Parsers (Excel, CSV)
│   │   ├── adapters/                 # Adaptadores de datos
│   │   ├── validators/               # Validadores
│   │   ├── persistence/              # Persistencia (IndexedDB)
│   │   ├── pdf/                      # Generación de PDF
│   │   ├── helpers/                  # Funciones auxiliares
│   │   └── examples/                 # Ejemplos de uso
│   │
│   ├── stores/                       # Estado global (Zustand)
│   │   ├── pozoStore.ts              # Store de pozos
│   │   └── uiStore.ts                # Store de UI
│   │
│   ├── types/                        # Definiciones TypeScript
│   │   ├── pozo.ts                   # Tipos de pozo
│   │   ├── excel.ts                  # Tipos de Excel
│   │   └── index.ts                  # Exportaciones
│   │
│   └── domain/                       # Lógica de dominio
│       ├── pozo/                     # Dominio de pozos
│       └── validation/               # Reglas de validación
│
├── public/                           # Archivos estáticos
│   ├── ejemplos/                     # Archivos de ejemplo
│   │   ├── ejemplo_pozos.xlsx        # Excel de ejemplo
│   │   └── imagenes/                 # Imágenes de ejemplo
│   └── templates/                    # Plantillas de PDF
│
├── docs/                             # Documentación
│   ├── API.md                        # Documentación de API
│   ├── FIELD_DICTIONARY.md           # Diccionario de campos
│   ├── TECHNICAL_REFERENCE.md        # Esta referencia
│   ├── PERSISTENCE_ARCHITECTURE.md   # Arquitectura de persistencia
│   ├── INTEGRATION_GUIDE.md          # Guía de integración
│   └── RESPONSIVE_DESIGN.md          # Diseño responsivo
│
├── .kiro/                            # Configuración Kiro
│   └── specs/                        # Especificaciones
│
├── package.json                      # Dependencias
├── tsconfig.json                     # Configuración TypeScript
├── next.config.js                    # Configuración Next.js
└── tailwind.config.js                # Configuración Tailwind
```

---

## Flujo de Datos

### 1. Carga de Excel

```
Usuario selecciona archivo
    ↓
excelParser.parse(file)
    ↓
Extrae datos de hojas
    ↓
pozoAdapter.adapt(rawData)
    ↓
Convierte a formato interno
    ↓
validator.validate(adaptedData)
    ↓
Valida tipos y restricciones
    ↓
persistenceStore.save(validData)
    ↓
Guarda en IndexedDB
    ↓
UI actualiza con nuevos datos
```

### 2. Edición de Ficha

```
Usuario modifica campo
    ↓
onChange event en componente
    ↓
pozoStore.updatePozo(id, changes)
    ↓
Valida cambios
    ↓
persistenceStore.update(id, changes)
    ↓
Guarda en IndexedDB
    ↓
UI actualiza en tiempo real
```

### 3. Generación de PDF

```
Usuario hace clic en "Exportar PDF"
    ↓
pdfGenerator.generate(pozo)
    ↓
Renderiza HTML con datos
    ↓
html2canvas convierte a imagen
    ↓
jsPDF crea documento
    ↓
Descarga archivo
```

---

## APIs Principales

### PozoStore (Zustand)

```typescript
// Obtener todos los pozos
const pozos = pozoStore((state) => state.pozos);

// Obtener pozo por ID
const pozo = pozoStore((state) => state.getPozoById(id));

// Crear nuevo pozo
pozoStore.setState((state) => ({
  pozos: [...state.pozos, newPozo]
}));

// Actualizar pozo
pozoStore.setState((state) => ({
  pozos: state.pozos.map(p => p.ID_POZO === id ? {...p, ...changes} : p)
}));

// Eliminar pozo
pozoStore.setState((state) => ({
  pozos: state.pozos.filter(p => p.ID_POZO !== id)
}));
```

### ExcelParser

```typescript
import { excelParser } from '@/lib/parsers/excelParser';

// Parsear archivo Excel
const data = await excelParser.parse(file);
// Retorna: { pozos: Pozo[], errors: ValidationError[] }
```

### PozoAdapter

```typescript
import { pozoAdapter } from '@/lib/adapters/pozoAdapter';

// Adaptar datos de Excel a formato interno
const adaptedPozo = pozoAdapter.adapt(rawExcelRow);
// Retorna: Pozo (con tipos correctos y valores seguros)
```

### PersistenceStore

```typescript
import { persistenceStore } from '@/lib/persistence/persistenceStore';

// Guardar pozos
await persistenceStore.savePozos(pozos);

// Cargar pozos
const pozos = await persistenceStore.loadPozos();

// Actualizar pozo
await persistenceStore.updatePozo(id, changes);

// Eliminar pozo
await persistenceStore.deletePozo(id);
```

### PDFGenerator

```typescript
import { pdfGenerator } from '@/lib/pdf/pdfGenerator';

// Generar PDF de un pozo
const pdf = await pdfGenerator.generate(pozo);

// Generar PDF de múltiples pozos
const pdfs = await pdfGenerator.generateBatch(pozos);

// Descargar PDF
pdfGenerator.download(pdf, 'pozo.pdf');
```

---

## Persistencia

### IndexedDB Schema

```javascript
// Base de datos: "sistema-fichas-tecnicas"
// Versión: 1

// Object Store: "pozos"
{
  keyPath: "ID_POZO",
  indexes: [
    { name: "ESTADO", keyPath: "ESTADO" },
    { name: "TIPO", keyPath: "TIPO" },
    { name: "FECHA_MODIFICACION", keyPath: "FECHA_MODIFICACION" }
  ]
}

// Object Store: "snapshots"
{
  keyPath: "id",
  indexes: [
    { name: "timestamp", keyPath: "timestamp" }
  ]
}
```

### Ciclo de Vida de Datos

1. **Carga**: Datos se cargan en IndexedDB
2. **Edición**: Cambios se guardan inmediatamente
3. **Sincronización**: Cambios se sincronizan entre pestañas
4. **Snapshots**: Se crean snapshots periódicamente
5. **Recuperación**: En caso de error, se restaura desde snapshot

---

## Generación de PDF

### Proceso

1. **Renderización**: Se renderiza HTML con datos del pozo
2. **Captura**: html2canvas captura el HTML como imagen
3. **Creación**: jsPDF crea documento PDF
4. **Estilos**: Se aplican estilos CSS personalizados
5. **Descarga**: Se descarga el archivo

### Plantillas

Las plantillas de PDF se encuentran en `public/templates/`:
- `pozo-template.html` - Plantilla estándar
- `pozo-template-detallado.html` - Plantilla con más detalles

---

## Manejo de Errores

### Estrategia de Recuperación

```
Error ocurre
    ↓
¿Hay estado válido guardado?
    ├─ Sí → Restaurar desde IndexedDB
    └─ No → ¿Hay snapshot?
            ├─ Sí → Restaurar desde snapshot
            └─ No → Usar estado base seguro
    ↓
Mostrar mensaje al usuario
    ↓
Permitir continuar trabajando
```

### Tipos de Errores

| Error | Causa | Recuperación |
|-------|-------|--------------|
| Parse Error | Excel inválido | Mostrar mensaje, permitir reintentar |
| Validation Error | Datos inválidos | Marcar campos, permitir editar |
| Persistence Error | IndexedDB falla | Usar memoria, advertir al usuario |
| PDF Error | Generación falla | Mostrar mensaje, permitir reintentar |

---

## Performance

### Optimizaciones

1. **Lazy Loading**: Componentes se cargan bajo demanda
2. **Memoization**: Componentes se memorizan para evitar re-renders
3. **Indexing**: IndexedDB usa índices para búsquedas rápidas
4. **Batching**: Operaciones se agrupan cuando es posible
5. **Compression**: Datos se comprimen antes de guardar

### Métricas

- **Carga de página**: < 2s
- **Importación de Excel**: < 5s (para 1000 pozos)
- **Generación de PDF**: < 3s
- **Sincronización**: < 100ms

---

## Seguridad

### Medidas Implementadas

1. **Validación de Entrada**: Todos los inputs se validan
2. **Tipado Fuerte**: TypeScript previene errores de tipo
3. **Sanitización**: Datos se sanitizan antes de mostrar
4. **CORS**: Se configura correctamente para APIs externas
5. **CSP**: Content Security Policy se implementa

### Datos Sensibles

- Los datos se almacenan localmente en IndexedDB
- No se envían a servidores externos
- Se pueden exportar/importar manualmente
- El usuario tiene control total

---

## Debugging

### DevTools

1. Abrir DevTools (F12)
2. Ir a "Application" → "IndexedDB"
3. Expandir "sistema-fichas-tecnicas"
4. Ver datos en "pozos" y "snapshots"

### Logs

```typescript
// Habilitar logs en consola
localStorage.setItem('DEBUG', 'true');

// Ver logs de persistencia
console.log(persistenceStore.getLogs());

// Ver logs de validación
console.log(validator.getLogs());
```

### Troubleshooting

| Problema | Solución |
|----------|----------|
| Datos no se guardan | Verificar IndexedDB en DevTools |
| PDF no se genera | Verificar permisos de descarga |
| Excel no se carga | Verificar formato .xlsx |
| Cambios no se sincronizan | Recargar página |

---

**Última actualización**: Enero 2026
**Versión**: 1.0
