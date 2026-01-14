# Índice de Documentación - Sistema de Fichas Técnicas

## Bienvenida

Bienvenido a la documentación del Sistema de Fichas Técnicas. Este índice te ayudará a encontrar la información que necesitas.

---

## 🚀 Inicio Rápido

**¿Primer uso?** Comienza aquí:

- **[Guía de Inicio Rápido](./QUICK_START.md)** - 5 minutos para empezar
  - Instalación
  - Primeros pasos
  - Tareas comunes

---

## 📚 Documentación Principal

### Para Usuarios

- **[Guía de Pruebas](../COMIENZA_PRUEBAS_AQUI.md)** - 7 pasos para validar el sistema
  - Preparar ambiente
  - Cargar datos
  - Editar fichas
  - Generar PDF
  - Validar sincronización

- **[Ejemplos de Excel](../EJEMPLOS_EXCEL_PARA_PRUEBAS.md)** - Formatos y datos de ejemplo
  - Estructura de columnas
  - Datos mínimos y completos
  - Casos especiales
  - Validaciones

- **[Diccionario de Campos](./FIELD_DICTIONARY.md)** - Referencia completa de campos
  - Descripción de cada campo
  - Tipos de datos
  - Restricciones
  - Ejemplos

### Para Desarrolladores

- **[Referencia Técnica](./TECHNICAL_REFERENCE.md)** - Arquitectura y APIs
  - Stack tecnológico
  - Estructura de directorios
  - Flujo de datos
  - APIs principales
  - Persistencia
  - Manejo de errores

- **[Documentación de API](./API.md)** - Endpoints y funciones
  - API Routes
  - Funciones de utilidad
  - Hooks personalizados

- **[Arquitectura de Persistencia](./PERSISTENCE_ARCHITECTURE.md)** - IndexedDB y almacenamiento
  - Schema de base de datos
  - Ciclo de vida de datos
  - Snapshots y recuperación

- **[Guía de Integración](./INTEGRATION_GUIDE.md)** - Integrar con otros sistemas
  - Exportar datos
  - Importar datos
  - APIs externas

- **[Diseño Responsivo](./RESPONSIVE_DESIGN.md)** - Diseño y UI
  - Breakpoints
  - Componentes
  - Estilos

---

## 🔍 Búsqueda por Tema

### Carga de Datos

