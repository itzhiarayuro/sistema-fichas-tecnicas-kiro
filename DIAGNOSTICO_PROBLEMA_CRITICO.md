# DIAGNÓSTICO CRÍTICO - PROBLEMA DE FOTOS Y EDITOR

## 🔴 PROBLEMAS IDENTIFICADOS

### Problema 1: Error en TextEditor.tsx (línea 90)
**Error**: `fieldValue.value is undefined`
**Causa**: El objeto `fieldValue` no tiene la propiedad `value`

**Raíz del problema**:
- En `src/app/editor/[id]/page.tsx` línea 228, se llama: `createFieldValue(pozo.idPozo)`
- Pero `pozo.idPozo` YA ES un `FieldValue` (tiene `value`, `source`, `originalValue`)
- `createFieldValue()` espera un STRING, no un FieldValue
- Resultado: `createFieldValue(FieldValue)` → `{ value: FieldValue, source: 'excel' }`
- Cuando TextEditor intenta acceder a `fieldValue.value`, obtiene un objeto FieldValue, no un string

### Problema 2: Fotos no se cargan en lista de pozos
**Síntoma**: "No tengo ninguna foto" aunque subiste fotos
**Causa**: El flujo de asociación de fotos está roto

**Raíz del problema**:
1. Las fotos se cargan en `upload/page.tsx` con nomenclatura correcta (M680-P, M680-T)
2. Se guardan en `globalStore.photos` (Map<string, FotoInfo>)
3. En `pozos/page.tsx`, se intenta recuperar fotos con `getPhotosByPozoId()`
4. Pero `getPhotosByPozoId()` extrae el código del pozoId (ej: "M680" de "pozo-M680-1234567890-0")
5. Luego compara con el código extraído del filename
6. **PROBLEMA**: Si el pozoId no tiene el formato esperado, la extracción falla

## 📋 ARCHIVOS AFECTADOS

1. **src/app/editor/[id]/page.tsx** (línea 228-235)
   - Llama `createFieldValue()` con FieldValue en lugar de string
   - Afecta: identificacionData, estructuraData, tuberiasData, observacionesData

2. **src/stores/globalStore.ts** (getPhotosByPozoId)
   - Lógica de extracción de código del pozoId puede fallar
   - Necesita validación más robusta

3. **src/app/upload/page.tsx**
   - Necesita validar que las fotos se asocien correctamente con pozos

## 🔧 SOLUCIONES REQUERIDAS

### Solución 1: Crear helper para extraer valor de FieldValue
```typescript
// En src/lib/helpers/fieldValueHelpers.ts
export function getFieldValueOrDefault(fieldValue: FieldValue | string | undefined, defaultValue: string = ''): string {
  if (!fieldValue) return defaultValue;
  if (typeof fieldValue === 'string') return fieldValue;
  return fieldValue.value || defaultValue;
}

// Usar en editor:
const identificacionData = useMemo(() => {
  if (!pozo) return { codigo: createFieldValue('', 'default'), ... };
  return {
    codigo: createFieldValue(getFieldValueOrDefault(pozo.idPozo)),
    direccion: createFieldValue(getFieldValueOrDefault(pozo.direccion)),
    // etc...
  };
}, [pozo]);
```

### Solución 2: Mejorar getPhotosByPozoId()
```typescript
// En src/stores/globalStore.ts
getPhotosByPozoId: (pozoId) => {
  const photos: FotoInfo[] = [];
  
  // Extraer codigo del pozoId con validación
  const codigoMatch = pozoId.match(/^pozo-([A-Z]\d+)-/);
  const codigo = codigoMatch ? codigoMatch[1] : pozoId;
  
  get().photos.forEach((photo) => {
    // Extraer pozo ID del filename
    const match = photo.filename?.match(/^([A-Z]\d+)/) || 
                  photo.filename?.match(/^([A-Z]\d+)-/);
    if (match && match[1].toUpperCase() === codigo.toUpperCase()) {
      photos.push(photo);
    }
  });
  
  return photos;
}
```

