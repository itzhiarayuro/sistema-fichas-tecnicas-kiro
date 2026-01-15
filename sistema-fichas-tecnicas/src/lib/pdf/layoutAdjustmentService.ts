/**
 * Servicio de Ajuste Automático de Layout
 * Requirements: 7.1, 7.2
 * 
 * Reajusta automáticamente el espacio en el PDF según la cantidad real de datos
 * El diseño se hace con MÁXIMOS y se ajusta dinámicamente
 */

import type { Pozo, TuberiaInfo, SumideroInfo, FotoInfo } from '@/types/pozo';

/**
 * Información de un elemento (tubería, sumidero, foto)
 */
export interface ElementInfo {
  id: string;
  type: 'entrada' | 'salida' | 'sumidero' | 'foto';
  height: number; // Altura que ocupa en mm
}

/**
 * Información de ajuste de layout
 */
export interface LayoutAdjustment {
  // Cantidades reales
  actualEntradas: number;
  actualSalidas: number;
  actualSumideros: number;
  actualFotos: number;
  
  // Máximos del diseño
  maxEntradas: number;
  maxSalidas: number;
  maxSumideros: number;
  maxFotos: number;
  
  // Factores de escala (0.0 a 1.0)
  scaleEntradas: number;
  scaleSalidas: number;
  scaleSumideros: number;
  scaleFotos: number;
  
  // Alturas ajustadas en mm
  heightEntradas: number;
  heightSalidas: number;
  heightSumideros: number;
  heightFotos: number;
  
  // Espacios en blanco a distribuir
  emptySpaceEntradas: number;
  emptySpaceSalidas: number;
  emptySpaceSumideros: number;
  emptySpaceFotos: number;
  
  // Información de paginación
  needsMultiplePages: boolean;
  totalPages: number;
}

/**
 * Configuración de alturas del diseño
 */
export interface DesignHeights {
  entradaRowHeight: number;      // Altura de cada fila de entrada (mm)
  salidaRowHeight: number;       // Altura de cada fila de salida (mm)
  sumideroRowHeight: number;     // Altura de cada fila de sumidero (mm)
  fotoHeight: number;            // Altura de cada foto (mm)
  
  maxEntradasHeight: number;     // Altura total reservada para entradas (mm)
  maxSalidasHeight: number;      // Altura total reservada para salidas (mm)
  maxSumiderosHeight: number;    // Altura total reservada para sumideros (mm)
  maxFotosHeight: number;        // Altura total reservada para fotos (mm)
}

/**
 * Servicio de ajuste de layout
 */
export class LayoutAdjustmentService {
  private designHeights: DesignHeights;

  constructor(designHeights?: Partial<DesignHeights>) {
    // Valores por defecto (basados en A4 con máximos)
    this.designHeights = {
      entradaRowHeight: 5.5,      // mm por fila
      salidaRowHeight: 5.5,       // mm por fila
      sumideroRowHeight: 5.5,     // mm por fila
      fotoHeight: 40,             // mm por foto
      
      maxEntradasHeight: 55,      // 10 entradas × 5.5mm
      maxSalidasHeight: 11,       // 2 salidas × 5.5mm
      maxSumiderosHeight: 33,     // 6 sumideros × 5.5mm
      maxFotosHeight: 80,         // 4 fotos × 40mm (2 por fila)
      
      ...designHeights,
    };
  }

