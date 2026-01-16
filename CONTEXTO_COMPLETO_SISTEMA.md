# CONTEXTO COMPLETO DEL SISTEMA - Fichas Técnicas de Pozos

## 1. VISIÓN GENERAL

### 1.1 Propósito del Sistema
Sistema web para gestión integral de fichas técnicas de pozos de alcantarillado. Permite inspectores de campo capturar, editar, diseñar y generar reportes en PDF de inspecciones de infraestructura de saneamiento.

### 1.2 Usuarios Objetivo
- **Inspectores de Campo**: Capturan datos en Excel
- **Técnicos de Oficina**: Editan y diseñan fichas
- **Administradores**: Generan reportes y PDFs
- **Supervisores**: Revisan y validan información

### 1.3 Casos de Uso Principales

#### UC1: Importar Datos de Excel
```
Actor: Inspector de Campo
Precondición: Archivo Excel con estructura válida
Flujo:
  1. Usuario carga archivo Excel
  2. Sistema valida estructura
  3. Sistema crea fichas técnicas
  4. Sistema persiste en IndexedDB
  5. Sistema notifica éxito
Postcondición: Fichas disponibles para edición
```

#### UC2: Editar Ficha Técnica
```
Actor: Técnico de Oficina
Precondición: Ficha técnica existe
Flujo:
  1. Usuario abre editor
  2. Sistema carga ficha
  3. Usuario edita campos
  4. Sistema valida en tiempo real
  5. Usuario guarda cambios
  6. Sistema persiste cambios
Postcondición: Cambios guardados y sincronizados
```

#### UC3: Diseñar Layout de Ficha
```
Actor: Técnico de Oficina
Precondición: Ninguna
Flujo:
  1. Usuario abre diseñador
  2. Usuario arrastra campos al canvas
  3. Usuario personaliza estilos
  4. Usuario previsualiza diseño
  5. Usuario guarda diseño
Postcondición: Diseño disponible para generar PDFs
```

#### UC4: Generar PDF
```
Actor: Técnico de Oficina
Precondición: Ficha técnica y diseño existen
Flujo:
  1. Usuario solicita PDF
  2. Sistema valida ficha
  3. Sistema comprime imágenes
  4. Sistema genera PDF
  5. Sistema descarga PDF
Postcondición: PDF descargado en cliente
```

---

## 2. ESTRUCTURA DE DATOS

### 2.1 Entidad: Pozo (33 Campos)

#### Identificación (6 campos)
```typescript
{
  idPozo: "PZ1666",              // Identificador único
  coordenadaX: -74.123456,       // Longitud
  coordenadaY: 4.678901,         // Latitud
  fecha: "2024-01-15",           // Fecha de inspección
  levanto: "Juan Pérez",         // Inspector
  estado: "Bueno"                // Estado general
}
```

#### Ubicación (4 campos)
```typescript
{
  direccion: "Calle 5 #123",
  barrio: "Centro",
  elevacion: 2600,               // Metros sobre el nivel del mar
  profundidad: 3.5               // Metros de profundidad
}
```

#### Componentes (23 campos)
```typescript
{
  // Tapa
  existeTapa: true,
  estadoTapa: "Bueno",
  
  // Cilindro
  existeCilindro: true,
  diametroCilindro: 1.2,
  
  // Sistema
  sistema: "Separativo",
  anoInstalacion: 2010,
  
  // Cámara
  tipoCamara: "TÍPICA DE FONDO DE CAÍDA",
  
  // Pavimento
  estructuraPavimento: "Concreto",
  
  // Material de tapa
  materialTapa: "Hierro Fundido",
  
  // Cono
  existeCono: true,
  tipoCono: "Cónico",
  materialCono: "Concreto",
  estadoCono: "Bueno",
  
  // Cilindro (material y estado)
  materialCilindro: "Concreto",
  estadoCilindro: "Regular",
  
  // Canuela
  existeCanuela: true,
  materialCanuela: "Concreto",
  estadoCanuela: "Bueno",
  
  // Peldaños
  existePeldanos: true,
  materialPeldanos: "Hierro",
  numeroPeldanos: 8,
  estadoPeldanos: "Bueno"
}
```

#### Observaciones (1 campo)
```typescript
{
  observaciones: "Pozo en buen estado, requiere limpieza anual"
}
```

