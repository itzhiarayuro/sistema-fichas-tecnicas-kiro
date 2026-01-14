# Helpers de Pozo

## Propósito

Proporcionar funciones helper para acceso seguro y manipulación de datos de Pozo.

## Archivos

### `pozoAccessor.ts`

Implementación de `PozoAccessor` para acceso seguro a propiedades de Pozo.

## Uso

### Crear un Accessor

```typescript
import { createPozoAccessor } from '@/lib/helpers/pozoAccessor';

const pozo = pozos.get(selectedPozoId);
const accessor = createPozoAccessor(pozo);
```

### Acceso a Propiedades

```typescript
// Identificación
const idPozo = accessor.getIdPozo(); // string
const coordenadaX = accessor.getCoordenadaX(); // string
const coordenadaY = accessor.getCoordenadaY(); // string
const fecha = accessor.getFecha(); // string
const levanto = accessor.getLevanto(); // string
const estado = accessor.getEstado(); // string

// Ubicación
const direccion = accessor.getDireccion(); // string
const barrio = accessor.getBarrio(); // string
const elevacion = accessor.getElevacion(); // string
const profundidad = accessor.getProfundidad(); // string

// Componentes
const existeTapa = accessor.getExisteTapa(); // string
const estadoTapa = accessor.getEstadoTapa(); // string
const existeCilindro = accessor.getExisteCilindro(); // string
const diametroCilindro = accessor.getDiametroCilindro(); // string
// ... más propiedades

// Observaciones
const observaciones = accessor.getObservaciones(); // string

// Relaciones
const tuberias = accessor.getTuberias(); // TuberiaInfo[]
const sumideros = accessor.getSumideros(); // SumideroInfo[]
const fotos = accessor.getFotos(); // FotoInfo[]
const fotosCategorizado = accessor.getFotosCategorizado(); // FotosCategorizado
```

## Ventajas

- ✅ Acceso seguro sin type assertions
- ✅ Conversión automática de FieldValue a string
- ✅ Métodos getter para cada propiedad
- ✅ Manejo de fotos en ambos formatos (array y categorizado)
- ✅ Interfaz consistente

## Ejemplo Completo

```typescript
import { createPozoAccessor } from '@/lib/helpers/pozoAccessor';

function mostrarPozoInfo(pozo: Pozo) {
  const accessor = createPozoAccessor(pozo);
  
  console.log(`Pozo: ${accessor.getIdPozo()}`);
  console.log(`Ubicación: ${accessor.getDireccion()}, ${accessor.getBarrio()}`);
  console.log(`Estado: ${accessor.getEstado()}`);
  
  const fotos = accessor.getFotosCategorizado();
  console.log(`Fotos principales: ${fotos.principal?.length || 0}`);
  console.log(`Fotos de entrada: ${fotos.entradas?.length || 0}`);
  
  const tuberias = accessor.getTuberias();
  console.log(`Tuberías: ${tuberias.length}`);
}
```

## Conversión de Fotos

El accessor maneja automáticamente la conversión entre dos formatos de fotos:

### Formato Array
```typescript
FotoInfo[] {
  idFoto: FieldValue;
  idPozo: FieldValue;
  tipoFoto: FieldValue; // 'tapa', 'entrada', 'salida', 'sumidero', 'otro'
  rutaArchivo: FieldValue;
  fechaCaptura: FieldValue;
  descripcion: FieldValue;
}
```

### Formato Categorizado
```typescript
FotosCategorizado {
  principal?: string[];
  entradas?: string[];
  salidas?: string[];
  sumideros?: string[];
  otras?: string[];
}
```

### Conversión Automática

```typescript
const accessor = createPozoAccessor(pozo);

// Si pozo.fotos es array, getFotosCategorizado() lo convierte
const fotosCategorizado = accessor.getFotosCategorizado();

// Si pozo.fotos es categorizado, getFotos() lo convierte
const fotosArray = accessor.getFotos();
```

## Métodos Disponibles

### Identificación
- `getIdPozo(): string`
- `getCoordenadaX(): string`
- `getCoordenadaY(): string`
- `getFecha(): string`
- `getLevanto(): string`
- `getEstado(): string`

### Ubicación
- `getDireccion(): string`
- `getBarrio(): string`
- `getElevacion(): string`
- `getProfundidad(): string`

### Componentes
- `getExisteTapa(): string`
- `getEstadoTapa(): string`
- `getExisteCilindro(): string`
- `getDiametroCilindro(): string`
- `getSistema(): string`
- `getAnoInstalacion(): string`
- `getTipoCamara(): string`
- `getEstructuraPavimento(): string`
- `getMaterialTapa(): string`
- `getExisteCono(): string`
- `getTipoCono(): string`
- `getMaterialCono(): string`
- `getEstadoCono(): string`
- `getMaterialCilindro(): string`
- `getEstadoCilindro(): string`
- `getExisteCanuela(): string`
- `getMaterialCanuela(): string`
- `getEstadoCanuela(): string`
- `getExistePeldanos(): string`
- `getMaterialPeldanos(): string`
- `getNumeroPeldanos(): string`
- `getEstadoPeldanos(): string`

### Observaciones
- `getObservaciones(): string`

### Relaciones
- `getTuberias(): TuberiaInfo[]`
- `getSumideros(): SumideroInfo[]`
- `getFotos(): FotoInfo[]`
- `getFotosCategorizado(): FotosCategorizado`

## Referencias

- `src/lib/adapters/pozoAdapter.ts` - Adaptadores de conversión
- `src/types/pozoTypes.ts` - Tipos mejorados
- `src/lib/examples/pozoAdapterExample.ts` - Ejemplos de uso
- `ESTRATEGIA_ADAPTADORES.md` - Documentación completa
