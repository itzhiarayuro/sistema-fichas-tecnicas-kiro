# Implementation Plan: Sistema de Fichas Técnicas de Pozos

## Overview

Plan de implementación incremental para el Sistema de Fichas Técnicas. La mayoría de la arquitectura base, componentes UI y flujo principal ya están implementados. Las tareas restantes se enfocan en:

1. **Completar Property-Based Tests** - Validar propiedades universales del sistema
2. **Formalización Arquitectónica Avanzada** - State machine, event log, lifecycle management
3. **Diseñador de Fichas** - Módulo completo para personalización de layouts
4. **Refinamientos Finales** - Responsive, accesibilidad, documentación

## Tasks

### COMPLETED FOUNDATION (Tasks 1-25)

- [x] 1. Configuración inicial del proyecto Next.js
- [x] 2. Sistema de tipos y modelos de datos
- [x] 3. Checkpoint - Verificar tipos y parser
- [x] 4. Sistema de manejo de errores
- [x] 5. Stores de estado con Zustand
- [x] 6. Checkpoint - Verificar stores y aislamiento
- [x] 7. Sistema de persistencia
- [x] 8. Parser de Excel robusto
- [x] 9. Checkpoint - Verificar persistencia y parsing
- [x] 10. Layout y navegación
- [x] 11. Módulo de carga de archivos
- [x] 12. Módulo de visualización de pozos
- [x] 13. Checkpoint - Verificar flujo de carga
- [x] 14. Editor visual - Estructura base
- [x] 15. Editor visual - Edición inline
- [x] 16. Sincronización en tiempo real
- [x] 17. Checkpoint - Verificar editor y sincronización
- [x] 18. Sistema de confirmación de acciones
- [x] 19. Personalización de formato
- [x] 20. Generación de PDF
- [x] 21. Checkpoint - Verificar generación de PDF
- [x] 22. Modo guiado y UX final (parcial)
- [x] 23. Página del editor completa
- [x] 24. Dashboard principal
- [x] 25. Checkpoint final - Verificar sistema completo

### REMAINING TASKS

- [-] 26. Completar Property-Based Tests
  - [x] 26.1 Write property test for nomenclatura parsing
    - **Property 2: Parsing de Nomenclatura Round-Trip**
    - **Validates: Requirements 10.1-10.4**
    - Crear `src/tests/properties/nomenclatura.property.test.ts`
    - Generar nombres de archivo válidos según nomenclatura
    - Parsear y reconstruir, verificar equivalencia
    - _Requirements: 10.1-10.4_

  - [x] 26.2 Write property test for Excel parsing robustness
    - **Property 1: Robustez de Carga de Archivos**
    - **Validates: Requirements 1.8, 1.9, 1.10, 11.1-11.5**
    - Crear `src/tests/properties/excelParsing.property.test.ts`
    - Generar archivos Excel con columnas extra, faltantes, datos malformados
    - Verificar que el parser no lanza excepciones y extrae datos válidos
    - _Requirements: 1.8, 1.9, 1.10, 11.1-11.5_

  - [-] 26.3 Write property test for bidirectional sync
    - **Property 3: Sincronización Bidireccional**
    - **Validates: Requirements 4.1-4.5**
    - Crear `src/tests/properties/sync.property.test.ts`
    - Generar cambios en editor y preview
    - Verificar que ambos paneles siempre reflejan el mismo estado
    - _Requirements: 4.1-4.5_

  - [x] 26.4 Write property test for persistence round-trip
    - **Property 6: Persistencia y Recuperación**
    - **Validates: Requirements 9.1-9.7, 13.1-13.4**
    - Crear `src/tests/properties/persistence.property.test.ts`
    - Generar estados de ficha válidos
    - Guardar y restaurar, verificar equivalencia
    - _Requirements: 9.1-9.7, 13.1-13.4_

  - [x] 26.5 Write property test for structure protection
    - **Property 7: Protección de Estructura Mínima**
    - **Validates: Requirements 3.8, 3.9, 3.10**
    - Crear `src/tests/properties/structureProtection.property.test.ts`
    - Generar secuencias de operaciones de edición
    - Verificar que la estructura mínima siempre se mantiene
    - _Requirements: 3.8, 3.9, 3.10_

  - [x] 26.6 Write property test for validation non-blocking
    - **Property 10: Validación No Bloqueante**
    - **Validates: Requirements 11.1-11.5, 0.1**
    - Crear `src/tests/properties/validation.property.test.ts`
    - Generar datos inválidos e incompletos
    - Verificar que el sistema continúa funcionando con valores por defecto
    - _Requirements: 11.1-11.5, 0.1_