#### Relaciones
```typescript
{
  tuberias: [
    {
      tipo: "entrada",
      diametro: 0.3,
      material: "PVC",
      estado: "Bueno"
    }
  ],
  sumideros: [
    {
      tipo: "Rejilla",
      ubicacion: "Esquina NE",
      estado: "Regular"
    }
  ],
  fotos: {
    principal: "base64...",
    entradas: ["base64..."],
    salidas: ["base64..."],
    sumideros: ["base64..."],
    otras: ["base64..."]
  }
}
```

### 2.2 Entidad: Ficha Técnica

```typescript
interface FichaState {
  id: "ficha-001",
  pozoId: "PZ1666",
  status: "editing",
  sections: [
    {
      id: "sec-001",
      type: "identificacion",
      order: 1,
      visible: true,
      locked: false,
      content: {
        idPozo: { value: "PZ1666", source: "excel" },
        coordenadaX: { value: "-74.123456", source: "excel" },
        // ...
      }
    }
  ],
  customizations: {
    colors: {
      headerBg: "#1F4E79",
      headerText: "#FFFFFF",
      // ...
    },
    fonts: {
      titleSize: 24,
      labelSize: 12,
      valueSize: 11,
      fontFamily: "Arial"
    },
    spacing: {
      sectionGap: 20,
      fieldGap: 10,
      padding: 15,
      margin: 10
    },
    template: "default",
    isGlobal: false
  },
  history: [
    {
      id: "hist-001",
      timestamp: 1705334400000,
      action: "FIELD_EDIT",
      previousState: { /* ... */ },
      newState: { /* ... */ }
    }
  ],
  errors: [
    {
      id: "err-001",
      fichaId: "ficha-001",
      type: "data",
      severity: "warning",
      message: "Campo coordenadaX fuera de rango",
      userMessage: "Coordenada X parece incorrecta",
      field: "coordenadaX",
      timestamp: 1705334400000,
      resolved: false
    }
  ],
  lastModified: 1705334400000,
  version: 5
}
```

### 2.3 Entidad: Diseño de Ficha

```typescript
interface DesignState {
  id: "design-001",
  name: "Diseño Estándar",
  pageConfig: {
    width: 210,      // mm
    height: 297,     // mm
    orientation: "portrait",
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  theme: {
    primaryColor: "#1F4E79",
    secondaryColor: "#2E7D32",
    textColor: "#333333",
    backgroundColor: "#FFFFFF"
  },
  fieldPlacements: [
    {
      id: "place-001",
      fieldId: "idPozo",
      fieldName: "ID Pozo",
      fieldType: "text",
      position: { x: 20, y: 20, width: 100, height: 20 },
      style: {
        fontSize: 14,
        fontFamily: "Arial",
        color: "#000000",
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        padding: 5,
        fontWeight: "bold",
        textAlign: "left"
      },
      customLabel: "Identificación del Pozo",
      isRepeatable: false,
      zIndex: 1,
      locked: false,
      visible: true,
      createdAt: 1705334400000
    }
  ],
  shapes: [
    {
      id: "shape-001",
      type: "rectangle",
      position: { x: 10, y: 10, width: 190, height: 277 },
      style: {
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeWidth: 1
      }
    }
  ],
  images: [
    {
      id: "img-001",
      type: "logo",
      position: { x: 170, y: 10, width: 30, height: 30 },
      src: "base64...",
      alt: "Logo"
    }
  ],
  version: 1
}
```

---

## 3. FLUJOS DE DATOS

### 3.1 Flujo de Importación

```
Excel File
    ↓
[Validación MIME]
    ↓
[Validación Tamaño]
    ↓
[Parsing con xlsx]
    ↓
[Validación Estructura]
    ↓
[Validación de Datos]
    ↓
[Creación de Fichas]
    ↓
[Persistencia IndexedDB]
    ↓
[Actualización Zustand]
    ↓
[Notificación UI]
    ↓
Fichas Disponibles
```

### 3.2 Flujo de Edición

```
Usuario Abre Editor
    ↓
[Carga de IndexedDB]
    ↓
[Validación de Integridad]
    ↓
[Renderizado en UI]
    ↓
Usuario Edita Campo
    ↓
[Validación No Bloqueante]
    ↓
[Actualización Zustand]
    ↓
[Snapshot Automático]
    ↓
[Persistencia IndexedDB]
    ↓
[Sincronización Bidireccional]
    ↓
Cambios Guardados
```

### 3.3 Flujo de Generación de PDF

