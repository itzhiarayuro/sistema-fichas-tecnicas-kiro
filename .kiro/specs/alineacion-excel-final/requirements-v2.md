# Especificación: Alineación Excel sin Tocar Estructura Interna (v2.0)

**Fecha:** 14 de Enero de 2026  
**Versión:** 2.0 (Revisado - Enfoque Correcto)  
**Estado:** ✅ Especificación Aprobada  
**Prioridad:** Media (Deuda Técnica Controlada)

---

## 1. Introducción

Este documento especifica la alineación del Excel definitivo con el sistema **sin tocar la estructura interna jerárquica**.

### Objetivo Principal

**Alinear Excel sin romper nada que funcione:**
- ✅ Mantener estructura jerárquica actual (identificacion, ubicacion, componentes)
- ✅ Introducir flat layer en paralelo (no como reemplazo)
- ✅ Verificar equivalencia antes de migrar
- ✅ Migrar progresivamente componente por componente

### Principios No Negociables

1. **No ruptura funcional:** Sistema funciona en todo momento
2. **Estructura jerárquica es autoridad:** Hasta que flat + hierarchical produzcan el mismo resultado
3. **Cambios aditivos, no destructivos:** Flat layer es paralelo, no reemplazo
4. **Verificación de parity:** PDF generado con ambas rutas antes de migrar
5. **Reversibilidad garantizada:** Cada cambio es rollbackable

---

## 2. Contexto y Estado Actual

### 2.1 Verificación Previa

- ✅ Sistema funciona correctamente en tiempo de ejecución
- ✅ Estructura jerárquica está bien definida (identificacion, ubicacion, componentes)
- ✅ Adaptadores ya existen en el código (pozoAdapter.ts, pozoAccessor.ts)
- ✅ Excel definitivo tiene estructura correcta
- ⚠️ 60+ errores de TypeScript (deuda técnica)
- ⚠️ Diferencias nominales entre Excel y sistema

### 2.2 Diferencias Nominales Identificadas

| Columna Excel (Actual) | Columna Excel (Correcta) | Propiedad Dominio | Estado |
|------------------------|--------------------------|-------------------|--------|
| Materia Cono | Material Cono | materialCono | ❌ Desalineado |
| Logitud | Longitud | longitud | ❌ Desalineado |
| Materia Tuberia | Material Tubería | materialTuberia | ❌ Desalineado |

### 2.3 Estructura Actual del Sistema

```
Pozo (Interfaz Plana)
├─ identificacion (Jerárquico)
│  ├─ idPozo
│  ├─ coordenadaX
│  ├─ coordenadaY
│  ├─ fecha
│  ├─ levanto
│  └─ estado
├─ ubicacion (Jerárquico)
│  ├─ direccion
│  ├─ barrio
│  ├─ elevacion
│  └─ profundidad
├─ componentes (Jerárquico)
│  ├─ existeTapa
│  ├─ estadoTapa
│  ├─ ... (23 campos)
│  └─ estadoPeldanos
├─ observaciones (Jerárquico)
│  └─ observaciones
├─ tuberias (Array)
├─ sumideros (Array)
├─ fotos (Categorizado)
└─ metadata
```

---

## 3. Requisitos Funcionales

### RF-1: Carga de Excel Definitivo

**User Story:** Como usuario, quiero cargar el Excel definitivo y que el sistema lo interprete correctamente.

#### Acceptance Criteria

1. WHEN se carga un Excel con columnas corregidas THEN el parser mapea correctamente cada columna
2. WHEN se carga un Excel con columnas antiguas THEN el sistema las reconoce y advierte al usuario
3. WHEN faltan columnas esperadas THEN el sistema asigna valores seguros sin lanzar excepciones
4. WHEN hay columnas desconocidas THEN el sistema las ignora sin error

### RF-2: Equivalencia Jerárquica ↔ Plana

**User Story:** Como desarrollador, quiero verificar que ambas rutas (jerárquica y plana) producen el mismo resultado.

#### Acceptance Criteria

1. WHEN se genera un PDF usando acceso jerárquico THEN el resultado es idéntico al PDF generado con acceso plano
2. WHEN se persisten datos usando ambas rutas THEN el estado almacenado es idéntico
3. WHEN se validan datos usando ambas rutas THEN los resultados de validación son idénticos

### RF-3: Migración Progresiva

**User Story:** Como desarrollador, quiero migrar componentes uno a uno sin afectar el resto del sistema.

#### Acceptance Criteria

1. WHEN se migra un componente a acceso plano THEN el componente funciona correctamente
2. WHEN se revierte un componente a acceso jerárquico THEN el sistema sigue funcionando
3. WHEN se comparan componentes migrados vs no migrados THEN el comportamiento es idéntico