### Solución 3: Validar en upload que fotos se asocien
```typescript
// En src/app/upload/page.tsx
// Después de procesar fotos, validar que se asociaron correctamente
const fotosAsociadas = processedPhotos.filter(foto => {
  const codigoMatch = foto.filename.match(/^([A-Z]\d+)/);
  return codigoMatch && processedPozos.some(p => 
    getFieldValueOrDefault(p.idPozo) === codigoMatch[1]
  );
});

if (fotosAsociadas.length < processedPhotos.length) {
  showWarning(`${processedPhotos.length - fotosAsociadas.length} fotos no pudieron asociarse`);
}
```

## 📝 IMPORTANCIA DE COMENTARIOS

Como mencionaste, los comentarios son CRÍTICOS para poder revertir cambios:

1. **Cada cambio debe estar comentado** con:
   - QUÉ se cambió
   - POR QUÉ se cambió
   - CUÁNDO se cambió
   - REFERENCIA al problema

2. **Ejemplo de comentario bueno**:
```typescript
// FIX: Problema #1 - TextEditor recibía FieldValue en lugar de string
// Línea original: codigo: createFieldValue(pozo.idPozo)
// Problema: pozo.idPozo es FieldValue, createFieldValue espera string
// Solución: Extraer valor con getFieldValueOrDefault()
// Fecha: 2026-01-15
codigo: createFieldValue(getFieldValueOrDefault(pozo.idPozo))
```

3. **Beneficios**:
   - Puedes revertir cambios específicos sin perder otros
   - Entiendes por qué se hizo cada cambio
   - Facilita debugging futuro
   - Documenta la evolución del código

## ✅ PRÓXIMOS PASOS

1. Crear/actualizar helper `getFieldValueOrDefault()` si no existe
2. Actualizar `src/app/editor/[id]/page.tsx` para usar el helper
3. Mejorar `getPhotosByPozoId()` en globalStore
4. Validar en upload que fotos se asocien correctamente
5. Agregar comentarios explicativos en cada cambio
6. Probar con datos reales (Excel + fotos)


---

## ✅ ESTADO ACTUAL: RESUELTO

Todos los problemas han sido identificados y solucionados. Ver `SOLUCION_PROBLEMAS_CRITICOS.md` para detalles completos.

### Cambios Realizados:

1. **src/app/editor/[id]/page.tsx**
   - ✅ Agregado import de `getFieldValueOrDefault`
   - ✅ Corregido `identificacionData` para extraer valores de FieldValue
   - ✅ Corregido `estructuraData` para extraer valores de FieldValue
   - ✅ Corregido `tuberiasData` para extraer valores de FieldValue
   - ✅ Corregido `observacionesData` para extraer valores de FieldValue
   - ✅ Agregados comentarios explicativos

2. **src/stores/globalStore.ts**
   - ✅ Mejorada función `getPhotosByPozoId()`
   - ✅ Soporta múltiples formatos de pozoId
   - ✅ Agregada validación y logging
   - ✅ Agregados comentarios explicativos

3. **src/app/upload/page.tsx**
   - ✅ Mejorada función `handleContinue()`
   - ✅ Agregada validación de asociación de fotos
   - ✅ Agregado feedback al usuario
   - ✅ Agregados comentarios explicativos

### Validación:
- ✅ Sin errores de compilación
- ✅ Sin errores de TypeScript
- ✅ Código sigue patrones existentes
- ✅ Mantiene compatibilidad hacia atrás

### Próximos Pasos:
1. Prueba con datos reales (Excel + fotos)
2. Verifica que el editor cargue sin errores
3. Verifica que las fotos se muestren correctamente
4. Verifica que se puedan editar campos

Ver `VERIFICACION_RAPIDA_SOLUCION.md` para instrucciones de prueba.