```
Usuario Solicita PDF
    ↓
[Validación de Ficha]
    ↓
[Obtención de Datos]
    ↓
[Obtención de Imágenes]
    ↓
[Compresión de Imágenes]
    ↓
[Generación con jsPDF]
    ↓
[Caché de PDF]
    ↓
[Descarga]
    ↓
PDF Descargado
```

---

## 4. ARQUITECTURA TÉCNICA

### 4.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                         │
│  React 18 + TypeScript + Tailwind CSS + Zustand        │
│  Componentes: Editor, Diseñador, Listados, Upload      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  LÓGICA DE NEGOCIO                      │
│  Validadores, Parsers, Servicios, Factories            │
│  Ubicación: src/lib/                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    PERSISTENCIA                         │
│  IndexedDB + Migraciones + Snapshots                    │
│  Ubicación: src/lib/persistence/                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   ALMACENAMIENTO                        │
│  IndexedDB (Local Storage del Navegador)                │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Componentes Principales

```
App
├── Header
├── Sidebar
├── Main Content
│   ├── Dashboard
│   ├── Editor
│   │   ├── FieldEditor
│   │   ├── SectionPanel
│   │   └── PreviewPanel
│   ├── Designer
│   │   ├── DesignCanvas
│   │   ├── FieldsPanel
│   │   ├── PropertiesPanel
│   │   └── DesignPreview
│   ├── PozoList
│   │   ├── PozoCard
│   │   ├── PozoFilters
│   │   └── PozoStatusBadge
│   └── Upload
│       ├── FileUploader
│       ├── ValidationResults
│       └── ProgressBar
└── Footer
```

### 4.3 Gestión de Estado (Zustand)

```
Global Store
├── fichaStore
│   ├── fichas: Map<string, FichaState>
│   ├── currentFichaId: string
│   ├── addFicha()
│   ├── updateFicha()
│   ├── deleteFicha()
│   └── getFicha()
├── designStore
│   ├── designs: Map<string, DesignState>
│   ├── currentDesignId: string
│   ├── addDesign()
│   ├── updateDesign()
│   └── getDesign()
├── globalStore
│   ├── pozos: Map<string, Pozo>
│   ├── loading: boolean
│   ├── error: Error | null
│   └── notifications: Notification[]
└── uiStore
    ├── modals: Map<string, boolean>
    ├── sidebarOpen: boolean
    ├── theme: 'light' | 'dark'
    └── toggleModal()
```

---

## 5. REQUISITOS FUNCIONALES

### 5.1 Requisitos de Importación
- RF1: Importar datos desde Excel
- RF2: Validar estructura de Excel
- RF3: Validar datos importados
- RF4: Crear fichas automáticamente
- RF5: Mostrar errores de importación

### 5.2 Requisitos de Edición
- RF6: Editar campos de ficha
- RF7: Validar cambios en tiempo real
- RF8: Guardar cambios automáticamente
- RF9: Deshacer/Rehacer cambios
- RF10: Mostrar historial de cambios

### 5.3 Requisitos de Diseño
- RF11: Diseñar layout de ficha
- RF12: Arrastrar campos al canvas
- RF13: Personalizar estilos
- RF14: Previsualizar diseño
- RF15: Guardar diseño

### 5.4 Requisitos de PDF
- RF16: Generar PDF de ficha
- RF17: Aplicar diseño personalizado
- RF18: Comprimir imágenes
- RF19: Descargar PDF
- RF20: Generar múltiples PDFs

### 5.5 Requisitos de Persistencia
- RF21: Persistir fichas en IndexedDB
- RF22: Recuperar fichas de IndexedDB
- RF23: Sincronizar cambios
- RF24: Crear snapshots automáticos
- RF25: Recuperar desde snapshots

---

## 6. REQUISITOS NO FUNCIONALES

### 6.1 Rendimiento
- RNF1: Importación < 10 segundos para 1000 fichas
- RNF2: Generación de PDF < 30 segundos
- RNF3: Edición sin lag
- RNF4: Interfaz responsiva

### 6.2 Seguridad
- RNF5: Validación de entrada
- RNF6: Sanitización HTML
- RNF7: Protección contra XSS
- RNF8: Encriptación de datos sensibles

### 6.3 Confiabilidad
- RNF9: Recuperación ante fallos
- RNF10: Snapshots automáticos
- RNF11: Validación de integridad
- RNF12: Manejo de errores

