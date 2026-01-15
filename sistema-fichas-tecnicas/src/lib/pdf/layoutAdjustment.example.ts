/**
 * Ejemplos de uso del Servicio de Ajuste de Layout
 */

import { LayoutAdjustmentService } from './layoutAdjustmentService';
import type { Pozo } from '@/types/pozo';

/**
 * Ejemplo 1: Ajuste básico
 */
export function example1_BasicAdjustment(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== AJUSTE BÁSICO ===');
  console.log(`Entradas: ${adjustment.actualEntradas}/${adjustment.maxEntradas}`);
  console.log(`Salidas: ${adjustment.actualSalidas}/${adjustment.maxSalidas}`);
  console.log(`Sumideros: ${adjustment.actualSumideros}/${adjustment.maxSumideros}`);
  console.log(`Fotos: ${adjustment.actualFotos}/${adjustment.maxFotos}`);
  console.log(`Necesita múltiples páginas: ${adjustment.needsMultiplePages}`);
  console.log(`Total de páginas: ${adjustment.totalPages}`);
}

/**
 * Ejemplo 2: Obtener factores de escala
 */
export function example2_ScaleFactors(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== FACTORES DE ESCALA ===');
  console.log(`Entradas: ${(adjustment.scaleEntradas * 100).toFixed(1)}%`);
  console.log(`Salidas: ${(adjustment.scaleSalidas * 100).toFixed(1)}%`);
  console.log(`Sumideros: ${(adjustment.scaleSumideros * 100).toFixed(1)}%`);
  console.log(`Fotos: ${(adjustment.scaleFotos * 100).toFixed(1)}%`);
}

/**
 * Ejemplo 3: Obtener alturas ajustadas
 */
export function example3_AdjustedHeights(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== ALTURAS AJUSTADAS (mm) ===');
  console.log(`Entradas: ${adjustment.heightEntradas.toFixed(1)}mm (máx: ${service.getDesignHeights().maxEntradasHeight}mm)`);
  console.log(`Salidas: ${adjustment.heightSalidas.toFixed(1)}mm (máx: ${service.getDesignHeights().maxSalidasHeight}mm)`);
  console.log(`Sumideros: ${adjustment.heightSumideros.toFixed(1)}mm (máx: ${service.getDesignHeights().maxSumiderosHeight}mm)`);
  console.log(`Fotos: ${adjustment.heightFotos.toFixed(1)}mm (máx: ${service.getDesignHeights().maxFotosHeight}mm)`);
}

/**
 * Ejemplo 4: Obtener espacios vacíos
 */
export function example4_EmptySpaces(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== ESPACIOS VACÍOS (mm) ===');
  console.log(`Entradas: ${adjustment.emptySpaceEntradas.toFixed(1)}mm`);
  console.log(`Salidas: ${adjustment.emptySpaceSalidas.toFixed(1)}mm`);
  console.log(`Sumideros: ${adjustment.emptySpaceSumideros.toFixed(1)}mm`);
  console.log(`Fotos: ${adjustment.emptySpaceFotos.toFixed(1)}mm`);
}

/**
 * Ejemplo 5: Generar reporte completo
 */
export function example5_FullReport(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log(service.generateReport(adjustment));
}

/**
 * Ejemplo 6: Configurar alturas personalizadas
 */
export function example6_CustomHeights(pozo: Pozo) {
  const service = new LayoutAdjustmentService({
    entradaRowHeight: 6,        // Más alto
    salidaRowHeight: 6,
    sumideroRowHeight: 6,
    fotoHeight: 45,             // Fotos más grandes
    
    maxEntradasHeight: 60,      // 10 × 6mm
    maxSalidasHeight: 12,       // 2 × 6mm
    maxSumiderosHeight: 36,     // 6 × 6mm
    maxFotosHeight: 90,         // 4 × 45mm
  });
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== ALTURAS PERSONALIZADAS ===');
  console.log(service.generateReport(adjustment));
}

/**
 * Ejemplo 7: Comparar múltiples pozos
 */
export function example7_ComparePozos(pozos: Pozo[]) {
  const service = new LayoutAdjustmentService();
  
  console.log('=== COMPARACIÓN DE POZOS ===\n');
  
  pozos.forEach((pozo, index) => {
    const adjustment = service.calculateAdjustment(pozo, {
      maxEntradas: 10,
      maxSalidas: 2,
      maxSumideros: 6,
      maxFotos: 4,
    });
    
    console.log(`Pozo ${index + 1}:`);
    console.log(`  Entradas: ${adjustment.actualEntradas}/${adjustment.maxEntradas} (${(adjustment.scaleEntradas * 100).toFixed(1)}%)`);
    console.log(`  Salidas: ${adjustment.actualSalidas}/${adjustment.maxSalidas} (${(adjustment.scaleSalidas * 100).toFixed(1)}%)`);
    console.log(`  Sumideros: ${adjustment.actualSumideros}/${adjustment.maxSumideros} (${(adjustment.scaleSumideros * 100).toFixed(1)}%)`);
    console.log(`  Fotos: ${adjustment.actualFotos}/${adjustment.maxFotos} (${(adjustment.scaleFotos * 100).toFixed(1)}%)`);
    console.log(`  Páginas: ${adjustment.totalPages}\n`);
  });
}