- [x] 27. Formalización Arquitectónica Avanzada
  - [x] 27.1 Implementar State Machine explícito
    - Crear `src/lib/domain/fichaStateMachine.ts`
    - Estados: draft | editing | complete | finalized
    - Transiciones formales con validación
    - Historial de transiciones
    - _Requirements: 16.1-16.5_

  - [x] 27.2 Formalizar Undo/Redo + Snapshots
    - Crear `src/lib/domain/historyManager.ts`
    - Definir niveles de historia (Undo/Redo, Snapshot, Finalized)
    - Regla: Restaurar snapshot resetea undo/redo
    - Integrar con fichaStore existente
    - _Requirements: 3.7, 13.1-13.4_

  - [x] 27.3 Implementar Schema Versioning Layer
    - Crear `src/lib/persistence/schemaVersioning.ts`
    - Versiones de esquema (v1, v2, v3, v4)
    - Migraciones automáticas
    - Backward compatibility
    - _Requirements: 9.1, 16.10_

  - [x] 27.4 Implementar Event Log Estructurado
    - Crear `src/lib/domain/eventLog.ts`
    - Eventos: EDIT, UNDO, REDO, SNAPSHOT, TRANSITION, ERROR, VALIDATE
    - Circular buffer (últimos 1000 eventos)
    - Persistencia en IndexedDB
    - _Requirements: 17.1-17.6_

  - [x] 27.5 Implementar Lifecycle Manager
    - Crear `src/lib/lifecycle/fichaLifecycleManager.ts`
    - Fases: mounted | suspended | resumed | destroyed
    - Gestión de intervals, observers, listeners
    - Prevenir memory leaks
    - _Requirements: 9.1, 16.10_

  - [x] 27.6 Agregar Capa de Seguridad
    - Crear `src/lib/security/securityLayer.ts`
    - Sanitización HTML (DOMPurify)
    - Validación de tamaños (ficha, fotos)
    - Validación de base64
    - _Requirements: 1.3, 1.10_

  - [x] 27.7 Implementar Validador Determinístico Final
    - Crear `src/lib/validators/fichaValidatorFinal.ts`
    - Función canónica: isFichaValid()
    - Usado por: Generate PDF, Finalize
    - Diferente del validador no bloqueante
    - _Requirements: 1.8, 1.9_

  - [x] 27.8 Crear Capa de Dominio (Preparación Multiusuario)
    - Crear `src/domain/ficha/commands.ts`
    - Crear `src/domain/ficha/reducers.ts`
    - Crear `src/domain/ficha/invariants.ts`
    - UI solo emite commands, no muta estado
    - _Requirements: 16.1-16.5_

  - [x] 27.9 Documentar Límites Explícitos del Sistema
    - Crear `docs/SYSTEM_BOUNDARIES.md`
    - Qué hace: local-first, edición, PDF, persistencia
    - Qué NO hace: multiusuario, legal, normativa, versionado PDF
    - Limitaciones: maxFichas, maxPhotos, maxSizes
    - Trabajo futuro: CRDT, sync remota, auditoría
    - _Requirements: Documentación_