---

## 4. Requisitos No Funcionales

### RNF-1: Estabilidad

- El sistema debe funcionar en todo momento durante la refactorización
- No se introducen regresiones funcionales
- Cambios son incrementales y reversibles

### RNF-2: Mantenibilidad

- Código es más coherente que antes, no solo "más silencioso"
- Cambios son claros, documentados y auditables
- Errores de TypeScript se reducen sin forzar el sistema

### RNF-3: Seguridad

- No se usan `any`, casts forzados o non-null assertions para "corregir" errores
- Cada corrección refleja una mejora real de consistencia
- Cambios son reversibles en caso de problemas

---

## 5. Alcance Explícito

### Incluido ✅

- Corrección de 3 nombres de columnas en el Excel
- Creación de mapa explícito Excel → Flat fields
- Actualización del parser para usar el mapa
- Introducción de flat layer en paralelo (aliases derivados)
- Verificación de parity (PDF con ambas rutas)
- Migración progresiva de componentes
- Testing funcional para verificar no regresiones

### Excluido ❌

- Eliminación de estructura jerárquica (hasta que parity sea probada)
- Cambios en recoverState(), safePersist(), Snapshot logic
- Cambios en ErrorBoundaries, PDF layout, Auto-save logic
- Nuevas funcionalidades
- Reestructuración del dominio
- Cambios "estéticos" sin impacto real

### Prohibido Tocar ❌

```
❌ recoverState()
❌ safePersist()
❌ Snapshot logic
❌ ErrorBoundaries
❌ PDF layout / templates
❌ Auto-save logic
❌ Reset / recovery UX
❌ BASE_STATE
❌ Existing validators behavior (only extend)

❌ NO eliminar:
  - pozo.identificacion
  - pozo.ubicacion
  - pozo.componentes
  - pozo.observaciones

Hasta que: flat + hierarchical produzcan el mismo resultado
```

---

## 6. Criterios de Éxito

### Criterios Técnicos

- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito
- ✅ Parser mapea Excel → flat fields
- ✅ Flat fields hidratan estructura jerárquica
- ✅ PDF generado con ambas rutas es idéntico
- ✅ Errores de TypeScript se reducen sin forzar el sistema

### Criterios Funcionales

- ✅ Sistema carga Excel definitivo correctamente
- ✅ Visualización es consistente
- ✅ PDF es válido
- ✅ Exportación tiene nombres correctos
- ✅ Excel antiguo se degrada controladamente

### Criterios de Calidad

- ✅ Código es más coherente que antes
- ✅ Cambios son claros y documentados
- ✅ Reversibilidad garantizada
- ✅ Cero regresiones funcionales

---

## 7. Restricciones

### Restricciones Técnicas

- No se modifica la estructura jerárquica base
- No se introduce acoplamiento nuevo
- No se usan patrones que compliquen el código

### Restricciones de Proceso

- Cambios en rama dedicada: `feature/alineacion-excel-final`
- Commits pequeños y verificables
- Referencia funcional válida en todo momento
- Documentación clara de cada cambio

### Restricciones de Alcance

- Solo alineación, no nuevas funcionalidades
- Solo correcciones reales, no "limpiezas" cosméticas
- Solo cambios que reducen riesgo, no que lo aumentan

---

## 8. Glosario

| Término | Definición |
|---------|-----------|
| **Excel Definitivo** | El archivo Excel con estructura correcta y nombres finales acordados |
| **Estructura Jerárquica** | Organización actual: identificacion, ubicacion, componentes, observaciones |
| **Flat Layer** | Capa plana de aliases derivados que apuntan a la estructura jerárquica |
| **Mapa Excel → Flat** | Tabla explícita que traduce columnas Excel a flat fields |
| **Parser** | Función que lee Excel y crea objetos del dominio |
| **Parity** | Equivalencia: flat + hierarchical producen el mismo resultado |
| **Migración Progresiva** | Actualizar componentes uno a uno, verificando equivalencia |
| **Deuda Técnica** | Errores de TypeScript que no afectan funcionalidad pero indican inconsistencias |

---

## 9. Notas Finales

Este plan es **prudente, profesional y adecuado para un MVP serio**:

- ✅ Mantiene MVP funcionando
- ✅ Introduce cambios sin riesgo
- ✅ Verifica equivalencia antes de migrar
- ✅ Permite rollback en cualquier momento
- ✅ Demuestra profesionalismo y control

**Aprobación:** Especificación lista para implementación

---

**Documento:** Especificación de Alineación (v2.0)  
**Versión:** 2.0  
**Estado:** ✅ Aprobado  
**Próximo Paso:** Crear plan de implementación (design.md)
