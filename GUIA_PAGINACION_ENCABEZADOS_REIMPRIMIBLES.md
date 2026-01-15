# Guía: Paginación Automática y Encabezados Reimprimibles

## Descripción General

El sistema ahora soporta:

1. **Paginación Automática**: Crea múltiples páginas cuando hay muchas tuberías, sumideros o fotos
2. **Encabezados Reimprimibles**: Campos que se repiten en cada página de un mismo pozo

## Límites por Página (Configurables)

```typescript
maxEntradasPorPagina: 10      // Máximo de tuberías de entrada
maxSalidasPorPagina: 2        // Máximo de tuberías de salida
maxSumiderosPorPagina: 6      // Máximo de sumideros
maxFotosPorPagina: 4          // Máximo de fotos
```

## Campos Reimprimibles Disponibles

Desde el diseñador, puedes marcar estos campos para que se repitan en cada página:

### Identificación
- `idPozo` - ID del pozo
- `fecha` - Fecha de inspección
- `levanto` - Inspector
- `estado` - Estado general

### Ubicación
- `direccion` - Dirección
- `barrio` - Barrio
- `profundidad` - Profundidad

### Componentes
- `tipoCamara` - Tipo de cámara
- `sistema` - Sistema

### Coordenadas
- `coordenadaX` - Longitud
- `coordenadaY` - Latitud

## Configuración en Código

```typescript
import { PaginatedPDFGenerator } from '@/lib/pdf/paginatedPdfGenerator';
import type { PaginationConfig } from '@/types/paginationConfig';

// Configuración personalizada
const config: Partial<PaginationConfig> = {
  limits: {
    maxEntradasPorPagina: 10,
    maxSalidasPorPagina: 2,
    maxSumiderosPorPagina: 6,
    maxFotosPorPagina: 4,
  },
  repeatableHeader: {
    enabled: true,
    fields: [
      'idPozo',
      'fecha',
      'direccion',
    ],
    height: 20,
    showSeparator: true,
    style: {
      backgroundColor: '#F5F5F5',
      textColor: '#333333',
      fontSize: 9,
      fontWeight: 'normal',
    },
  },
  showPageIndicator: true,
  showSectionTitles: true,
};

const generator = new PaginatedPDFGenerator(config);
const result = await generator.generatePaginatedPDF(ficha, pozo);
```

## Ejemplo de Uso

```typescript
// Generar PDF con paginación automática
const { blob, filename, pageCount } = await paginatedPdfGenerator.generatePaginatedPDF(
  ficha,
  pozo,
  {
    pageNumbers: true,
    includeDate: true,
  }
);

console.log(`PDF generado: ${pageCount} páginas`);
```

## Estadísticas de Paginación

```typescript
const stats = paginationService.getStats(pozo);
console.log(`Total de entradas: ${stats.totalEntradas}`);
console.log(`Páginas de entradas: ${stats.entradasPages}`);
console.log(`Total de páginas: ${stats.totalPages}`);
```

## Estructura de Páginas

### Página 1: Información General
- Encabezado con título
- Identificación del pozo
- Ubicación
- Componentes
- Resumen de contenido

### Páginas 2+: Contenido Paginado
- Encabezado reimprimible (si está habilitado)
- Tuberías (entradas y/o salidas)
- Sumideros
- Fotos

## Integración con Diseñador

En el diseñador HTML, puedes:

1. **Seleccionar campos reimprimibles**: Checkbox para cada campo
2. **Configurar límites**: Input numérico para cada tipo de contenido
3. **Personalizar estilo**: Color, tamaño de fuente, etc.
4. **Vista previa**: Mostrar cómo se vería con múltiples páginas

## Archivos Relacionados

- `src/types/paginationConfig.ts` - Tipos y configuración
- `src/lib/pdf/paginationService.ts` - Servicio de paginación
- `src/lib/pdf/paginatedPdfGenerator.ts` - Generador de PDF