- [x] 28. Diseñador de Fichas - Módulo Completo
  - [x] 28.1 Crear tipos para diseño de fichas
    - Crear `src/types/fichaDesign.ts` con interfaces:
      - `FieldPlacement` (posición, tamaño, estilo de cada campo)
      - `FichaDesign` (diseño completo con metadata)
      - `DesignTemplate` (versiones guardadas)
    - Incluir soporte para campos repetibles (tuberías, sumideros, fotos)
    - _Requirements: 6.1-6.4_

  - [x] 28.2 Crear store para diseños
    - Crear `src/stores/designStore.ts` con Zustand
    - CRUD de diseños (crear, leer, actualizar, eliminar)
    - Persistencia en IndexedDB
    - Historial de versiones
    - _Requirements: 9.1, 16.10_

  - [x] 28.3 Crear página del Diseñador de Fichas
    - Crear `src/app/designer/page.tsx`
    - Layout: Panel izquierdo (campos) + Canvas (centro) + Propiedades (derecha)
    - _Requirements: 6.1-6.4_

  - [x] 28.4 Implementar Panel de Campos (Izquierda)
    - Crear `src/components/designer/FieldsPanel.tsx`
    - Listar todos los campos del diccionario (33 POZO + 9 TUBERIAS + 8 SUMIDEROS + 6 FOTOS)
    - Agrupar por categoría (Identificación, Ubicación, Componentes, Conexiones, Fotos)
    - Drag & drop habilitado
    - Búsqueda y filtrado de campos
    - _Requirements: 6.1-6.4_

  - [x] 28.5 Implementar Canvas de Diseño (Centro)
    - Crear `src/components/designer/DesignCanvas.tsx`
    - Grilla editable (A4/Letter, portrait/landscape)
    - Drag & drop de campos desde panel izquierdo
    - Redimensionamiento de elementos
    - Selección y edición inline
    - Snap to grid
    - Zoom in/out
    - Preview en tiempo real
    - _Requirements: 6.1-6.4_

  - [x] 28.6 Implementar Panel de Propiedades (Derecha)
    - Crear `src/components/designer/PropertiesPanel.tsx`
    - Propiedades del elemento seleccionado:
      - ID del campo (automático)
      - Tipo de dato
      - Posición (X, Y)
      - Tamaño (Ancho, Alto)
      - Estilos: fontSize, fontFamily, color, backgroundColor, borderRadius, padding
      - Label personalizado
      - ¿Es repetible? (para tuberías, sumideros, fotos)
    - _Requirements: 6.1-6.4_

  - [x] 28.7 Implementar Toolbar del Diseñador
    - Crear `src/components/designer/DesignToolbar.tsx`
    - Botones: Nuevo, Guardar, Cargar, Duplicar, Eliminar
    - Selector de tamaño de página (A4, Letter)
    - Selector de orientación (Portrait, Landscape)
    - Zoom controls
    - Preview PDF
    - _Requirements: 6.1-6.4_

  - [x] 28.8 Implementar Importador de HTML
    - Crear `src/components/designer/HTMLImporter.tsx`
    - Upload de archivo HTML
    - Parsear HTML y extraer estructura
    - Mapear elementos HTML a campos del diccionario
    - Guardar como nueva versión de diseño
    - _Requirements: 6.1-6.4_

  - [x] 28.9 Implementar Gestor de Versiones
    - Crear `src/components/designer/VersionManager.tsx`
    - Listar todas las versiones de diseños
    - Crear nueva versión
    - Duplicar versión
    - Renombrar versión
    - Eliminar versión
    - Establecer versión por defecto
    - _Requirements: 6.1-6.4_

  - [x] 28.10 Implementar Generador de PDF desde Diseño
    - Crear `src/lib/pdf/designBasedPdfGenerator.ts`
    - Leer diseño guardado
    - Leer datos del pozo
    - Renderizar HTML según diseño
    - Convertir a PDF respetando posiciones y estilos
    - Manejar campos repetibles (N tuberías, N sumideros, N fotos)
    - _Requirements: 7.1, 7.2, 6.1-6.4_

- [x] 29. Refinamientos de UX

  - [x] 29.1 Implementar tooltips de trazabilidad

    - Crear `src/components/ui/TraceabilityTooltip.tsx`
    - Mostrar origen de cada dato (Excel, manual, default)
    - Integrar en campos del editor
    - _Requirements: 5.1-5.3_

  - [x] 29.2 Crear guía de usuario para nuevos campos

    - Crear `public/guias/DICCIONARIO_CAMPOS.md` con descripción de cada campo
    - Incluir ejemplos de valores válidos
    - Incluir reglas de validación
    - Incluir notas sobre campos obligatorios vs opcionales
    - Incluir aclaración: coordenadas son opcionales, no obligatorias
    - _Requirements: 5.1-5.5_

