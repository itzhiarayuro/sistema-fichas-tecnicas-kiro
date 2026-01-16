/**
 * formularioLevantamiento.ts - Generador de PDF para formularios de levantamiento
 * 
 * Demuestra:
 * - UTF-8 completo (tildes, ñ, símbolos)
 * - Tablas con números tabulares
 * - Concurrencia segura via Promise Caching
 */

'use client';

import { getPdfMake } from '../pdfMakeInit';
import { pdfStyles, defaultDocumentConfig, DEFAULT_FONT } from '../fonts/fontConfig';

export interface DatosLevantamiento {
  // Identificación
  idPozo: string;
  fecha: string;
  levanto: string;  // UTF-8: "José García Ñuñez"
  
  // Ubicación
  direccion: string;  // UTF-8: "Cañuela #123, Ñuñoa"
  barrio: string;
  coordenadaX: string;
  coordenadaY: string;
  elevacion: string;
  
  // Estructura
  profundidad: string;
  diametro: string;  // UTF-8: "Diámetro"
  materialCilindro: string;
  estadoTapa: string;
  peldanos: string;  // UTF-8: "Peldaños"
  
  // Observaciones
  observaciones?: string;
}

export interface ResultadoPDF {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
}

/**
 * Genera PDF de formulario de levantamiento
 * Seguro para llamadas concurrentes
 */
export async function generateFormularioLevantamiento(
  data: DatosLevantamiento
): Promise<ResultadoPDF> {
  try {
    const pdfMake = await getPdfMake();
    
    const docDefinition = {
      ...defaultDocumentConfig,
      info: {
        title: `Formulario Levantamiento - ${data.idPozo}`,
        author: data.levanto,
        subject: 'Levantamiento de Pozo de Inspección',
      },
      styles: pdfStyles,
      content: [
        // Encabezado principal
        {
          table: {
            widths: ['*'],
            body: [[
              {
                text: 'FORMULARIO DE LEVANTAMIENTO',
                style: 'header',
                fillColor: '#1F4E79',
                margin: [0, 8, 0, 8],
              }
            ]]
          },
          layout: 'noBorders',
        },
        {
          text: `Pozo: ${data.idPozo}`,
          style: 'subheader',
          margin: [0, 10, 0, 15],
          alignment: 'center',
        },

        // Sección: Identificación
        {
          text: ' IDENTIFICACIÓN',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'ID Pozo:', style: 'label' },
                { text: data.idPozo, style: 'value' },
              ],
              [
                { text: 'Fecha:', style: 'label' },
                { text: data.fecha, style: 'value' },
              ],
              [
                { text: 'Levantó:', style: 'label' },  // UTF-8: tilde en "ó"
                { text: data.levanto, style: 'value' },  // UTF-8: puede contener "ñ"
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // Sección: Ubicación
        {
          text: ' UBICACIÓN',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Dirección:', style: 'label' },  // UTF-8: tilde
                { text: data.direccion, style: 'value' },  // UTF-8: puede contener "ñ", tildes
              ],
              [
                { text: 'Barrio:', style: 'label' },
                { text: data.barrio, style: 'value' },
              ],
              [
                { text: 'Coordenada X:', style: 'label' },
                { text: data.coordenadaX, style: 'value' },
              ],
              [
                { text: 'Coordenada Y:', style: 'label' },
                { text: data.coordenadaY, style: 'value' },
              ],
              [
                { text: 'Elevación:', style: 'label' },  // UTF-8: tilde
                { text: `${data.elevacion} m.s.n.m.`, style: 'value' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // Sección: Estructura
        {
          text: ' ESTRUCTURA',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Profundidad:', style: 'label' },
                { text: `${data.profundidad} m`, style: 'value' },
              ],
              [
                { text: 'Diámetro:', style: 'label' },  // UTF-8: tilde en "á"
                { text: `${data.diametro} cm`, style: 'value' },
              ],
              [
                { text: 'Material Cilindro:', style: 'label' },
                { text: data.materialCilindro, style: 'value' },
              ],
              [
                { text: 'Estado Tapa:', style: 'label' },
                { text: data.estadoTapa, style: 'value' },
              ],
              [
                { text: 'Peldaños:', style: 'label' },  // UTF-8: "ñ"
                { text: data.peldanos, style: 'value' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // Sección: Observaciones (si existe)
        ...(data.observaciones ? [
          {
            text: ' OBSERVACIONES',
            style: 'sectionTitle',
            margin: [0, 0, 0, 8],
          },
          {
            text: data.observaciones,
            style: 'body',
            margin: [5, 5, 5, 5],
            alignment: 'justify' as const,
          },
        ] : []),
      ],
      
      // Pie de página
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: `Generado: ${new Date().toLocaleDateString('es-ES')}`, style: 'footer', alignment: 'left', margin: [20, 0, 0, 0] },
          { text: `Página ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right', margin: [0, 0, 20, 0] },
        ],
        margin: [0, 10, 0, 0],
      }),
    };

    return new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
        resolve({
          success: true,
          blob,
          filename: `levantamiento_${data.idPozo}_${Date.now()}.pdf`,
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export default generateFormularioLevantamiento;
