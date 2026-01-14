# Problema: Inconsistencia en la Estructura de Tipos de Pozo

## El Problema

Hay una **desconexión fundamental** entre cómo se define el tipo `Pozo` y cómo se usa en el código.

### Definición en `src/types/pozo.ts`

```typescript
export interface Pozo {
  id: string;
  identificacion: IdentificacionPozo;  // Contiene: idPozo, coordenadaX, coordenadaY, fecha, levanto, estado
  ubicacion: UbicacionPozo;            // Contiene: direccion, barrio, elevacion, profundidad
  componentes: ComponentesPozo;        // Contiene: existeTapa, estadoTapa, etc.
  observaciones: ObservacionesPozo;    // Contiene: observaciones
  tuberias: TuberiasPozo;
  sumideros: SumiderosPozo;
  fotos: FotosPozo;
  metadata: PozoMetadata;
}
```

### Uso en el Código

```typescript
// En src/app/pozos/page.tsx, src/app/editor/[id]/page.tsx, etc.
const pozo = pozos.get(selectedPozoId);

// El código espera propiedades planas:
pozo.codigo           // ❌ No existe
pozo.direccion        // ❌ No existe
pozo.barrio           // ❌ No existe
pozo.estructura       // ❌ No existe
pozo.fotos.principal  // ❌ No existe

// Pero debería ser:
pozo.identificacion.idPozo      // ✅ Correcto
pozo.ubicacion.direccion        // ✅ Correcto
pozo.ubicacion.barrio           // ✅ Correcto
pozo.componentes.existeTapa     // ✅ Correcto
pozo.fotos.fotos[0].tipoFoto    // ✅ Correcto
```

## Causa Raíz

El tipo `Pozo` fue diseñado con una estructura **normalizada y jerárquica** (por categorías), pero el código fue escrito esperando una estructura **plana** (propiedades directas).

## Soluciones Posibles

### Opción 1: Cambiar el Tipo (Recomendado)
Redefinir `Pozo` para que tenga propiedades planas:

```typescript
export interface Pozo {
  id: string;
  
  // Identificación
  idPozo: FieldValue;
  coordenadaX: FieldValue;
  coordenadaY: FieldValue;
  fecha: FieldValue;
  levanto: FieldValue;
  estado: FieldValue;
  
  // Ubicación
  direccion: FieldValue;
  barrio: FieldValue;
  elevacion: FieldValue;
  profundidad: FieldValue;
  
  // Componentes
  existeTapa: FieldValue;
  estadoTapa: FieldValue;
  // ... más propiedades
  
  // Relaciones
  tuberias: TuberiaInfo[];
  sumideros: SumideroInfo[];
  fotos: FotoInfo[];
  
  metadata: PozoMetadata;
}
```

**Ventajas:**
- Coincide con el código existente
- Más fácil de usar
- Menos anidamiento

**Desventajas:**
- Menos organizado
- Más propiedades en el nivel superior

### Opción 2: Cambiar el Código
Actualizar todo el código para usar la estructura jerárquica:

```typescript
// Cambiar de:
pozo.codigo
// A:
pozo.identificacion.idPozo

// Cambiar de:
pozo.fotos.principal
// A:
pozo.fotos.fotos.filter(f => f.tipoFoto === 'tapa')
```

**Ventajas:**
- Mantiene la estructura bien organizada
- Mejor separación de conceptos

**Desventajas:**
- Requiere cambiar mucho código
- Más verboso

### Opción 3: Crear un Adaptador
Crear funciones que conviertan entre formatos:

```typescript
function flattenPozo(pozo: Pozo): FlatPozo {
  return {
    id: pozo.id,
    codigo: pozo.identificacion.idPozo,
    direccion: pozo.ubicacion.direccion,
    // ... más conversiones
  };
}
```

**Ventajas:**
- Mantiene ambas estructuras
- Flexible

**Desventajas:**
- Más código
- Más complejidad

## Recomendación

**Opción 1 es la mejor** porque:
1. El código ya está escrito esperando propiedades planas
2. Es más fácil de usar
3. Menos cambios necesarios
4. Mejor rendimiento (menos anidamiento)

## Archivos a Actualizar

Si se elige Opción 1:
1. `src/types/pozo.ts` - Redefinir la interfaz `Pozo`
2. `src/lib/parsers/excelParser.ts` - Actualizar el parser
3. `src/lib/validators/pozoValidator.ts` - Actualizar validaciones
4. Todos los archivos que usan `Pozo` se actualizarán automáticamente

## Impacto

- **Archivos afectados:** 10+
- **Líneas de código a cambiar:** 100+
- **Tiempo estimado:** 2-3 horas
- **Riesgo:** Bajo (cambios localizados)

## Próximos Pasos

1. Decidir qué opción implementar
2. Actualizar los tipos
3. Ejecutar `npx tsc --noEmit` para verificar
4. Hacer commit de los cambios
5. Hacer pruebas manuales
