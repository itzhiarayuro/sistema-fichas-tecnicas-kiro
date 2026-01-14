# Sistema de Fichas Técnicas de Pozos

Sistema completo para gestión, edición y generación de fichas técnicas de pozos con diseñador visual personalizable.

## 🎯 Características Principales

### 1. **Carga y Gestión de Datos**
- Importación de archivos Excel con validación robusta
- Soporte para múltiples pozos simultáneamente
- Persistencia automática en IndexedDB
- Recuperación ante fallos

### 2. **Editor Visual**
- Edición inline de campos
- Sincronización bidireccional editor ↔ preview
- Validación no bloqueante (permite continuar editando)
- Historial de cambios (Undo/Redo)
- Snapshots para recuperación rápida

### 3. **Diseñador de Fichas**
- Diseño visual drag-and-drop
- Herramientas de dibujo (rectángulos, círculos, líneas, triángulos)
- Preview en tiempo real
- Múltiples versiones de diseño
- Importación desde HTML

### 4. **Generación de PDF**
- Generación individual y batch
- Respeta diseño personalizado
- Manejo de campos repetibles (tuberías, sumideros, fotos)
- Compresión de imágenes

### 5. **Seguridad y Confiabilidad**
- Validación determinística
- Protección de estructura mínima
- Sanitización HTML
- Límites de tamaño configurables

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Páginas Next.js
│   ├── page.tsx                 # Dashboard principal
│   ├── editor/page.tsx          # Editor visual
│   └── designer/page.tsx        # Diseñador de fichas
├── components/
│   ├── layout/                  # Componentes de layout
│   ├── editor/                  # Componentes del editor
│   ├── designer/                # Componentes del diseñador
│   │   ├── DesignCanvas.tsx     # Canvas con drag-and-drop
│   │   ├── DesignPreview.tsx    # Preview modal
│   │   ├── DrawingTools.tsx     # Herramientas de dibujo
│   │   ├── FieldsPanel.tsx      # Panel de campos
│   │   ├── PropertiesPanel.tsx  # Panel de propiedades
│   │   └── ...
│   └── ui/                      # Componentes UI reutilizables
├── stores/
│   ├── fichaStore.ts            # Store de fichas (Zustand)
│   ├── designStore.ts           # Store de diseños (Zustand)
│   └── ...
├── types/
│   ├── ficha.ts                 # Tipos de fichas
│   ├── fichaDesign.ts           # Tipos de diseño
│   └── ...
├── lib/
│   ├── parsers/                 # Parsers (Excel, nomenclatura)
│   ├── validators/              # Validadores
│   ├── persistence/             # Persistencia (IndexedDB)
│   ├── pdf/                     # Generación de PDF
│   ├── domain/                  # Lógica de dominio
│   ├── lifecycle/               # Gestión de ciclo de vida
│   └── security/                # Capa de seguridad
└── tests/
    ├── unit/                    # Tests unitarios
    └── properties/              # Property-based tests
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

### Tests

```bash
npm test                # Ejecutar tests una vez
npm run test:watch     # Modo watch
```

## 📊 Flujo de Trabajo

### 1. Cargar Datos
1. Ve a Dashboard
2. Haz clic en "Cargar Archivo Excel"
3. Selecciona archivo con datos de pozos
4. El sistema valida y carga automáticamente

### 2. Editar Ficha
1. Selecciona un pozo del listado
2. Edita campos directamente en el editor
3. Los cambios se sincronizan en tiempo real
4. Usa Undo/Redo según sea necesario

### 3. Personalizar Diseño
1. Ve a "Diseñador de Fichas"
2. Arrastra campos desde el panel izquierdo
3. Usa herramientas de dibujo para agregar figuras
4. Ajusta propiedades en el panel derecho
5. Haz clic en "Ver Preview" para ver resultado

### 4. Generar PDF
1. Desde el editor, haz clic en "Generar PDF"
2. O desde el dashboard, selecciona múltiples pozos y "Generar Batch"
3. Los PDFs se descargan automáticamente

## 🏗️ Arquitectura

### State Management (Zustand)
- **fichaStore**: Gestión de fichas y editor
- **designStore**: Gestión de diseños

### Persistencia
- **IndexedDB**: Almacenamiento local
- **Schema Versioning**: Migraciones automáticas
- **Snapshots**: Recuperación rápida

### Validación
- **Validador No Bloqueante**: Permite edición continua
- **Validador Determinístico**: Para PDF y finalización
- **Invariantes**: Protección de estructura mínima

### Seguridad
- **Sanitización HTML**: Previene XSS
- **Validación de Tamaños**: Límites configurables
- **Validación de Base64**: Para imágenes

## 📋 Tipos de Datos

### Ficha
```typescript
interface FichaState {
  id: string;
  pozoId: string;
  status: 'draft' | 'editing' | 'complete';
  sections: FichaSection[];
  customizations: FichaCustomizations;
  lastModified: number;
  version: number;
}
```

### Diseño
```typescript
interface FichaDesign {
  id: string;
  name: string;
  pageConfig: PageConfig;
  theme: DesignTheme;
  fieldPlacements: FieldPlacement[];
  shapes: GeometricShape[];
  version: number;
}
```

## 🔧 Configuración

### Límites del Sistema
```typescript
const LIMITS = {
  MAX_FICHAS: 1000,
  MAX_PHOTOS_PER_POZO: 50,
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FICHA_SIZE: 10 * 1024 * 1024, // 10MB
};
```

### Campos Disponibles
- **Identificación**: 33 campos (ID, nombre, ubicación, etc)
- **Tuberías**: 9 campos (repetibles)
- **Sumideros**: 8 campos (repetibles)
- **Fotos**: 6 campos (repetibles)

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop**: 1280px+ (experiencia completa)
- **Tablet**: 768px-1279px (layout adaptado)
- **Móvil**: <768px (interfaz simplificada)

## ♿ Accesibilidad

- Navegación por teclado completa
- Roles ARIA apropiados
- Contraste WCAG AA
- Tooltips descriptivos

## 🧪 Testing

### Property-Based Tests
Validan propiedades universales del sistema:
- Robustez de carga de archivos
- Nomenclatura round-trip
- Sincronización bidireccional
- Persistencia y recuperación
- Protección de estructura
- Validación no bloqueante

### Unit Tests
Pruebas específicas de componentes y funciones.

## 📚 Documentación Adicional

- [DICCIONARIO_CAMPOS.md](public/guias/DICCIONARIO_CAMPOS.md) - Descripción de cada campo
- [SYSTEM_BOUNDARIES.md](docs/SYSTEM_BOUNDARIES.md) - Límites del sistema
- [PERSISTENCE_ARCHITECTURE.md](docs/PERSISTENCE_ARCHITECTURE.md) - Arquitectura de persistencia

## 🔮 Trabajo Futuro

- [ ] Sincronización multiusuario (CRDT)
- [ ] Auditoría y trazabilidad completa
- [ ] Integración con bases de datos remotas
- [ ] Validación normativa automática
- [ ] Exportación a múltiples formatos
- [ ] Versionado de PDFs

## 📝 Licencia

Proyecto interno - Todos los derechos reservados

## 👥 Contribución

Para agregar nuevos campos:
1. Actualiza `src/types/pozo.ts`
2. Agrega validación en `src/lib/validators/`
3. Actualiza diccionario en `public/guias/DICCIONARIO_CAMPOS.md`
4. Crea tests en `src/tests/`

## 🆘 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.
