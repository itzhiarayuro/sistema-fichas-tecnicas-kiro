# Especificación: Alineación Excel sin Tocar Estructura Interna

**Fecha:** 14 de Enero de 2026  
**Versión:** 2.0 (Revisado)  
**Estado:** Especificación Aprobada  
**Prioridad:** Media (Deuda Técnica Controlada)

---

## 1. Introducción

Este documento especifica la alineación del Excel definitivo con el sistema **sin tocar la estructura interna jerárquica**.

### Objetivo Principal

Alinear Excel sin romper nada que funcione:
- **Mantener** la estructura jerárquica actual (identificacion, ubicacion, componentes)
- **Introducir** flat layer en paralelo (no como reemplazo)
- **Verificar** equivalencia antes de migrar
- **Migrar** progresivamente componente por componente

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
- ✅ Modelo de tipos es plano y consistente
- ✅ Excel definitivo tiene estructura correcta
- ⚠️ 60+ errores de TypeScript (deuda técnica)
- ⚠️ Diferencias nominales entre Excel y sistema

### 2.2 Diferencias Nominales Identificadas

| Columna Excel (Actual) | Columna Excel (Correcta) | Propiedad Dominio | Estado |
|------------------------|--------------------------|-------------------|--------|
| Materia Cono | Material Cono | materialCono | ❌ Desalineado |
| Logitud | Longitud | longitud | ❌ Desalineado |
| Materia Tuberia | Material Tubería | materialTuberia | ❌ Desalineado |

### 2.3 Riesgo Identificado

El principal riesgo no es técnico, sino de **acoplamiento indebido** entre:
- Nombres del Excel (input externo, variable)
- Claves internas del dominio (estables)
- Uso de propiedades en UI y PDF (frágil)

---

## 3. Requisitos Funcionales

### RF-1: Carga de Excel Definitivo

**User Story:** Como usuario, quiero cargar el Excel definitivo y que el sistema lo interprete correctamente.

#### Acceptance Criteria

1. WHEN se carga un Excel con columnas corregidas THEN el sistema mapea correctamente cada columna a su propiedad interna
2. WHEN se carga un Excel con columnas antiguas THEN el sistema las reconoce y advierte al usuario (degradación controlada)
3. WHEN faltan columnas esperadas THEN el sistema asigna valores seguros sin lanzar excepciones fatales
4. WHEN hay columnas desconocidas THEN el sistema las ignora sin error

### RF-2: Visualización Consistente

**User Story:** Como usuario, quiero ver los datos del pozo visualizados correctamente sin importar el origen del Excel.

#### Acceptance Criteria

1. WHEN se visualiza un pozo cargado THEN todos los campos se muestran con valores correctos
2. WHEN se edita un campo THEN el cambio se refleja inmediatamente en la UI
3. WHEN se genera un PDF THEN incluye todos los datos correctamente mapeados
4. WHEN se exporta a Excel THEN las columnas tienen los nombres correctos

### RF-3: Alineación Explícita

**User Story:** Como desarrollador, quiero una capa clara que mapee Excel → Dominio para facilitar mantenimiento futuro.

#### Acceptance Criteria

1. WHEN reviso el código THEN existe un mapa explícito `EXCEL_COLUMN_MAP` que documenta la correspondencia
2. WHEN cambia el Excel THEN solo necesito actualizar el mapa, no refactorizar todo el sistema
3. WHEN agrego una nueva columna THEN el proceso es claro y no requiere cambios dispersos
4. WHEN reviso el parser THEN está claro qué hace: traduce columnas → claves internas

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
- Creación de mapa explícito Excel → Dominio
- Actualización del parser para usar el mapa
- Actualización del validador para alineación fina
- Ajustes mínimos en componentes donde TypeScript detecta inconsistencias reales
- Testing funcional para verificar no regresiones

### Excluido ❌

- Nuevas funcionalidades
- Reestructuración del dominio
- Cambios "estéticos" sin impacto real
- Refactorización amplia de componentes
- Correcciones de TypeScript con `any` o casts forzados
- Escalado del sistema

---

## 6. Criterios de Éxito

### Criterios Técnicos

- ✅ El sistema carga correctamente el Excel definitivo
- ✅ El PDF generado es válido y consistente
- ✅ No se ha roto ningún flujo existente
- ✅ Los cambios son claros, documentados y reversibles
- ✅ El código es más coherente que antes

### Criterios de Calidad

- ✅ Errores de TypeScript se reducen sin forzar el sistema
- ✅ Mapa Excel → Dominio es explícito y mantenible
- ✅ Parser es claro y defensivo
- ✅ Validador está alineado con realidad

### Criterios de Riesgo

- ✅ Cero regresiones funcionales
- ✅ Cambios son reversibles
- ✅ Sistema funciona en todo momento
- ✅ No se introducen dependencias ocultas

---

## 7. Restricciones

### Restricciones Técnicas

- No se modifica la estructura de tipos base (ya es plana)
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
| **Dominio** | Las propiedades internas del sistema (ej: `materialCono`, `longitud`) |
| **Mapa Excel → Dominio** | Tabla explícita que traduce columnas Excel a claves internas |
| **Parser** | Función que lee Excel y crea objetos del dominio |
| **Validador** | Función que verifica consistencia de datos |
| **Adaptador** | Capa que traduce entre input externo y dominio interno |
| **Deuda Técnica** | Errores de TypeScript que no afectan funcionalidad pero indican inconsistencias |
| **Regresión** | Cambio que rompe funcionalidad que antes funcionaba |

---

## 9. Notas Finales

Este plan es **prudente, profesional y adecuado para un MVP serio**:

- ✅ No optimiza de más
- ✅ No reestructura innecesariamente
- ✅ No introduce riesgos ocultos
- ✅ Mantiene el sistema funcionando en todo momento
- ✅ Reduce deuda técnica de forma controlada

**Aprobación:** Especificación lista para implementación

---

**Documento:** Especificación de Alineación Controlada  
**Versión:** 1.0  
**Estado:** ✅ Aprobado  
**Próximo Paso:** Crear plan de implementación (tasks.md)
