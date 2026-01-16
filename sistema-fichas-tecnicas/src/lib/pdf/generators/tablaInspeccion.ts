/**
 * tablaInspeccion.ts - Generador de PDF para tablas de inspección
 * 
 * Demuestra:
 * - Tablas con múltiples columnas
 * - Números tabulares alineados
 * - UTF-8 completo en headers y celdas
 * - Concurrencia segura
 */

'use client';

import { getPdfMake } from '../pdfMakeInit';
import { pdfStyles, defaultDocumentConfig } from '../fonts/fontConfig';

export interface FilaInspeccion {
  id: string;
  ubicacion: string;      // UTF-8: "Cañuela", "Ñuñoa"
  diametro: number;       // Números tabulares
  profundidad: number;
  estado: string;         // UTF-8: "Óptimo", "Crítico"
  observacion?: string;   // UTF-8: tildes, ñ
}

export interface DatosTablaInspeccion {
  titulo: string;
  fecha: string;
  inspector: string;      // UTF-8: "José Muñoz"
  filas: FilaInspeccion[];
  resumen?: {
    total: number;
    optimos: number;
    regulares: number;
    criticos: number;
  };
}

export interface ResultadoPDF {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
}

/**
 * Genera PDF con tabla de inspección
 * Seguro para llamadas concurrentes
 */
export async function generateTablaInspeccion(
  data: DatosTablaInspeccion
): Promise<ResultadoPDF> {
  try {
    const pdfMake = await getPdfMake();
    
    // Construir filas de la tabla
    const tableBody: any[][] = [
      // Header con UTF-8
      [
        { text: 'ID', style: 'tableHeader' },
        { text: 'Ubicación', style: 'tableHeader' },        // UTF-8: tilde
        { text: 'Diámetro (cm)', style: 'tableHeader' },    // UTF-8: tilde
        { text: 'Prof. (m)', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' },
        { text: 'Observación', style: 'tableHeader' },      // UTF-8: tilde
      ],
    ];

    // Agregar filas de datos
    data.filas.forEach((fila) => {
      tableBody.push([
        { text: fila.id, style: 'tableCell' },
        { text: fila.ubicacion, style: 'tableCell' },
        { text: fila.diametro.toFixed(1), style: 'tableCellNumber' },  // Número tabular
        { text: fila.profundidad.toFixed(2), style: 'tableCellNumber' },
        { 
          text: fila.estado, 
          style: 'tableCell',
          fillColor: getEstadoColor(fila.estado),
        },
        { text: fila.observacion || '-', style: 'tableCell', fontSize: 8 },
      ]);
    });

    const docDefinition = {
      ...defaultDocumentConfig,
      pageOrientation: 'landscape',  // Mejor para tablas anchas
      info: {
        title: `Tabla Inspección - ${data.titulo}`,
        author: data.inspector,
        subject: 'Inspección de Pozos',
      },
      styles: pdfStyles,
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'TABLA DE INSPECCIÓN',
              style: 'header',
              width: '*',
              alignment: 'left',
              color: '#1F4E79',
            },
            {
              text: data.fecha,
              style: 'subheader',
              width: 'auto',
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          text: data.titulo,
          style: 'subheader',
          margin: [0, 0, 0, 3],
        },
        {
          text: `Inspector: ${data.inspector}`,  // UTF-8 en nombre
          style: 'body',
          margin: [0, 0, 0, 15],
        },

        // Tabla principal
        {
          table: {
            headerRows: 1,
            widths: ['10%', '20%', '12%', '10%', '13%', '*'],
            body: tableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: (i: number) => i === 1 ? '#1F4E79' : '#CCCCCC',
            vLineColor: () => '#CCCCCC',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        } as any,

        // Resumen (si existe)
        ...(data.resumen ? [
          {
            text: '',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'RESUMEN DE INSPECCIÓN',
            style: 'sectionTitle',
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: '25%',
                stack: [
                  { text: 'Total Pozos', style: 'label' },
                  { text: data.resumen.total.toString(), style: 'value', fontSize: 18, bold: true },
                ],
                alignment: 'center',
              },
              {
                width: '25%',
                stack: [
                  { text: 'Óptimos', style: 'label' },  // UTF-8: tilde
                  { text: data.resumen.optimos.toString(), style: 'value', fontSize: 18, bold: true, color: '#28A745' },
                ],
                alignment: 'center',
              },
              {
                width: '25%',
                stack: [
                  { text: 'Regulares', style: 'label' },
                  { text: data.resumen.regulares.toString(), style: 'value', fontSize: 18, bold: true, color: '#FFC107' },
                ],
                alignment: 'center',
              },
              {
                width: '25%',
                stack: [
                  { text: 'Críticos', style: 'label' },  // UTF-8: tilde
                  { text: data.resumen.criticos.toString(), style: 'value', fontSize: 18, bold: true, color: '#DC3545' },
                ],
                alignment: 'center',
              },
            ],
          },
        ] : []),

        // Leyenda de colores
        {
          text: '',
          margin: [0, 20, 0, 0],
        },
        {
          columns: [
            { canvas: [{ type: 'rect', x: 0, y: 0, w: 10, h: 10, color: '#D4EDDA' }] },
            { text: ' Óptimo', style: 'small', margin: [2, 0, 15, 0] },
            { canvas: [{ type: 'rect', x: 0, y: 0, w: 10, h: 10, color: '#FFF3CD' }] },
            { text: ' Regular', style: 'small', margin: [2, 0, 15, 0] },
            { canvas: [{ type: 'rect', x: 0, y: 0, w: 10, h: 10, color: '#F8D7DA' }] },
            { text: ' Crítico', style: 'small', margin: [2, 0, 0, 0] },
          ],
          width: 'auto',
        },
      ],
      
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: `Inspección: ${data.titulo}`, style: 'footer', alignment: 'left', margin: [20, 0, 0, 0] },
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
          filename: `inspeccion_${data.titulo.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
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

/**
 * Obtiene color de fondo según estado
 */
function getEstadoColor(estado: string): string | undefined {
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes('óptimo') || estadoLower.includes('optimo') || estadoLower.includes('bueno')) {
    return '#D4EDDA';  // Verde claro
  }
  if (estadoLower.includes('regular') || estadoLower.includes('medio')) {
    return '#FFF3CD';  // Amarillo claro
  }
  if (estadoLower.includes('crítico') || estadoLower.includes('critico') || estadoLower.includes('malo')) {
    return '#F8D7DA';  // Rojo claro
  }
  return undefined;
}

export default generateTablaInspeccion;
