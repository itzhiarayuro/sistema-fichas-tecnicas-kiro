# Guía: Diseño con Ajuste Automático de Layout

## Concepto

**Haces un diseño UNA SOLA VEZ con los MÁXIMOS** y el sistema reajusta automáticamente según los datos reales.

```
Diseño (máximos):          Datos reales:           Resultado:
10 entradas                3 entradas              ✓ Se ajusta automáticamente
2 salidas                  1 salida                ✓ Espacios se distribuyen
6 sumideros                2 sumideros             ✓ Sin espacios vacíos grandes
4 fotos                    1 foto                  ✓ Layout se adapta
```

## Cómo Funciona

### 1. Diseña con Máximos
En el diseñador HTML, creas un layout con:
- **10 filas** para entradas (5.5mm cada una = 55mm total)
- **2 filas** para salidas (5.5mm cada una = 11mm total)
- **6 filas** para sumideros (5.5mm cada una = 33mm total)
- **4 fotos** (2 por fila, 40mm cada una = 80mm total)

### 2. Sistema Detecta Datos Reales
Cuando generas el PDF, el sistema:
- Cuenta cuántas entradas hay realmente (ej: 3)
- Cuenta cuántas salidas hay realmente (ej: 1)
- Cuenta cuántos sumideros hay realmente (ej: 2)
- Cuenta cuántas fotos hay realmente (ej: 1)

### 3. Reajusta Automáticamente
El sistema calcula:
- **Factor de escala**: 3/10 = 30% para entradas
- **Altura real**: 3 × 5.5mm = 16.5mm (en lugar de 55mm)
- **Espacio vacío**: 55mm - 16.5mm = 38.5mm
- **Distribución**: El espacio vacío se distribuye o se elimina

## Ejemplo Práctico

### Diseño Original (Máximos)
```
┌─────────────────────────────┐
│ ENTRADAS (10 filas)         │ 55mm
│ ─────────────────────────── │
│ Ø | Material | Cota | ...   │
│ ─────────────────────────── │
│ [10 filas vacías]           │
└─────────────────────────────┘

┌─────────────────────────────┐
│ SALIDAS (2 filas)           │ 11mm
│ ─────────────────────────── │
│ [2 filas vacías]            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ SUMIDEROS (6 filas)         │ 33mm
│ ─────────────────────────── │
│ [6 filas vacías]            │
└─────────────────────────────┘
```

### Datos Reales
- 3 entradas
- 1 salida
- 2 sumideros

### Resultado Ajustado
```
┌─────────────────────────────┐
│ ENTRADAS (3 filas)          │ 16.5mm
│ ─────────────────────────── │
│ Ø | Material | Cota | ...   │
│ 100 | PVC | 2.5 | Bueno    │
│ 150 | GRES | 3.0 | Regular │
│ 200 | Concreto | 2.8 | Malo│
└─────────────────────────────┘

┌─────────────────────────────┐
│ SALIDAS (1 fila)            │ 5.5mm
│ ─────────────────────────── │
│ 100 | PVC | 1.5 | Bueno    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ SUMIDEROS (2 filas)         │ 11mm
│ ─────────────────────────── │
│ S1 | Rejilla | PVC | 100    │
│ S2 | Buzón | GRES | 150     │
└─────────────────────────────┘
```

## Configuración en Código

```typescript
import { LayoutAdjustmentService } from '@/lib/pdf/layoutAdjustmentService';

// Crear servicio con alturas del diseño
const layoutService = new LayoutAdjustmentService({
  entradaRowHeight: 5.5,      // mm por fila
  salidaRowHeight: 5.5,       // mm por fila
  sumideroRowHeight: 5.5,     // mm por fila
  fotoHeight: 40,             // mm por foto
  
  maxEntradasHeight: 55,      // 10 × 5.5mm
  maxSalidasHeight: 11,       // 2 × 5.5mm
  maxSumiderosHeight: 33,     // 6 × 5.5mm
  maxFotosHeight: 80,         // 4 × 40mm
});

// Calcular ajuste para un pozo
const adjustment = layoutService.calculateAdjustment(pozo, {
  maxEntradas: 10,
  maxSalidas: 2,
  maxSumideros: 6,
  maxFotos: 4,
});

// Usar en generador de PDF
console.log(`Altura entradas: ${adjustment.heightEntradas}mm`);
console.log(`Espacio vacío: ${adjustment.emptySpaceEntradas}mm`);
console.log(`Factor escala: ${(adjustment.scaleEntradas * 100).toFixed(1)}%`);
```

## Uso en Generador de PDF

```typescript
import { PaginatedPDFGenerator } from '@/lib/pdf/paginatedPdfGenerator';
import { layoutAdjustmentService } from '@/lib/pdf/layoutAdjustmentService';

const generator = new PaginatedPDFGenerator();

// Calcular ajuste
const adjustment = layoutAdjustmentService.calculateAdjustment(pozo, {
  maxEntradas: 10,
  maxSalidas: 2,
  maxSumideros: 6,
  maxFotos: 4,
});

// Generar PDF (el sistema usa automáticamente el ajuste)
const result = await generator.generatePaginatedPDF(ficha, pozo);

// Ver reporte
console.log(layoutAdjustmentService.generateReport(adjustment));
```

## Reporte de Ajuste

```
=== REPORTE DE AJUSTE DE LAYOUT ===

ENTRADAS:
  Cantidad real: 3
  Máximo diseño: 10
  Factor escala: 30.0%
  Altura: 16.5mm / 55mm
  Espacio vacío: 38.5mm

SALIDAS:
  Cantidad real: 1
  Máximo diseño: 2
  Factor escala: 50.0%
  Altura: 5.5mm / 11mm
  Espacio vacío: 5.5mm

SUMIDEROS:
  Cantidad real: 2
  Máximo diseño: 6
  Factor escala: 33.3%
  Altura: 11mm / 33mm
  Espacio vacío: 22mm

FOTOS:
  Cantidad real: 1
  Máximo diseño: 4
  Factor escala: 25.0%
  Altura: 40mm / 80mm
  Espacio vacío: 40mm

PAGINACIÓN:
  Necesita múltiples páginas: No
  Total de páginas: 1
```

## Ventajas del Ajuste Automático

✅ **Un solo diseño**: No necesitas múltiples versiones
✅ **Flexible**: Funciona con cualquier cantidad de datos
✅ **Profesional**: Sin espacios vacíos grandes
✅ **Eficiente**: Usa el espacio disponible óptimamente
✅ **Escalable**: Si hay más datos, crea páginas adicionales automáticamente

## Pasos para Implementar

1. **Diseña en el diseñador HTML** con máximos (10, 2, 6, 4)
2. **Exporta la configuración** del diseño
3. **El sistema detecta** los máximos automáticamente
4. **Reajusta dinámicamente** según los datos
5. **Genera PDF** con layout optimizado

## Notas Importantes

- El ajuste es **automático**, no necesitas configurar nada
- Los **máximos se detectan** del diseño
- Si hay **más datos que máximos**, crea **páginas adicionales**
- Los **espacios vacíos se distribuyen** proporcionalmente
- El **encabezado reimprimible** se mantiene en cada página
