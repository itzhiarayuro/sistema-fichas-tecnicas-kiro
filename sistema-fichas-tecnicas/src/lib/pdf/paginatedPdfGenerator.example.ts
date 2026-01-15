/**
 * Ejemplos de uso del Generador de PDF con Paginación
 */

import { PaginatedPDFGenerator } from './paginatedPdfGenerator';
import { PaginationService } from './paginationService';
import type { PaginationConfig, RepeatableHeaderField } from '@/types/paginationConfig';
import type { FichaState } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';

/**
 * Ejemplo 1: Generar PDF con configuración por defecto
 */
export async function example1_DefaultPagination(ficha: FichaState, pozo: Pozo) {
  const generator = new PaginatedPDFGenerator();
  
  const result = await generator.generatePaginatedPDF(ficha, pozo, {
    pageNumbers: true,
    includeDate: true,
  });
  
  console.log(`PDF generado: ${result.pageCount} páginas`);
  console.log(`Nombre: ${result.filename}`);
  
  // Descargar
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  a.click();
}

/**
 * Ejemplo 2: Configuración personalizada con límites específicos
 */
export async function example2_CustomLimits(ficha: FichaState, pozo: Pozo) {
  const config: Partial<PaginationConfig> = {
    limits: {
      maxEntradasPorPagina: 5,      // Menos entradas por página
      maxSalidasPorPagina: 1,       // Menos salidas por página
      maxSumiderosPorPagina: 3,     // Menos sumideros por página
      maxFotosPorPagina: 2,         // Menos fotos por página
    },
  };
  
  const generator = new PaginatedPDFGenerator(config);
  const result = await generator.generatePaginatedPDF(ficha, pozo);
  
  console.log(`PDF con límites personalizados: ${result.pageCount} páginas`);
}

/**
 * Ejemplo 3: Encabezados reimprimibles personalizados
 */
export async function example3_CustomHeaders(ficha: FichaState, pozo: Pozo) {
  const config: Partial<PaginationConfig> = {
    repeatableHeader: {
      enabled: true,
      fields: [
        'idPozo' as RepeatableHeaderField,
        'fecha' as RepeatableHeaderField,
        'direccion' as RepeatableHeaderField,
        'tipoCamara' as RepeatableHeaderField,
      ],
      height: 25,
      showSeparator: true,
      style: {
        backgroundColor: '#E8F4F8',
        textColor: '#1F4E79',
        fontSize: 10,
        fontWeight: 'bold',
      },
    },
  };
  
  const generator = new PaginatedPDFGenerator(config);
  const result = await generator.generatePaginatedPDF(ficha, pozo);
  
  console.log(`PDF con encabezados personalizados: ${result.pageCount} páginas`);
}

/**
 * Ejemplo 4: Obtener estadísticas de paginación
 */
export function example4_PaginationStats(pozo: Pozo) {
  const service = new PaginationService();
  const stats = service.getStats(pozo);
  
  console.log('=== ESTADÍSTICAS DE PAGINACIÓN ===');
  console.log(`Total de entradas: ${stats.totalEntradas}`);
  console.log(`Páginas de entradas: ${stats.entradasPages}`);
  console.log(`Total de salidas: ${stats.totalSalidas}`);
  console.log(`Páginas de salidas: ${stats.salidasPages}`);
  console.log(`Total de sumideros: ${stats.totalSumideros}`);
  console.log(`Páginas de sumideros: ${stats.sumiderosPages}`);
  console.log(`Total de fotos: ${stats.totalFotos}`);
  console.log(`Páginas de fotos: ${stats.fotosPages}`);
  console.log(`TOTAL DE PÁGINAS: ${stats.totalPages}`);
}

/**
 * Ejemplo 5: Paginar contenido sin generar PDF
 */
export function example5_PaginationOnly(pozo: Pozo) {
  const service = new PaginationService();
  const result = service.paginatePozo(pozo);
  
  console.log(`Total de páginas: ${result.totalPages}`);
  console.log(`Total de items: ${result.totalItems}`);
  
  result.pages.forEach((page, index) => {
    console.log(`\n--- Página ${page.pageNumber} ---`);
    console.log(`Entradas: ${page.tuberias.entradas.length}`);
    console.log(`Salidas: ${page.tuberias.salidas.length}`);
    console.log(`Sumideros: ${page.sumideros.length}`);
    console.log(`Fotos: ${page.fotos.length}`);
  });
}

/**
 * Ejemplo 6: Configuración completa personalizada
 */
export async function example6_FullCustomConfig(ficha: FichaState, pozo: Pozo) {
  const config: Partial<PaginationConfig> = {
    limits: {
      maxEntradasPorPagina: 8,
      maxSalidasPorPagina: 2,
      maxSumiderosPorPagina: 5,
      maxFotosPorPagina: 3,
    },
    repeatableHeader: {
      enabled: true,
      fields: [
        'idPozo' as RepeatableHeaderField,
        'fecha' as RepeatableHeaderField,
        'direccion' as RepeatableHeaderField,
        'barrio' as RepeatableHeaderField,
        'profundidad' as RepeatableHeaderField,
        'tipoCamara' as RepeatableHeaderField,
      ],
      height: 30,
      showSeparator: true,
      style: {
        backgroundColor: '#1F4E79',
        textColor: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
      },
    },
    showPageIndicator: true,
    showSectionTitles: true,
  };
  
  const generator = new PaginatedPDFGenerator(config);
  const result = await generator.generatePaginatedPDF(ficha, pozo, {
    pageNumbers: true,
    includeDate: true,
  });
  
  console.log(`PDF generado con configuración completa: ${result.pageCount} páginas`);
  
  // Mostrar estadísticas
  const service = new PaginationService(config);
  const stats = service.getStats(pozo);
  console.log(`Estadísticas: ${stats.totalPages} páginas totales`);
}

/**
 * Ejemplo 7: Generar múltiples PDFs con diferentes configuraciones
 */
export async function example7_MultiplePDFs(ficha: FichaState, pozo: Pozo) {
  const configs = [
    {
      name: 'Compacto',
      config: {
        limits: {
          maxEntradasPorPagina: 15,
          maxSalidasPorPagina: 3,
          maxSumiderosPorPagina: 8,
          maxFotosPorPagina: 6,
        },
      },
    },
    {
      name: 'Detallado',
      config: {
        limits: {
          maxEntradasPorPagina: 5,
          maxSalidasPorPagina: 1,
          maxSumiderosPorPagina: 3,
          maxFotosPorPagina: 2,
        },
      },
    },
  ];
  
  for (const { name, config } of configs) {
    const generator = new PaginatedPDFGenerator(config);
    const result = await generator.generatePaginatedPDF(ficha, pozo);
    console.log(`PDF ${name}: ${result.pageCount} páginas`);
  }
}

/**
 * Ejemplo 8: Usar con React/Vue para mostrar vista previa
 */
export async function example8_PreviewIntegration(ficha: FichaState, pozo: Pozo) {
  const service = new PaginationService();
  const stats = service.getStats(pozo);
  
  // Mostrar información en UI
  const previewData = {
    totalPages: stats.totalPages,
    summary: {
      entradas: `${stats.totalEntradas} en ${stats.entradasPages} página(s)`,
      salidas: `${stats.totalSalidas} en ${stats.salidasPages} página(s)`,
      sumideros: `${stats.totalSumideros} en ${stats.sumiderosPages} página(s)`,
      fotos: `${stats.totalFotos} en ${stats.fotosPages} página(s)`,
    },
  };
  
  return previewData;
}
