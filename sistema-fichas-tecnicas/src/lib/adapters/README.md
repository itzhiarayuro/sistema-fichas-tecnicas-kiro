# Adaptadores de Pozo

## Propósito

Mantener la estructura interna jerárquica de `Pozo` pero exponer una interfaz plana para compatibilidad con el código existente.

## Problema

El tipo `Pozo` fue diseñado con estructura jerárquica:
```typescript
Pozo {
  identificacion: { idPozo, coordenadaX, ... }
  ubicacion: { direccion, barrio, ... }
  componentes: { existeTapa, ... }
}
```

Pero el código existente espera propiedades planas:
```typescript
Pozo {
  idPozo,
  direccion,
  existeTapa,
  ...
}
```

## Solución

Adaptadores que convierten entre ambas estructuras sin cambiar el código existente.

## Archivos

### `pozoAdapter.ts`

Funciones principales:

- **`flatToPozoInterno(pozo: Pozo): PozoInterno`**
  - Convierte un Pozo plano a estructura interna jerárquica
  - Útil para procesamiento interno o almacenamiento

- **`pozoInternoAFlat(pozoInterno: PozoInterno): Pozo`**
  - Convierte estructura interna de vuelta a plano
  - Útil para exponer datos al código existente

- **`getFieldValue(value: FieldValue): string`**
  - Obtiene valor de FieldValue de forma segura
  - Maneja tanto strings como objetos FieldValue

- **`createFieldValue(value: string): FieldValue`**
  - Crea un FieldValue a partir de un string
  - Establece source como 'manual' y timestamp actual

## Uso

### Acceso Directo (Actual)

```typescript
const pozo = pozos.get(selectedPozoId);
console.log(pozo.idPozo);
console.log(pozo.direccion);
```

### Conversión Explícita

```typescript
import { flatToPozoInterno, pozoInternoAFlat } from '@/lib/adapters/pozoAdapter';

// Convertir a estructura interna
const pozoInterno = flatToPozoInterno(pozo);
console.log(pozoInterno.identificacion.idPozo);

// Convertir de vuelta a plano
const pozoPlano = pozoInternoAFlat(pozoInterno);
console.log(pozoPlano.idPozo);
```

## Estructura Interna

```typescript
PozoInterno {
  id: string;
  
  identificacion: {
    idPozo: FieldValue;
    coordenadaX: FieldValue;
    coordenadaY: FieldValue;
    fecha: FieldValue;
    levanto: FieldValue;
    estado: FieldValue;
  };
  
  ubicacion: {
    direccion: FieldValue;
    barrio: FieldValue;
    elevacion: FieldValue;
    profundidad: FieldValue;
  };
  
  componentes: {
    existeTapa: FieldValue;
    estadoTapa: FieldValue;
    // ... 21 más propiedades
  };
  
  observaciones: {
    observaciones: FieldValue;
  };
  
  tuberias: TuberiaInfo[];
  sumideros: SumideroInfo[];
  fotos: FotoInfo[];
  
  metadata: {
    createdAt: number;
    updatedAt: number;
    source: 'excel' | 'manual';
    version: number;
  };
}
```

## Beneficios

- ✅ Mantiene organización interna
- ✅ Compatible con código existente
- ✅ Permite migración gradual
- ✅ Facilita refactorización futura
- ✅ Mejora la tipificación

## Próximos Pasos

1. Usar `PozoAccessor` para acceso seguro (ver `src/lib/helpers/pozoAccessor.ts`)
2. Migrar componentes críticos gradualmente
3. Refactorizar código antiguo cuando sea necesario

## Referencias

- `src/lib/helpers/pozoAccessor.ts` - Implementación de PozoAccessor
- `src/types/pozoTypes.ts` - Tipos mejorados
- `src/lib/examples/pozoAdapterExample.ts` - Ejemplos de uso
- `ESTRATEGIA_ADAPTADORES.md` - Documentación completa
