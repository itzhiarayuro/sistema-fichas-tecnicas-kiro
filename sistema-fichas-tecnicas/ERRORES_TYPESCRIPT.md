# Errores de TypeScript Encontrados

## Resumen
Se encontraron **60+ errores de TypeScript** en el proyecto. La mayoría están relacionados con:

1. **Tipos de Pozo inconsistentes** - Las propiedades esperadas no coinciden con la definición
2. **Tipos de Fotos inconsistentes** - Estructura de fotos no coincide
3. **Propiedades faltantes en FichaDesign** - Campo `shapes` faltante en algunos lugares
4. **Tipos de FieldValue** - Conversiones incorrectas entre string y FieldValue

## Errores Críticos

### 1. Propiedades de Pozo Faltantes
```
Property 'codigo' does not exist on type 'Pozo'
Property 'direccion' does not exist on type 'Pozo'
Property 'barrio' does not exist on type 'Pozo'
Property 'estructura' does not exist on type 'Pozo'
```

**Ubicaciones:**
- src/app/editor/[id]/page.tsx (líneas 228-263)
- src/app/page.tsx (línea 50)
- src/app/pozos/page.tsx (líneas 108-133)
- src/components/editor/PreviewPanel.tsx (línea 131)

**Causa:** El tipo `Pozo` no tiene estas propiedades definidas, pero el código las usa.

### 2. Propiedades de Fotos Faltantes
```
Property 'principal' does not exist on type 'FotosPozo'
Property 'entradas' does not exist on type 'FotosPozo'
Property 'salidas' does not exist on type 'FotosPozo'
Property 'sumideros' does not exist on type 'FotosPozo'
Property 'otras' does not exist on type 'FotosPozo'
```

**Ubicaciones:**
- src/app/page.tsx (líneas 40-44)
- src/app/pozos/page.tsx (líneas 469-482)
- src/app/editor/[id]/page.tsx (líneas 302-306)

**Causa:** El tipo `FotosPozo` no tiene estas propiedades.

### 3. Propiedades Faltantes en FichaDesign
```
Property 'shapes' is missing in type '...' but required in type 'FichaDesign'
```

**Ubicaciones:**
- src/components/designer/DesignToolbar.tsx (línea 38)
- src/components/designer/HTMLImporter.tsx (línea 132)

**Causa:** Al crear nuevos diseños, no se incluye la propiedad `shapes`.

### 4. Conversiones de Tipo Incorrectas
```
Type 'string' is not assignable to type 'FieldValue'
Type 'FieldValue' is not assignable to type 'string'
```

**Ubicaciones:**
- src/app/upload/page.tsx (línea 113)
- src/components/editor/ImageEditor.tsx (línea 174)

## Soluciones Recomendadas

### Opción 1: Corregir los Tipos (Recomendado)
Actualizar las definiciones de tipos en `src/types/pozo.ts` para que coincidan con el código:

```typescript
export interface Pozo {
  id: string;
  codigo: string;
  direccion: string;
  barrio: string;
  sistema: string;
  estado: string;
  fecha: string;
  estructura: {
    alturaTotal: string;
    rasante: string;
    tapaMaterial: string;
    tapaEstado: string;
    // ... más propiedades
  };
  fotos: {
    principal?: string[];
    entradas?: string[];
    salidas?: string[];
    sumideros?: string[];
    otras?: string[];
  };
  // ... más propiedades
}
```

### Opción 2: Usar Type Assertions
Usar `as any` o `as unknown` para ignorar los errores (no recomendado para producción).

### Opción 3: Desactivar Strict Mode
Reducir la severidad de TypeScript en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

## Archivos Afectados

1. **src/app/editor/[id]/page.tsx** - 30+ errores
2. **src/app/pozos/page.tsx** - 20+ errores
3. **src/app/page.tsx** - 10+ errores
4. **src/components/editor/** - 15+ errores
5. **src/components/designer/** - 5+ errores
6. **src/app/upload/page.tsx** - 2+ errores

## Próximos Pasos

1. Revisar la definición de `Pozo` en `src/types/pozo.ts`
2. Actualizar los tipos para que coincidan con el código
3. Ejecutar `npx tsc --noEmit` para verificar que no hay errores
4. Hacer commit de los cambios

## Nota Importante

El proyecto **funciona en tiempo de ejecución** a pesar de estos errores de TypeScript. Sin embargo, es importante corregirlos para:
- Mejorar la calidad del código
- Prevenir bugs en el futuro
- Facilitar el mantenimiento
- Cumplir con estándares de desarrollo
