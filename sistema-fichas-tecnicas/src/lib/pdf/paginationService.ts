/**
 * Servicio de Paginación para PDF
 * Requirements: 7.1, 7.2
 * 
 * Maneja la paginación automática de contenido repetible
 * (tuberías, sumideros, fotos) según límites configurables
 */

import type { Pozo, TuberiaInfo, SumideroInfo, FotoInfo } from '@/types/pozo';
import type {
  PaginationConfig,
  PaginationResult,
  PaginatedContent,
  DEFAULT_PAGINATION_CONFIG,
} from '@/types/paginationConfig';

export class PaginationService {
  private config: PaginationConfig;

  constructor(config?: Partial<PaginationConfig>) {
    // Importar DEFAULT_PAGINATION_CONFIG
    const DEFAULT: PaginationConfig = {
      limits: {
        maxEntradasPorPagina: 10,
        maxSalidasPorPagina: 2,
        maxSumiderosPorPagina: 6,
        maxFotosPorPagina: 4,
      },
      repeatableHeader: {
        enabled: true,
        fields: [],
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

    this.config = {
      ...DEFAULT,
      ...config,
      limits: { ...DEFAULT.limits, ...config?.limits },
      repeatableHeader: { ...DEFAULT.repeatableHeader, ...config?.repeatableHeader },
    };
  }

  /**
   * Pagina el contenido repetible de un pozo
   */
  paginatePozo(pozo: Pozo): PaginationResult {
    const pages: PaginatedContent[] = [];

    // Separar tuberías por tipo
    const entradas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'entrada'
    );
    const salidas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'salida'
    );
    const sumideros = pozo.sumideros || [];
    const fotos = (pozo.fotos && Array.isArray(pozo.fotos)) ? pozo.fotos : [];

    // Calcular número de páginas necesarias
    const entradasPages = Math.ceil(
      entradas.length / this.config.limits.maxEntradasPorPagina
    );
    const salidasPages = Math.ceil(
      salidas.length / this.config.limits.maxSalidasPorPagina
    );
    const sumiderosPages = Math.ceil(
      sumideros.length / this.config.limits.maxSumiderosPorPagina
    );
    const fotosPages = Math.ceil(
      fotos.length / this.config.limits.maxFotosPorPagina
    );

    const totalPages = Math.max(
      1,
      entradasPages + salidasPages + sumiderosPages + fotosPages
    );

    // Crear páginas
    let pageNum = 1;
    let entradaIdx = 0;
    let salidaIdx = 0;
    let sumideroIdx = 0;
    let fotoIdx = 0;

    while (pageNum <= totalPages) {
      const page: PaginatedContent = {
        pageNumber: pageNum,
        tuberias: {
          entradas: [],
          salidas: [],
        },
        sumideros: [],
        fotos: [],
        hasContent: false,
      };

      // Agregar entradas
      const entradasEnd = Math.min(
        entradaIdx + this.config.limits.maxEntradasPorPagina,
        entradas.length
      );
      if (entradaIdx < entradas.length) {
        page.tuberias.entradas = entradas.slice(entradaIdx, entradasEnd);
        entradaIdx = entradasEnd;
        page.hasContent = true;
      }

      // Agregar salidas
      const salidasEnd = Math.min(
        salidaIdx + this.config.limits.maxSalidasPorPagina,
        salidas.length
      );
      if (salidaIdx < salidas.length) {
        page.tuberias.salidas = salidas.slice(salidaIdx, salidasEnd);
        salidaIdx = salidasEnd;
        page.hasContent = true;
      }

      // Agregar sumideros
      const sumiderosEnd = Math.min(
        sumideroIdx + this.config.limits.maxSumiderosPorPagina,
        sumideros.length
      );
      if (sumideroIdx < sumideros.length) {
        page.sumideros = sumideros.slice(sumideroIdx, sumiderosEnd);
        sumideroIdx = sumiderosEnd;
        page.hasContent = true;
      }

      // Agregar fotos
      const fotosEnd = Math.min(
        fotoIdx + this.config.limits.maxFotosPorPagina,
        fotos.length
      );
      if (fotoIdx < fotos.length) {
        page.fotos = fotos.slice(fotoIdx, fotosEnd);
        fotoIdx = fotosEnd;
        page.hasContent = true;
      }

      if (page.hasContent) {
        pages.push(page);
      }

      pageNum++;
    }

    return {
      pages: pages.length > 0 ? pages : [this.createEmptyPage(1)],
      totalPages: Math.max(1, pages.length),
      totalItems: entradas.length + salidas.length + sumideros.length + fotos.length,
    };
  }

  /**
   * Crea una página vacía
   */
  private createEmptyPage(pageNumber: number): PaginatedContent {
    return {
      pageNumber,
      tuberias: { entradas: [], salidas: [] },
      sumideros: [],
      fotos: [],
      hasContent: false,
    };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): PaginationConfig {
    return this.config;
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: Partial<PaginationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      limits: { ...this.config.limits, ...config.limits },
      repeatableHeader: { ...this.config.repeatableHeader, ...config.repeatableHeader },
    };
  }

  /**
   * Calcula el número de páginas necesarias
   */
  calculatePageCount(pozo: Pozo): number {
    const result = this.paginatePozo(pozo);
    return result.totalPages;
  }

  /**
   * Obtiene estadísticas de paginación
   */
  getStats(pozo: Pozo): {
    totalEntradas: number;
    totalSalidas: number;
    totalSumideros: number;
    totalFotos: number;
    totalPages: number;
    entradasPages: number;
    salidasPages: number;
    sumiderosPages: number;
    fotosPages: number;
  } {
    const entradas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'entrada'
    );
    const salidas = (pozo.tuberias || []).filter(
      (t: any) => t.tipoTuberia?.value === 'salida'
    );
    const sumideros = pozo.sumideros || [];
    const fotos = (pozo.fotos && Array.isArray(pozo.fotos)) ? pozo.fotos : [];

    const entradasPages = Math.ceil(
      entradas.length / this.config.limits.maxEntradasPorPagina
    );
    const salidasPages = Math.ceil(
      salidas.length / this.config.limits.maxSalidasPorPagina
    );
    const sumiderosPages = Math.ceil(
      sumideros.length / this.config.limits.maxSumiderosPorPagina
    );
    const fotosPages = Math.ceil(
      fotos.length / this.config.limits.maxFotosPorPagina
    );

    return {
      totalEntradas: entradas.length,
      totalSalidas: salidas.length,
      totalSumideros: sumideros.length,
      totalFotos: fotos.length,
      totalPages: Math.max(
        1,
        entradasPages + salidasPages + sumiderosPages + fotosPages
      ),
      entradasPages,
      salidasPages,
      sumiderosPages,
      fotosPages,
    };
  }
}

/**
 * Instancia global del servicio de paginación
 */
export const paginationService = new PaginationService();
