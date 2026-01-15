# Resumen: Paginación Automática y Encabezados Reimprimibles

## ¿Qué se implementó?

### 1. Paginación Automática
El sistema ahora crea automáticamente múltiples páginas cuando hay muchas tuberías, sumideros o fotos.

**Límites por página (configurables):**
- Máximo 10 entradas por página
- Máximo 2 salidas por página
- Máximo 6 sumideros por página
- Máximo 4 fotos por página

### 2. Encabezados Reimprimibles
Desde el diseñador, puedes marcar qué campos se repiten en cada página de un mismo pozo.

**Campos disponibles para repetir:**
- ID del pozo
- Fecha de inspección
- Inspector (levanto)
- Estado general
- Dirección
- Barrio
- Profundidad
- Tipo de cámara
- Sistema
- Coordenadas (X, Y)

## Archivos Creados

### 1. `src/types/paginationConfig.ts`
Define los tipos y configuración para paginación:
- `PaginationLimits` - Límites de elementos por página
- `RepeatableHeaderField` - Campos que pueden ser reimprimibles
- `RepeatableHeaderConfig` - Configuración del encabezado
- `PaginationConfig` - Configuración completa

### 2. `src/lib/pdf/paginationService.ts`
Servicio que maneja la lógica de paginación:
- `paginatePozo()` - Pagina el contenido de un pozo
- `getStats()` - Obtiene estadísticas de paginación
- `calculatePageCount()` - Calcula número de páginas necesarias

### 3. `src/lib/pdf/paginatedPdfGenerator.ts`
Generador de PDF con paginación automática:
- `generatePaginatedPDF()` - Genera PDF con paginación
- `renderRepeatableHeader()` - Renderiza encabezado reimprimible
- `renderPaginatedContent()` - Renderiza contenido paginado

### 4. `src/lib/pdf/paginatedPdfGenerator.example.ts`
Ejemplos de uso con 8 casos diferentes

## Cómo Usar

### Uso Básico
```typescript
import { PaginatedPDFGenerator } from '@/lib/pdf/paginatedPdfGenerator';

const generator = new PaginatedPDFGenerator();
const { blob, filename, pageCount } = await generator.generatePaginatedPDF(ficha, pozo);
```

### Con Configuración Personalizada
```typescript
const config = {
  limits: {
    maxEntradasPorPagina: 5,
    maxSalidasPorPagina: 1,
    maxSumiderosPorPagina: 3,
    maxFotosPorPagina: 2,
  },
  repeatableHeader: {
    enabled: true,
    fields: ['idPozo', 'fecha', 'direccion'],
    height: 20,
    showSeparator: true,
    style: {
      backgroundColor: '#F5F5F5',
      textColor: '#333333',
      fontSize: 9,
    },
  },
};

const generator = new PaginatedPDFGenerator(config);
const result = await generator.generatePaginatedPDF(ficha, pozo);
```

### Obtener Estadísticas
```typescript
import { PaginationService } from '@/lib/pdf/paginationService';

const service = new PaginationService();
const stats = service.getStats(pozo);

console.log(`Total de páginas: ${stats.totalPages}`);
console.log(`Entradas: ${stats.totalEntradas} en ${stats.entradasPages} página(s)`);
```

## Estructura de Páginas

### Página 1: Información General
- Encabezado con título
- Identificación del pozo
- Ubicación
- Componentes
- Resumen de contenido (cuántas páginas de cada tipo)

### Páginas 2+: Contenido Paginado
- Encabezado reimprimible (si está habilitado)
- Tuberías (entradas y/o salidas)
- Sumideros
- Fotos
- Pie de página con número de página

## Integración con Diseñador

En el diseñador HTML (`diseñador de fichas/editor.html`), se puede:

1. **Seleccionar campos reimprimibles**: Checkboxes para cada campo disponible
2. **Configurar límites**: Inputs numéricos para cada tipo de contenido
3. **Personalizar estilo**: Color, tamaño de fuente, peso de fuente
4. **Vista previa**: Mostrar cómo se vería con múltiples páginas

## Ejemplo de Configuración en Diseñador

```json
{
  "paginationConfig": {
    "limits": {
      "maxEntradasPorPagina": 10,
      "maxSalidasPorPagina": 2,
      "maxSumiderosPorPagina": 6,
      "maxFotosPorPagina": 4
    },
    "repeatableHeader": {
      "enabled": true,
      "fields": ["idPozo", "fecha", "direccion"],
      "height": 20,
      "showSeparator": true,
      "style": {
        "backgroundColor": "#F5F5F5",
        "textColor": "#333333",
        "fontSize": 9,
        "fontWeight": "normal"
      }
    }
  }
}
```

## Ventajas

✅ **Paginación automática**: No hay límite de tuberías, sumideros o fotos
✅ **Encabezados reimprimibles**: Información clave visible en cada página
✅ **Configurable**: Límites y estilos personalizables
✅ **Flexible**: Desde el diseñador se puede cambiar qué campos se repiten
✅ **Estadísticas**: Saber cuántas páginas se generarán antes de crear el PDF

## Próximos Pasos

1. Integrar con el diseñador HTML para permitir configuración visual
2. Agregar opciones de exportación (PDF, Excel, etc.)
3. Permitir guardar configuraciones predefinidas
4. Agregar vista previa de paginación en el diseñador
