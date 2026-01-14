# Documentación Oficial del Sistema de Fichas Técnicas

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Datos](#flujo-de-datos)
5. [Guía de Pruebas](#guía-de-pruebas)
6. [Ejemplos de Datos](#ejemplos-de-datos)

---

## Descripción General

Sistema de gestión de fichas técnicas para pozos, con capacidad de:
- Importar datos desde Excel
- Editar fichas técnicas de forma interactiva
- Exportar a PDF
- Persistencia local con IndexedDB
- Sincronización de cambios

---

## Estructura del Proyecto

```
sistema-fichas-tecnicas/
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   ├── lib/              # Lógica de negocio
│   ├── stores/           # Estado global (Zustand)
│   ├── types/            # Definiciones TypeScript
│   └── domain/           # Lógica de dominio
├── public/               # Archivos estáticos
├── docs/                 # Documentación técnica
└── package.json          # Dependencias
```

---

## Componentes Principales

### 1. Parser de Excel (`src/lib/parsers/excelParser.ts`)
- Lee archivos .xlsx
- Extrae datos de pozos
- Valida estructura de datos

### 2. Adaptador de Pozos (`src/lib/adapters/pozoAdapter.ts`)
- Convierte datos de Excel a formato interno
- Maneja nomenclatura de campos
- Valida tipos de datos

### 3. Persistencia (`src/lib/persistence/`)
- IndexedDB para almacenamiento local
- Snapshots para recuperación
- Versionado de esquema

### 4. Generador de PDF (`src/lib/pdf/`)
- Crea PDFs basados en diseño
- Soporta múltiples formatos
- Generación en lote

### 5. Editor de Fichas (`src/components/editor/`)
- Interfaz para editar campos
- Vista previa en tiempo real
- Gestión de secciones

---

## Flujo de Datos

```
Excel → Parser → Adaptador → Validación → Persistencia → Editor → PDF
```

1. **Carga**: Usuario sube archivo Excel
2. **Parsing**: Se extrae información de pozos
3. **Adaptación**: Se convierte a formato interno
4. **Validación**: Se verifican tipos y restricciones
5. **Persistencia**: Se guarda en IndexedDB
6. **Edición**: Usuario puede modificar fichas
7. **Exportación**: Se genera PDF con cambios

---

## Guía de Pruebas

### Paso 1: Preparar Datos
- Usar archivo Excel con estructura válida
- Incluir columnas requeridas (ver EJEMPLOS_EXCEL_PARA_PRUEBAS.md)

### Paso 2: Cargar Archivo
- Ir a sección "Upload"
- Seleccionar archivo Excel
- Esperar validación

### Paso 3: Verificar Importación
- Revisar lista de pozos importados
- Confirmar que los datos se cargaron correctamente

### Paso 4: Editar Ficha
- Seleccionar un pozo
- Modificar campos según sea necesario
- Los cambios se guardan automáticamente

### Paso 5: Generar PDF
- Seleccionar ficha
- Hacer clic en "Exportar PDF"
- Descargar archivo generado

### Paso 6: Validar Cambios
- Verificar que PDF contiene cambios
- Confirmar formato correcto

### Paso 7: Sincronización
- Los cambios se sincronizan automáticamente
- Verificar en IndexedDB (DevTools)

---

## Ejemplos de Datos

Ver `EJEMPLOS_EXCEL_PARA_PRUEBAS.md` para:
- Estructura de columnas requeridas
- Datos de ejemplo para pozos
- Formatos válidos para cada campo
- Casos de prueba especiales

---

## Especificación Técnica

Para detalles de implementación, ver:
- `.kiro/specs/alineacion-excel-final/README.md` - Especificación v2.0
- `.kiro/specs/alineacion-excel-final/requirements-v2.md` - Requisitos
- `.kiro/specs/alineacion-excel-final/design-v2.md` - Diseño técnico
- `.kiro/specs/alineacion-excel-final/tasks-v2.md` - Plan de tareas

---

## Notas Importantes

- Todos los cambios se guardan automáticamente en IndexedDB
- Los datos se sincronizan entre pestañas del navegador
- Los PDFs se generan del lado del cliente
- La validación ocurre en múltiples capas (parser, adaptador, persistencia)

---

**Última actualización**: Enero 2026
**Versión**: 2.0
