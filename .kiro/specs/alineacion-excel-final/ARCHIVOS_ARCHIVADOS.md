# ⚠️ Archivos Archivados (v1.0 - NO USAR)

**Fecha:** 14 de Enero de 2026  
**Razón:** Enfoque v1.0 (flattening destructivo) fue abandonado en favor de v2.0 (flat layer aditivo)

---

## Archivos Archivados

Los siguientes archivos describen el enfoque v1.0 y **NO DEBEN SER USADOS**:

### 1. `requirements.md` (v1.0)
- ❌ Describe flattening destructivo
- ❌ Elimina estructura jerárquica
- ❌ Alto riesgo
- ✅ Reemplazado por: `requirements-v2.md`

### 2. `design.md` (v1.0)
- ❌ Diseña eliminación de estructura jerárquica
- ❌ No verifica parity
- ❌ Migración masiva, no progresiva
- ✅ Reemplazado por: `design-v2.md`

### 3. `tasks.md` (v1.0)
- ❌ Tareas para flattening destructivo
- ❌ No incluye rollback procedures
- ❌ No verifica equivalencia
- ✅ Reemplazado por: `tasks-v2.md`

---

## Por Qué Fueron Archivados

### Enfoque v1.0 (Abandonado)

```
Excel → Parser → Flat Fields (REEMPLAZO)
                 ❌ Elimina estructura jerárquica
                 ❌ Alto riesgo
                 ❌ Difícil de revertir
```

### Enfoque v2.0 (Actual)

```
Excel → Parser → Flat Fields (PARALELO)
                 ✅ Mantiene estructura jerárquica
                 ✅ Bajo riesgo
                 ✅ Fácil de revertir
                 ✅ Verifica parity
                 ✅ Migración progresiva
```

---

## Archivos a Usar (v2.0)

### ✅ Documentos Activos

1. **README.md** - Guía de navegación
2. **requirements-v2.md** - Especificación de requisitos
3. **design-v2.md** - Diseño de solución
4. **tasks-v2.md** - Plan de tareas detallado

---

## Cómo Proceder

1. **Ignora completamente** los archivos v1.0
2. **Usa exclusivamente** los archivos v2.0
3. **Si necesitas contexto**, lee `README.md` primero

---

## Historial de Cambios

| Versión | Fecha | Estado | Razón |
|---------|-------|--------|-------|
| v1.0 | 14 Ene | ❌ ARCHIVADO | Enfoque demasiado agresivo |
| v2.0 | 14 Ene | ✅ ACTIVO | Enfoque más seguro y profesional |

---

**Nota:** Los archivos v1.0 se mantienen en el repositorio para referencia histórica, pero **NO DEBEN SER USADOS** para implementación.

Para comenzar, abre: `README.md`