- [ ]* 30. Responsive y Accesibilidad
  - [ ] 30.1 Implementar diseño responsive
    - Adaptar layout para tablet y móvil
    - Probar en breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
    - _Requirements: 8.4_

  - [ ]* 30.2 Implementar accesibilidad WCAG 2.1 AA
    - Roles ARIA, navegación por teclado, contraste
    - Auditoría con herramientas (axe, lighthouse)
    - _Requirements: 8.7_

- [ ] 31. Documentación Final
  - [ ] 31.1 Crear README del proyecto
    - Arquitectura, estructura, flujo de datos
    - Puntos de extensión, decisiones técnicas
    - Guía de desarrollo
    - _Requirements: Documentación_

  - [ ] 31.2 Crear documentación de API
    - Documentar endpoints: /api/pdf, /api/export, /api/upload
    - Ejemplos de uso
    - Códigos de error
    - _Requirements: Documentación_

  - [ ] 31.3 Crear guía de contribución
    - Cómo agregar nuevos campos
    - Cómo crear nuevas plantillas
    - Cómo extender validaciones
    - _Requirements: Documentación_

- [x] 32. Corrección de Tipos con Adaptadores
  - [x] 32.1 Crear adaptadores de Pozo
    - Crear `src/lib/adapters/pozoAdapter.ts`
    - Funciones: `flatToPozoInterno()`, `pozoInternoAFlat()`
    - Helpers: `getFieldValue()`, `createFieldValue()`
    - Mantiene estructura interna jerárquica pero expone interfaz plana
    - _Requirements: 16.1, 5.1-5.5_

  - [x] 32.2 Crear tipos mejorados para Pozo
    - Crear `src/types/pozoTypes.ts`
    - Tipos específicos: `IdentificacionPozoFlat`, `UbicacionPozoFlat`, `ComponentesPozoFlat`
    - Interfaz `PozoAccessor` para acceso seguro
    - Tipos para validación, búsqueda, estadísticas
    - _Requirements: 16.1_

  - [x] 32.3 Crear helpers de acceso seguro
    - Crear `src/lib/helpers/pozoAccessor.ts`
    - Implementar `createPozoAccessor()` para acceso seguro a valores
    - Métodos getter para cada propiedad
    - Conversión automática de FieldValue a string
    - _Requirements: 5.1-5.5_

  - [x] 32.4 Crear ejemplos de uso
    - Crear `src/lib/examples/pozoAdapterExample.ts`
    - 8 ejemplos: acceso seguro, conversión, fotos, validación, búsqueda, reporte, comparación
    - Documentar patrones de uso
    - _Requirements: Documentación_

  - [x] 32.5 Documentar estrategia de corrección
    - Crear `ESTRATEGIA_ADAPTADORES.md`
    - Explicar problema original y solución
    - Documentar archivos creados y cómo usarlos
    - Plan de migración gradual
    - _Requirements: Documentación_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests (Task 26) validate universal correctness properties
- Architectural formalization (Task 27) prepares for future multiuser support
- Designer module (Task 28) enables advanced customization
- El sistema debe cumplir los criterios de finalización del Requirement 15 antes de considerarse completo

## Current Status Summary

**Completed:**
- ✅ Core architecture and state management (Zustand stores)
- ✅ Type system with full data model (33 pozo fields + tuberías + sumideros + fotos)
- ✅ Excel parser with robust error handling
- ✅ Photo nomenclature parser
- ✅ Validation system (business rules)
- ✅ Error handling and containment
- ✅ Persistence layer (IndexedDB + snapshots)
- ✅ UI components (layout, editor, upload, pozos table)
- ✅ Real-time sync engine (editor ↔ preview)
- ✅ PDF generation (single + batch)
- ✅ Guided mode
- ✅ Confirmation dialogs for destructive actions
- ✅ Customization panel (colors, fonts, spacing)
- ✅ Dashboard with workflow indicators

**Remaining:**
- ⏳ Property-based tests (6 properties to implement)
- ⏳ Advanced architectural formalization (state machine, event log, lifecycle)
- ⏳ Designer module (visual layout builder)
- ⏳ Responsive design refinements
- ⏳ Accessibility improvements
- ⏳ Documentation