### 6.4 Escalabilidad
- RNF13: Soportar 1000+ fichas
- RNF14: Soportar 50+ imágenes por ficha
- RNF15: Soportar 100+ diseños

### 6.5 Usabilidad
- RNF16: Interfaz intuitiva
- RNF17: Mensajes de error claros
- RNF18: Documentación completa
- RNF19: Ayuda contextual

---

## 7. LIMITACIONES ACTUALES

### 7.1 Limitaciones Técnicas
- ❌ Sin autenticación
- ❌ Sin autorización
- ❌ Sin colaboración en tiempo real
- ❌ Sin sincronización con servidor
- ❌ Sin versionado de fichas
- ❌ Sin auditoría de cambios
- ❌ Sin búsqueda avanzada
- ❌ Sin reportes

### 7.2 Limitaciones de Almacenamiento
- Máximo ~50MB en IndexedDB
- No escalable para miles de fichas
- No hay backup automático
- No hay sincronización en la nube

### 7.3 Limitaciones de Rendimiento
- Parsing de Excel grande bloquea UI
- Generación de PDF grande es lenta
- Renderizado de listas grandes causa lag
- Sin caché de PDFs

---

## 8. DEPENDENCIAS EXTERNAS

### 8.1 Librerías Críticas
- **Next.js 14**: Framework web
- **React 18**: Librería UI
- **TypeScript 5**: Tipado
- **Zustand 4.5**: Gestión de estado
- **jsPDF 2.5.1**: Generación de PDF
- **xlsx 0.18.5**: Lectura de Excel
- **Tailwind CSS 3.4**: Estilos

### 8.2 Herramientas de Desarrollo
- **Vitest 1.6**: Testing
- **fast-check 3.15**: Property-based testing
- **ESLint 8**: Linting
- **TypeScript 5**: Compilación

---

## 9. CONFIGURACIÓN DEL ENTORNO

### 9.1 Variables de Entorno
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_MAX_PHOTOS=50
NEXT_PUBLIC_STORAGE_QUOTA=52428800
```

### 9.2 Configuración de Build
```
- Target: ES2015
- Module: ESNext
- Strict Mode: Habilitado
- Source Maps: Habilitados
```

---

## 10. MÉTRICAS Y KPIs

### 10.1 Métricas de Uso
- Número de fichas creadas
- Número de fichas editadas
- Número de PDFs generados
- Tiempo promedio de edición
- Tasa de errores

### 10.2 Métricas de Rendimiento
- Tiempo de carga
- Tiempo de importación
- Tiempo de generación de PDF
- Uso de memoria
- Uso de almacenamiento

### 10.3 Métricas de Calidad
- Cobertura de tests
- Número de bugs
- Tiempo de resolución de bugs
- Satisfacción del usuario

---

## 11. ROADMAP FUTURO

### Fase 1: MVP (Actual)
- ✅ Importación de Excel
- ✅ Edición de fichas
- ✅ Diseño personalizable
- ✅ Generación de PDF
- ✅ Persistencia local

### Fase 2: Mejoras (1-2 Meses)
- 🔄 Autenticación
- 🔄 Backend API
- 🔄 Encriptación
- 🔄 Monitoreo

### Fase 3: Características Avanzadas (2-3 Meses)
- 🔄 Colaboración en tiempo real
- 🔄 Versionado de fichas
- 🔄 Auditoría completa
- 🔄 Reportes

### Fase 4: Escalabilidad (3-6 Meses)
- 🔄 Microservicios
- 🔄 Base de datos distribuida
- 🔄 CDN
- 🔄 Mobile app

---

## 12. DOCUMENTACIÓN RELACIONADA

### 12.1 Documentación Técnica
- `DOCUMENTACION_OFICIAL_SISTEMA.md`
- `GUIA_COMPLETA_FUNCIONAMIENTO.md`
- `FUNCIONES_CLAVE_RESUMEN.md`

### 12.2 Guías de Usuario
- `COMIENZA_AQUI.md`
- `COMIENZA_PRUEBAS_AQUI.md`
- `EJEMPLOS_EXCEL_PARA_PRUEBAS.md`

### 12.3 Documentación de Arquitectura
- `EVALUACION_ARQUITECTONICA_SENIOR.md`
- `ANALISIS_TECNICO_DETALLADO.md`

---

**Documento Preparado Para**: Arquitecto Senior de Software  
**Fecha**: Enero 2026  
**Versión**: 1.0
