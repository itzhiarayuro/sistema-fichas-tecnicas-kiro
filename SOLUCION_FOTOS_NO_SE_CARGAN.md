# SOLUCIÓN: FOTOS NO SE CARGAN EN LISTA DE POZOS

## 🔴 PROBLEMA IDENTIFICADO

**Síntoma**: Subes fotos (M680-P.jpg, M680-T.jpg) pero en la lista de pozos dice "Sin fotos asociadas"

**Causa Raíz**: Las fotos se guardaban en el store global pero **NO se asociaban con los pozos**
- Las fotos se guardaban en `globalStore.photos` (Map)
- Pero `pozo.fotos` permanecía vacío: `{ principal: [], entradas: [], ... }`
- El contador de fotos solo miraba `pozo.fotos`, que estaba vacío

## ✅ SOLUCIÓN IMPLEMENTADA

### Paso 1: Crear Helper de Asociación
**Archivo**: `src/lib/helpers/fotoAssociationHelper.ts` (NUEVO)

Función principal: `associatePhotosWithPozos(pozos, fotos)`
- Recibe array de pozos y Map de fotos
- Para cada pozo, busca fotos que coincidan por código
- Categoriza fotos por tipo (PRINCIPAL, ENTRADA, SALIDA, SUMIDERO, OTRA)
- Llena `pozo.fotos` con los IDs de las fotos asociadas

```typescript
export function associatePhotosWithPozos(
  pozos: Pozo[],
  fotos: Map<string, any>
): Pozo[] {
  // Para cada pozo, buscar fotos que coincidan
  return pozos.map(pozo => {
    // Extraer código del pozo (ej: "pozo-M680-1234567890-0" -> "M680")
    const pozoCodigo = pozo.id.match(/^pozo-([A-Z]\d+)/)?.[1];
    
    // Buscar fotos que coincidan
    const fotosDelPozo = fotosArray.filter(foto => {
      const fotoCodigo = foto.filename.match(/^([A-Z]\d+)/)?.[1];
      return fotoCodigo?.toUpperCase() === pozoCodigo?.toUpperCase();
    });
    
    // Categorizar y llenar pozo.fotos
    // ...
  });
}
```

### Paso 2: Usar Helper en Upload
**Archivo**: `src/app/upload/page.tsx`

Cambio en `handleFilesAccepted()`:
```typescript
// ANTES (incorrecto):
if (allPozos.length > 0) {
  const existingPozos = Array.from(pozos.values());
  const mergedPozos = [...existingPozos, ...allPozos];
  useGlobalStore.setState({ pozos: new Map(mergedPozos.map(p => [p.id, p])) });
}

// DESPUÉS (correcto):
if (allPozos.length > 0) {
  const existingPozos = Array.from(pozos.values());
  const mergedPozos = [...existingPozos, ...allPozos];
  
  // FIX: Asociar fotos con pozos
  const fotosMap = new Map<string, any>();
  allPhotos.forEach(foto => fotosMap.set(foto.id, foto));
  
  const pozosConFotos = associatePhotosWithPozos(mergedPozos, fotosMap);
  
  useGlobalStore.setState({ pozos: new Map(pozosConFotos.map(p => [p.id, p])) });
}
```

### Paso 3: Mejorar Contador de Fotos
**Archivo**: `src/components/pozos/PozoStatusBadge.tsx`

Función `countFotosGlobales()` ahora extrae correctamente el código del pozoId:
```typescript
function countFotosGlobales(pozoId: string, fotosGlobales: Map<string, any>): number {
  // FIX: Extraer código del pozoId correctamente
  // pozoId viene como "pozo-M680-1234567890-0", necesitamos extraer "M680"
  const codigoMatch = pozoId.match(/^(?:pozo-)?([A-Z]\d+)/);
  const codigo = codigoMatch ? codigoMatch[1] : pozoId;
  
  // Buscar fotos que coincidan
  fotosGlobales.forEach((foto) => {
    const match = foto.filename?.match(/^([A-Z]\d+)/);
    if (match && match[1].toUpperCase() === codigo.toUpperCase()) {
      count++;
    }
  });
  return count;
}
```

## 📊 FLUJO COMPLETO AHORA

```
1. Usuario carga Excel + Fotos
   ↓
2. Upload procesa archivos
   ├─ Excel → Pozos (con fotos vacías)
   └─ Fotos → FotoInfo[]
   ↓
3. associatePhotosWithPozos() llena pozo.fotos
   ├─ Extrae código del pozo (M680)
   ├─ Busca fotos que coincidan (M680-P.jpg, M680-T.jpg)
   ├─ Categoriza por tipo
   └─ Llena pozo.fotos.principal, pozo.fotos.entradas, etc.
   ↓
4. Pozos se guardan en store CON fotos asociadas
   ↓
5. Lista de pozos muestra contador correcto
   ├─ countFotos(pozo) suma pozo.fotos.principal + entradas + salidas + ...
   └─ Muestra "4 fotos asociadas" ✅
   ↓
6. Editor carga fotos correctamente
   └─ FotosSection.tsx muestra fotos por categoría ✅
```

## 🧪 CÓMO PROBAR

1. **Carga datos reales**:
   - Excel con pozos: M680, M681, etc.
   - Fotos: M680-P.jpg, M680-T.jpg, M680-E1-T.jpg, M680-S-T.jpg

2. **Verifica en lista de pozos**:
   - Debe mostrar "4 fotos asociadas" (no "Sin fotos")
   - Debe mostrar contador en la tabla

3. **Verifica en editor**:
   - Abre un pozo
   - Ve a sección "Fotos"
   - Debe mostrar fotos organizadas por categoría

## 📝 ARCHIVOS MODIFICADOS

| Archivo | Cambios | Estado |
|---------|---------|--------|
| `src/lib/helpers/fotoAssociationHelper.ts` | NUEVO | ✅ |
| `src/app/upload/page.tsx` | Usar helper | ✅ |
| `src/components/pozos/PozoStatusBadge.tsx` | Mejorar extracción | ✅ |

## ✅ VALIDACIÓN

- ✅ Sin errores de compilación
- ✅ Sin errores de TypeScript
- ✅ Comentarios explicativos agregados
- ✅ Código sigue patrones existentes

## 🎯 RESULTADO ESPERADO

**Antes**:
```
Lista de pozos:
- M680: Sin fotos asociadas ❌
- M681: Sin fotos asociadas ❌

Editor:
- Sección Fotos: Vacía ❌
```

**Después**:
```
Lista de pozos:
- M680: 4 fotos asociadas ✅
- M681: 2 fotos asociadas ✅

Editor:
- Sección Fotos:
  - Panorámica: M680-P.jpg ✅
  - Tubería: M680-T.jpg ✅
  - Entrada: M680-E1-T.jpg ✅
  - Salida: M680-S-T.jpg ✅
```

---

**Fecha**: 2026-01-15
**Estado**: ✅ COMPLETADO
**Próximo Paso**: Prueba con datos reales
