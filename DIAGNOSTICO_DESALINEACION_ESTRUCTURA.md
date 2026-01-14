# Diagnóstico: Desalineación de Estructura de Pozo

## Problema Reportado

Error al cargar datos de Excel:
```
src/app/pozos/page.tsx (443:74) @ tapaEstado
Cannot read property 'tapaEstado' of undefined
```

## Causa Raíz

**Desalineación entre la definición del tipo y el acceso en el código.**

### Definición del Tipo Pozo

El tipo `Pozo` en `src/types/pozo.ts` tiene estructura **PLANA**:

```typescript
export interface Pozo {
  // Propiedades directas, NO jerárquicas
  idPozo: FieldValue;
  estadoTapa: FieldValue;      // ← Aquí
  diametroCilindro: FieldValue; // ← Aquí
  // ... más propiedades
}
```

### Acceso Incorrecto en el Código

En `src/app/pozos/page.tsx` línea 443, el código intentaba acceder:

```typescript
// ❌ INCORRECTO - estructura no existe
pozo.estructura.tapaEstado
pozo.estructura.cuerpoDiametro
```

### Acceso Correcto

```typescript
// ✅ CORRECTO - propiedades directas
pozo.estadoTapa
pozo.diametroCilindro
```

## Solución Aplicada

Se corrigieron los accesos en `src/app/pozos/page.tsx`:

```diff
- <dd>{pozo.estructura.tapaEstado || '-'}</dd>
+ <dd>{pozo.estadoTapa || '-'}</dd>

- <dd>{pozo.estructura.cuerpoDiametro || '-'}</dd>
+ <dd>{pozo.diametroCilindro || '-'}</dd>
```

## Lecciones Aprendidas

### 1. Estructura Interna vs. Interfaz Pública

El sistema tiene dos representaciones de Pozo:

- **PozoInterno** (`src/lib/adapters/pozoAdapter.ts`): Estructura jerárquica interna
  ```typescript
  {
    identificacion: { idPozo, ... },
    ubicacion: { direccion, ... },
    componentes: { estadoTapa, ... }
  }
  ```

- **Pozo** (`src/types/pozo.ts`): Interfaz plana pública
  ```typescript
  {
    idPozo,
    estadoTapa,
    diametroCilindro,
    // ... propiedades directas
  }
  ```

### 2. Mapeo de Excel

El parser de Excel mapea directamente a la estructura plana:

```typescript
// excelParser.ts
'estado_tapa' → 'estadoTapa'
'diametro_cilindro' → 'diametroCilindro'
```

### 3. Punto de Fallo

El error ocurrió porque:
1. El Excel se cargó correctamente
2. El parser mapeó los datos correctamente
3. Los datos se guardaron en IndexedDB correctamente
4. **Pero el código de visualización asumía una estructura jerárquica que no existe**

## Validación

✅ Tipo Pozo es plano
✅ Parser mapea a estructura plana
✅ Persistencia guarda estructura plana
✅ Código de visualización ahora accede a estructura plana

## Prevención Futura

Para evitar este tipo de errores:

1. **Usar TypeScript strict mode** - Detectaría accesos a propiedades inexistentes
2. **Validar tipos en tiempo de compilación** - `getDiagnostics` hubiera detectado esto
3. **Documentar la estructura** - Clarificar que Pozo es plano, no jerárquico
4. **Tests de integración** - Verificar que datos de Excel se visualizan correctamente

## Archivos Afectados

- ✅ `src/app/pozos/page.tsx` - Corregido
- ✅ `src/types/pozo.ts` - Definición correcta (sin cambios)
- ✅ `src/lib/adapters/pozoAdapter.ts` - Mapeo correcto (sin cambios)

## Estado Actual

**RESUELTO** - El sistema ahora:
- Carga Excel correctamente
- Mapea datos a estructura plana
- Visualiza datos sin errores
- Genera PDFs correctamente

---

**Fecha**: Enero 2026
**Versión**: 1.0
**Estado**: Resuelto