/**
 * Ejemplo 8: Usar en generador de PDF
 */
export async function example8_WithPDFGenerator(ficha: any, pozo: Pozo) {
  const { PaginatedPDFGenerator } = await import('./paginatedPdfGenerator');
  
  const layoutService = new LayoutAdjustmentService();
  const pdfGenerator = new PaginatedPDFGenerator();
  
  // Calcular ajuste
  const adjustment = layoutService.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  // Mostrar información
  console.log('=== GENERANDO PDF CON AJUSTE ===');
  console.log(`Páginas necesarias: ${adjustment.totalPages}`);
  console.log(`Escala entradas: ${(adjustment.scaleEntradas * 100).toFixed(1)}%`);
  console.log(`Escala salidas: ${(adjustment.scaleSalidas * 100).toFixed(1)}%`);
  console.log(`Escala sumideros: ${(adjustment.scaleSumideros * 100).toFixed(1)}%`);
  console.log(`Escala fotos: ${(adjustment.scaleFotos * 100).toFixed(1)}%`);
  
  // Generar PDF
  const result = await pdfGenerator.generatePaginatedPDF(ficha, pozo);
  
  console.log(`\nPDF generado: ${result.filename}`);
  console.log(`Páginas totales: ${result.pageCount}`);
  
  return result;
}

/**
 * Ejemplo 9: Detectar si necesita múltiples páginas
 */
export function example9_MultiPageDetection(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  console.log('=== DETECCIÓN DE MÚLTIPLES PÁGINAS ===');
  
  if (adjustment.needsMultiplePages) {
    console.log('⚠️ Este pozo necesita múltiples páginas');
    console.log(`Total de páginas: ${adjustment.totalPages}`);
    
    if (adjustment.actualEntradas > adjustment.maxEntradas) {
      console.log(`  - Entradas: ${adjustment.actualEntradas} > ${adjustment.maxEntradas}`);
    }
    if (adjustment.actualSalidas > adjustment.maxSalidas) {
      console.log(`  - Salidas: ${adjustment.actualSalidas} > ${adjustment.maxSalidas}`);
    }
    if (adjustment.actualSumideros > adjustment.maxSumideros) {
      console.log(`  - Sumideros: ${adjustment.actualSumideros} > ${adjustment.maxSumideros}`);
    }
    if (adjustment.actualFotos > adjustment.maxFotos) {
      console.log(`  - Fotos: ${adjustment.actualFotos} > ${adjustment.maxFotos}`);
    }
  } else {
    console.log('✓ Este pozo cabe en una sola página');
  }
}

/**
 * Ejemplo 10: Obtener información para UI
 */
export function example10_UIInformation(pozo: Pozo) {
  const service = new LayoutAdjustmentService();
  
  const adjustment = service.calculateAdjustment(pozo, {
    maxEntradas: 10,
    maxSalidas: 2,
    maxSumideros: 6,
    maxFotos: 4,
  });
  
  // Información para mostrar en UI
  const uiData = {
    summary: {
      totalItems: adjustment.actualEntradas + adjustment.actualSalidas + 
                  adjustment.actualSumideros + adjustment.actualFotos,
      totalPages: adjustment.totalPages,
    },
    items: {
      entradas: {
        actual: adjustment.actualEntradas,
        max: adjustment.maxEntradas,
        percentage: (adjustment.scaleEntradas * 100).toFixed(1),
        height: adjustment.heightEntradas.toFixed(1),
      },
      salidas: {
        actual: adjustment.actualSalidas,
        max: adjustment.maxSalidas,
        percentage: (adjustment.scaleSalidas * 100).toFixed(1),
        height: adjustment.heightSalidas.toFixed(1),
      },
      sumideros: {
        actual: adjustment.actualSumideros,
        max: adjustment.maxSumideros,
        percentage: (adjustment.scaleSumideros * 100).toFixed(1),
        height: adjustment.heightSumideros.toFixed(1),
      },
      fotos: {
        actual: adjustment.actualFotos,
        max: adjustment.maxFotos,
        percentage: (adjustment.scaleFotos * 100).toFixed(1),
        height: adjustment.heightFotos.toFixed(1),
      },
    },
  };
  
  console.log('=== INFORMACIÓN PARA UI ===');
  console.log(JSON.stringify(uiData, null, 2));
  
  return uiData;
}
