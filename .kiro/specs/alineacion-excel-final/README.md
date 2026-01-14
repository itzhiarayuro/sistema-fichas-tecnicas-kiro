# Especificación: Alineación Excel Final (v2.0)

**Fecha:** 14 de Enero de 2026  
**Versión:** 2.0 (Revisado - Enfoque Correcto)  
**Estado:** ✅ Especificación Completa y Aprobada

---

## 📋 Documentos de Especificación (v2.0)

### ✅ Documentos Activos (Usar Estos)

1. **requirements-v2.md** - Especificación de requisitos
   - Objetivo: Alinear Excel sin romper estructura jerárquica
   - Enfoque: Flat layer aditivo, no destructivo
   - Criterios de éxito claros

2. **design-v2.md** - Diseño de solución
   - Arquitectura: Excel → Mapa → Parser → Flat Layer → Jerárquico
   - 6 fases de implementación
   - Correctness properties y error handling

3. **tasks-v2.md** - Plan de tareas detallado
   - 6 fases con tareas específicas
   - Archivos a modificar
   - Criterios de verificación
   - Procedimientos de rollback

---

## ❌ Documentos Archivados (NO USAR)

Los siguientes documentos describen el enfoque v1.0 (flattening destructivo) que fue **abandonado**:

- `requirements.md` (v1.0 - ARCHIVADO)
- `design.md` (v1.0 - ARCHIVADO)
- `tasks.md` (v1.0 - ARCHIVADO)

**Razón:** El enfoque v1.0 era demasiado agresivo (eliminaba estructura jerárquica). El enfoque v2.0 es más seguro (mantiene estructura jerárquica, introduce flat layer en paralelo).

---

## 🎯 Resumen del Enfoque v2.0

### Principios Clave

1. **Estructura jerárquica es autoridad** (hasta que parity sea probada)
2. **Flat layer es aditivo** (no destructivo)
3. **Cambios mínimos** (solo lo necesario)
4. **Reversibilidad garantizada** (cada cambio es auditado)
5. **Defensividad** (parser maneja casos edge sin fallar)

### Diferencias vs v1.0

| Aspecto | v1.0 (Abandonado) | v2.0 (Actual) |
|--------|-------------------|---------------|
| Estructura jerárquica | ❌ Eliminada | ✅ Intacta |
| Flat layer | ❌ Reemplazo | ✅ Paralelo |
| Riesgo | Alto | Bajo |
| Reversibilidad | Difícil | Fácil |
| Fase de removal | Inmediata | Post-MVP |

### 6 Fases de Implementación

1. **Fase 1: Preparación** - Baseline, backup, documentación
2. **Fase 2: Flat Layer** - Getters derivados (aditivo)
3. **Fase 3: Parser Alignment** - EXCEL_COLUMN_MAP, parser actualizado
4. **Fase 4: Parity Verification** - PDF, persistencia, validación idénticos
5. **Fase 5: Progressive Migration** - Componentes uno a uno
6. **Fase 6: Removal** - Post-MVP (solo si MVP es exitoso)

---

## 📁 Estructura de Archivos

```
.kiro/specs/alineacion-excel-final/
├── README.md                    ← Estás aquí
├── requirements-v2.md           ✅ Especificación de requisitos
├── design-v2.md                 ✅ Diseño de solución
├── tasks-v2.md                  ✅ Plan de tareas
├── requirements.md              ❌ ARCHIVADO (v1.0)
├── design.md                    ❌ ARCHIVADO (v1.0)
└── tasks.md                     ❌ ARCHIVADO (v1.0)
```

---

## 🚀 Cómo Usar Esta Especificación

### Para Entender el Plan

1. Lee **requirements-v2.md** (5 min)
   - Entiende el objetivo y principios
   - Revisa criterios de éxito

2. Lee **design-v2.md** (10 min)
   - Entiende la arquitectura
   - Revisa las 6 fases

3. Lee **tasks-v2.md** (15 min)
   - Entiende las tareas específicas
   - Revisa archivos a modificar

### Para Implementar

1. Abre **tasks-v2.md**
2. Sigue las fases en orden
3. Marca tareas como completadas
4. Haz commits pequeños y verificables
5. Verifica criterios de éxito después de cada fase

### Para Verificar Progreso

- Fase 1: ✅ Baseline documentado
- Fase 2: ✅ Flat layer compilado
- Fase 3: ✅ Parser actualizado
- Fase 4: ✅ Parity verificada
- Fase 5: ✅ Componentes migrados
- Fase 6: ⏳ Post-MVP

---

## 🔒 Restricciones Críticas

### NO Tocar (Hasta Parity Probada)

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
```

### Cambios Permitidos

```
✅ Agregar getters (flat layer)
✅ Crear EXCEL_COLUMN_MAP
✅ Actualizar parser
✅ Extender validador
✅ Migrar componentes (uno a uno)
✅ Remover estructura jerárquica (solo post-MVP)
```

---

## 📊 Criterios de Éxito

### Técnicos

- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito
- ✅ Parser mapea Excel → flat fields
- ✅ Flat fields hidratan estructura jerárquica
- ✅ PDF generado con ambas rutas es idéntico
- ✅ Errores de TypeScript se reducen

### Funcionales

- ✅ Sistema carga Excel definitivo correctamente
- ✅ Visualización es consistente
- ✅ PDF es válido
- ✅ Exportación tiene nombres correctos
- ✅ Excel antiguo se degrada controladamente

### De Calidad

- ✅ Código es más coherente
- ✅ Cambios son claros y documentados
- ✅ Reversibilidad garantizada
- ✅ Cero regresiones funcionales

---

## 🔄 Rollback Procedures

### Si algo falla

```bash
# Revertir a baseline
git reset --hard baseline-alineacion-excel
git push -f

# O revertir últimos N commits
git reset --hard HEAD~N
git push -f
```

---

## 📞 Contacto y Preguntas

Si tienes preguntas sobre esta especificación:

1. Revisa **requirements-v2.md** (¿qué?)
2. Revisa **design-v2.md** (¿cómo?)
3. Revisa **tasks-v2.md** (¿qué hacer?)

---

## 📝 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v1.0 | 14 Ene | Enfoque flattening destructivo (ABANDONADO) |
| v2.0 | 14 Ene | Enfoque flat layer aditivo (ACTUAL) |

---

**Especificación:** Alineación Excel Final (v2.0)  
**Estado:** ✅ Completa y Aprobada  
**Próximo Paso:** Iniciar Fase 1 (Preparación)
