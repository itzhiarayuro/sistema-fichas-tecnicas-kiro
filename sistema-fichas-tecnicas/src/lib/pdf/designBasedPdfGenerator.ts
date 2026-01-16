/**
 * Design-Based PDF Generator - Genera PDFs basado en diseños del diseñador
 * Si no hay diseño, usa un formato genérico que incluye fotos
 */

import type { Pozo, FotoInfo } from '@/types/pozo';
import { calcularFormatoDinamico } from './dynamicFormatCalculator';
import { debugLogger } from './debugLogger';

/**
 * Genera sección de fotos para el PDF
 * OPTIMIZACIÓN: Comprimir fotos antes de incluirlas
 */
function buildPhotosSection(fotos: FotoInfo[], maxFotosPorPagina: number = 2): unknown[] {
  if (!fotos || fotos.length === 0) {
    return [];
  }

  const content: unknown[] = [
    { text: 'FOTOGRAFÍAS', style: 'sectionTitle', margin: [0, 0, 0, 8] },
  ];

  // Agrupar fotos por página (máximo 2 por página para mejor visualización)
  for (let i = 0; i < fotos.length; i += maxFotosPorPagina) {
    const batch = fotos.slice(i, i + maxFotosPorPagina);
    
    const fotoRow: unknown[] = [];
    batch.forEach((foto) => {
      if (foto.dataUrl) {
        // Usar tamaño más pequeño para reducir procesamiento
        // Ancho: 250px (A4 es ~595px, con márgenes ~570px, 2 fotos = 250px cada una)
        fotoRow.push({
          image: foto.dataUrl,
          width: 250,
          height: 187,
          margin: [5, 5, 5, 5],
        });
      }
    });

    if (fotoRow.length > 0) {
      content.push({
        table: {
          widths: batch.map(() => '*'),
          body: [fotoRow],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 8],
      });
      
      // Agregar salto de página después de cada grupo de fotos
      if (i + maxFotosPorPagina < fotos.length) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }
  }

  return content;
}

/**
 * Obtiene todas las fotos de un pozo
 */
function getAllPhotos(pozo: Pozo): FotoInfo[] {
  const fotos: FotoInfo[] = [];

  if (pozo.fotos?.principal) fotos.push(...pozo.fotos.principal);
  if (pozo.fotos?.entradas) fotos.push(...pozo.fotos.entradas);
  if (pozo.fotos?.salidas) fotos.push(...pozo.fotos.salidas);
  if (pozo.fotos?.sumideros) fotos.push(...pozo.fotos.sumideros);
  if (pozo.fotos?.otras) fotos.push(...pozo.fotos.otras);

  return fotos;
}

/**
 * Genera PDF basado en formato genérico
 */
export function generatePdfContent(
  pozo: Pozo,
  includePhotos: boolean = true
): unknown[] {
  const content: unknown[] = [];

  debugLogger.info('DesignBasedPdfGenerator', 'Generating PDF content', {
    pozoId: pozo.idPozo,
    includePhotos,
  });

  // Usar formato genérico
  content.push({
    table: {
      widths: ['*'],
      body: [
        [{ text: 'FICHA TÉCNICA DE POZO DE INSPECCIÓN', style: 'header', fillColor: '#1F4E79', margin: [0, 8, 0, 8] }],
        [{ text: `Pozo: ${pozo.idPozo}`, fontSize: 12, bold: true, alignment: 'center', margin: [0, 4, 0, 4] }],
      ],
    },
    layout: 'noBorders',
  });

  content.push({ text: '', margin: [0, 8] });

  // Secciones de datos
  content.push({
    stack: [
      { text: 'IDENTIFICACIÓN', style: 'sectionTitle', margin: [0, 0, 0, 8] },
      {
        table: {
          widths: ['40%', '60%'],
          body: [
            [{ text: 'ID Pozo', style: 'label' }, { text: pozo.idPozo || '-', style: 'value' }],
            [{ text: 'Coordenada X', style: 'label' }, { text: pozo.coordenadaX || '-', style: 'value' }],
            [{ text: 'Coordenada Y', style: 'label' }, { text: pozo.coordenadaY || '-', style: 'value' }],
            [{ text: 'Fecha', style: 'label' }, { text: pozo.fecha || '-', style: 'value' }],
          ],
        },
        layout: 'noBorders',
      },
    ],
  });

  content.push({ text: '', margin: [0, 8] });

  // Fotos
  if (includePhotos) {
    const fotos = getAllPhotos(pozo);
    if (fotos.length > 0) {
      debugLogger.info('DesignBasedPdfGenerator', 'Adding photos section', {
        photoCount: fotos.length,
      });
      content.push(...buildPhotosSection(fotos));
      content.push({ text: '', margin: [0, 8] });
    }
  }

  return content;
}

/**
 * Recomienda el mejor formato para un pozo
 */
export function recommendFormatForPozo(pozo: Pozo): string {
  const resultado = calcularFormatoDinamico(pozo);
  
  debugLogger.info('DesignBasedPdfGenerator', 'Format recommendation', {
    pozoId: pozo.idPozo,
    formatoRecomendado: resultado.formatoUsado.nombre,
    fotosValidas: resultado.fotosValidas.length,
    paginas: resultado.paginas,
  });

  return resultado.formatoUsado.id;
}

/**
 * Valida si el pozo puede generar PDF con fotos
 */
export function validatePozoForPhotoGeneration(pozo: Pozo): {
  canGenerate: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const fotos = getAllPhotos(pozo);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (fotos.length === 0) {
    warnings.push('No hay fotos para incluir en el PDF');
    recommendations.push('Cargue fotos antes de generar el PDF');
  }

  if (fotos.length > 50) {
    warnings.push(`Muchas fotos (${fotos.length}). El PDF puede ser muy grande.`);
    recommendations.push('Considere generar múltiples PDFs o reducir la cantidad de fotos');
  }

  // Calcular tamaño total
  let totalSizeMB = 0;
  fotos.forEach(foto => {
    if (foto.dataUrl) {
      const base64Part = foto.dataUrl.split(',')[1] || '';
      totalSizeMB += (base64Part.length * 3) / 4 / 1024 / 1024;
    }
  });

  if (totalSizeMB > 100) {
    warnings.push(`Tamaño total de fotos muy grande (${totalSizeMB.toFixed(2)}MB)`);
    recommendations.push('Reduzca la calidad de las imágenes');
  }

  return {
    canGenerate: warnings.length === 0,
    warnings,
    recommendations,
  };
}