  /**
   * Calcula el ajuste de layout para un pozo
   */
  calculateAdjustment(pozo: Pozo, maxLimits: {
    maxEntradas: number;
    maxSalidas: number;
    maxSumideros: number;
    maxFotos: number;
  }): LayoutAdjustment {
    // Contar elementos reales
    const entradas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'entrada'
    );
    const salidas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'salida'
    );
    const sumideros = pozo.sumideros || [];
    const fotos = (pozo.fotos && Array.isArray(pozo.fotos)) ? pozo.fotos : [];

    const actualEntradas = entradas.length;
    const actualSalidas = salidas.length;
    const actualSumideros = sumideros.length;
    const actualFotos = fotos.length;

    // Calcular factores de escala
    const scaleEntradas = Math.min(actualEntradas / maxLimits.maxEntradas, 1);
    const scaleSalidas = Math.min(actualSalidas / maxLimits.maxSalidas, 1);
    const scaleSumideros = Math.min(actualSumideros / maxLimits.maxSumideros, 1);
    const scaleFotos = Math.min(actualFotos / maxLimits.maxFotos, 1);

    // Calcular alturas ajustadas
    const heightEntradas = actualEntradas * this.designHeights.entradaRowHeight;
    const heightSalidas = actualSalidas * this.designHeights.salidaRowHeight;
    const heightSumideros = actualSumideros * this.designHeights.sumideroRowHeight;
    const heightFotos = this.calculatePhotoHeight(actualFotos);

    // Calcular espacios en blanco
    const emptySpaceEntradas = this.designHeights.maxEntradasHeight - heightEntradas;
    const emptySpaceSalidas = this.designHeights.maxSalidasHeight - heightSalidas;
    const emptySpaceSumideros = this.designHeights.maxSumiderosHeight - heightSumideros;
    const emptySpaceFotos = this.designHeights.maxFotosHeight - heightFotos;

    // Determinar si necesita múltiples páginas
    const needsMultiplePages = 
      actualEntradas > maxLimits.maxEntradas ||
      actualSalidas > maxLimits.maxSalidas ||
      actualSumideros > maxLimits.maxSumideros ||
      actualFotos > maxLimits.maxFotos;

    // Calcular total de páginas
    const totalPages = Math.max(
      1,
      Math.ceil(actualEntradas / maxLimits.maxEntradas),
      Math.ceil(actualSalidas / maxLimits.maxSalidas),
      Math.ceil(actualSumideros / maxLimits.maxSumideros),
      Math.ceil(actualFotos / maxLimits.maxFotos)
    );

    return {
      actualEntradas,
      actualSalidas,
      actualSumideros,
      actualFotos,
      maxEntradas: maxLimits.maxEntradas,
      maxSalidas: maxLimits.maxSalidas,
      maxSumideros: maxLimits.maxSumideros,
      maxFotos: maxLimits.maxFotos,
      scaleEntradas,
      scaleSalidas,
      scaleSumideros,
      scaleFotos,
      heightEntradas,
      heightSalidas,
      heightSumideros,
      heightFotos,
      emptySpaceEntradas,
      emptySpaceSalidas,
      emptySpaceSumideros,
      emptySpaceFotos,
      needsMultiplePages,
      totalPages,
    };
  }

  /**
   * Calcula la altura de fotos (2 por fila)
   */
  private calculatePhotoHeight(photoCount: number): number {
    if (photoCount === 0) return 0;
    const rows = Math.ceil(photoCount / 2);
    return rows * this.designHeights.fotoHeight;
  }

  /**
   * Obtiene el factor de escala para un elemento
   */
  getScaleFactor(type: 'entrada' | 'salida' | 'sumidero' | 'foto', adjustment: LayoutAdjustment): number {
    switch (type) {
      case 'entrada':
        return adjustment.scaleEntradas;
      case 'salida':
        return adjustment.scaleSalidas;
      case 'sumidero':
        return adjustment.scaleSumideros;
      case 'foto':
        return adjustment.scaleFotos;
    }
  }

  /**
   * Obtiene la altura ajustada para un elemento
   */
  getAdjustedHeight(type: 'entrada' | 'salida' | 'sumidero' | 'foto', adjustment: LayoutAdjustment): number {
    switch (type) {
      case 'entrada':
        return adjustment.heightEntradas;
      case 'salida':
        return adjustment.heightSalidas;
      case 'sumidero':
        return adjustment.heightSumideros;
      case 'foto':
        return adjustment.heightFotos;
    }
  }

  /**
   * Obtiene el espacio en blanco para un elemento
   */
  getEmptySpace(type: 'entrada' | 'salida' | 'sumidero' | 'foto', adjustment: LayoutAdjustment): number {
    switch (type) {
      case 'entrada':
        return adjustment.emptySpaceEntradas;
      case 'salida':
        return adjustment.emptySpaceSalidas;
      case 'sumidero':
        return adjustment.emptySpaceSumideros;
      case 'foto':
        return adjustment.emptySpaceFotos;
    }
  }

  /**
   * Genera un reporte de ajuste
   */
  generateReport(adjustment: LayoutAdjustment): string {
    return `
=== REPORTE DE AJUSTE DE LAYOUT ===

ENTRADAS:
  Cantidad real: ${adjustment.actualEntradas}
  Máximo diseño: ${adjustment.maxEntradas}
  Factor escala: ${(adjustment.scaleEntradas * 100).toFixed(1)}%
  Altura: ${adjustment.heightEntradas.toFixed(1)}mm / ${this.designHeights.maxEntradasHeight}mm
  Espacio vacío: ${adjustment.emptySpaceEntradas.toFixed(1)}mm

SALIDAS:
  Cantidad real: ${adjustment.actualSalidas}
  Máximo diseño: ${adjustment.maxSalidas}
  Factor escala: ${(adjustment.scaleSalidas * 100).toFixed(1)}%
  Altura: ${adjustment.heightSalidas.toFixed(1)}mm / ${this.designHeights.maxSalidasHeight}mm
  Espacio vacío: ${adjustment.emptySpaceSalidas.toFixed(1)}mm

SUMIDEROS:
  Cantidad real: ${adjustment.actualSumideros}
  Máximo diseño: ${adjustment.maxSumideros}
  Factor escala: ${(adjustment.scaleSumideros * 100).toFixed(1)}%
  Altura: ${adjustment.heightSumideros.toFixed(1)}mm / ${this.designHeights.maxSumiderosHeight}mm
  Espacio vacío: ${adjustment.emptySpaceSumideros.toFixed(1)}mm

FOTOS:
  Cantidad real: ${adjustment.actualFotos}
  Máximo diseño: ${adjustment.maxFotos}
  Factor escala: ${(adjustment.scaleFotos * 100).toFixed(1)}%
  Altura: ${adjustment.heightFotos.toFixed(1)}mm / ${this.designHeights.maxFotosHeight}mm
  Espacio vacío: ${adjustment.emptySpaceFotos.toFixed(1)}mm

PAGINACIÓN:
  Necesita múltiples páginas: ${adjustment.needsMultiplePages ? 'Sí' : 'No'}
  Total de páginas: ${adjustment.totalPages}
    `;
  }

  /**
   * Actualiza las alturas del diseño
   */
  updateDesignHeights(heights: Partial<DesignHeights>): void {
    this.designHeights = { ...this.designHeights, ...heights };
  }

  /**
   * Obtiene las alturas actuales del diseño
   */
  getDesignHeights(): DesignHeights {
    return { ...this.designHeights };
  }
}

/**
 * Instancia global del servicio
 */
export const layoutAdjustmentService = new LayoutAdjustmentService();