- ¿Cómo cargar un Excel? → [Guía de Pruebas - Paso 3](../COMIENZA_PRUEBAS_AQUI.md#paso-3-cargar-archivo-excel)
- ¿Qué formato debe tener el Excel? → [Ejemplos de Excel](../EJEMPLOS_EXCEL_PARA_PRUEBAS.md)
- ¿Cómo funciona el parser? → [Referencia Técnica - APIs](./TECHNICAL_REFERENCE.md#apis-principales)

### Edición de Fichas

- ¿Cómo editar un pozo? → [Guía de Inicio Rápido - Editar](./QUICK_START.md#editar-un-pozo)
- ¿Qué campos puedo editar? → [Diccionario de Campos](./FIELD_DICTIONARY.md)
- ¿Cómo se guardan los cambios? → [Arquitectura de Persistencia](./PERSISTENCE_ARCHITECTURE.md)

### Generación de PDF

- ¿Cómo generar un PDF? → [Guía de Inicio Rápido - PDF](./QUICK_START.md#generar-pdf)
- ¿Cómo personalizar el PDF? → [Referencia Técnica - PDF](./TECHNICAL_REFERENCE.md#generación-de-pdf)
- ¿Qué datos incluye el PDF? → [Diccionario de Campos](./FIELD_DICTIONARY.md)

### Persistencia y Sincronización

- ¿Dónde se guardan los datos? → [Arquitectura de Persistencia](./PERSISTENCE_ARCHITECTURE.md)
- ¿Cómo se sincronizan entre pestañas? → [Referencia Técnica - Persistencia](./TECHNICAL_REFERENCE.md#persistencia)
- ¿Qué pasa si hay un error? → [Referencia Técnica - Errores](./TECHNICAL_REFERENCE.md#manejo-de-errores)

### Desarrollo

- ¿Cuál es la estructura del proyecto? → [Referencia Técnica - Directorios](./TECHNICAL_REFERENCE.md#estructura-de-directorios)
- ¿Cómo agregar un nuevo campo? → [Diccionario de Campos](./FIELD_DICTIONARY.md)
- ¿Cómo crear un nuevo componente? → [Referencia Técnica - Arquitectura](./TECHNICAL_REFERENCE.md#arquitectura)
- ¿Cómo integrar con otro sistema? → [Guía de Integración](./INTEGRATION_GUIDE.md)

---

## 📋 Documentación Técnica Avanzada

- **[Límites del Sistema](./SYSTEM_BOUNDARIES.md)** - Qué puede y no puede hacer
- **[Checklist de Caos](./CHAOS_CHECKLIST.md)** - Validación de resiliencia
- **[Brechas Cerradas](./GAPS_CLOSED.md)** - Problemas resueltos

---

## 🎯 Flujos de Trabajo Comunes

### Flujo 1: Importar y Editar

1. Descargar Excel de ejemplo → [Ejemplos de Excel](../EJEMPLOS_EXCEL_PARA_PRUEBAS.md)
2. Cargar en sistema → [Guía de Pruebas - Paso 3](../COMIENZA_PRUEBAS_AQUI.md#paso-3-cargar-archivo-excel)
3. Editar fichas → [Guía de Inicio Rápido - Editar](./QUICK_START.md#editar-un-pozo)
4. Generar PDF → [Guía de Inicio Rápido - PDF](./QUICK_START.md#generar-pdf)

### Flujo 2: Crear Nuevo Pozo

1. Ir a editor
2. Hacer clic en "Nuevo Pozo"
3. Llenar campos requeridos → [Diccionario de Campos](./FIELD_DICTIONARY.md)
4. Guardar (automático)
5. Generar PDF si es necesario

### Flujo 3: Buscar y Filtrar

1. Ir a tabla de pozos
2. Usar barra de búsqueda
3. Filtrar por estado/tipo
4. Hacer clic en resultado
5. Ver detalles en editor

### Flujo 4: Exportar Datos

1. Seleccionar pozos
2. Hacer clic en "Exportar"
3. Elegir formato (Excel, PDF, JSON)
4. Descargar archivo

---

## 🆘 Troubleshooting

### Problemas Comunes

| Problema | Solución | Documentación |
|----------|----------|---------------|
| Excel no se carga | Verificar formato .xlsx | [Ejemplos de Excel](../EJEMPLOS_EXCEL_PARA_PRUEBAS.md#validación-de-datos) |
| Datos no se guardan | Verificar IndexedDB | [Arquitectura de Persistencia](./PERSISTENCE_ARCHITECTURE.md) |
| PDF no se genera | Verificar permisos | [Referencia Técnica - PDF](./TECHNICAL_REFERENCE.md#generación-de-pdf) |
| Cambios no se sincronizan | Recargar página | [Arquitectura de Persistencia](./PERSISTENCE_ARCHITECTURE.md#ciclo-de-vida-de-datos) |

### Debugging

- Abrir DevTools (F12)
- Ir a "Application" → "IndexedDB"
- Ver datos en "sistema-fichas-tecnicas"
- Revisar logs en consola

---

## 📞 Soporte

Si no encuentras lo que buscas:

1. Buscar en este índice
2. Revisar documentación relacionada
3. Consultar ejemplos en `public/ejemplos/`
4. Revisar logs en consola del navegador

---

## 📝 Información del Documento

- **Última actualización**: Enero 2026
- **Versión**: 1.0
- **Mantenedor**: Sistema de Fichas Técnicas
- **Licencia**: Propietaria

---

## 🗺️ Mapa de Documentación

```
docs/
├── INDEX.md (este archivo)
├── QUICK_START.md
├── FIELD_DICTIONARY.md
├── TECHNICAL_REFERENCE.md
├── API.md
├── PERSISTENCE_ARCHITECTURE.md
├── INTEGRATION_GUIDE.md
├── RESPONSIVE_DESIGN.md
├── SYSTEM_BOUNDARIES.md
├── CHAOS_CHECKLIST.md
└── GAPS_CLOSED.md

../
├── DOCUMENTACION_OFICIAL_SISTEMA.md
├── COMIENZA_PRUEBAS_AQUI.md
└── EJEMPLOS_EXCEL_PARA_PRUEBAS.md
```

---

**¿Listo para empezar?** → [Guía de Inicio Rápido](./QUICK_START.md)
