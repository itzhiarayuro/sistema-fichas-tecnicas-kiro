/**
 * PDFMakeGenerator - Generación de PDFs con pdfmake
 * Requirements: 7.1, 7.2, 5.1-5.5
 * 
 * Migración de jsPDF a pdfmake con mejoras:
 * - Cero espacios en selección de texto
 * - Soporte UTF-8 nativo para tildes y ñ
 * - Layout profesional con tablas
 * - Mejor rendimiento
 * 
 * Incluye todos los 33 campos del diccionario de datos
 */

import type { TDocumentDefinition, ContentTable } from 'pdfmake/interfaces';
import type { FichaState, FichaCustomization } from '@/types/ficha';
import type { Pozo, FotoInfo } from '@/types/pozo';

// No importar pdfmake aquí - se importará dinámicamente en generatePDF

// Configuración de estilos
const STYLES = {
  header: {
    fontSize: 16,
    bold: true,
    color: '#FFFFFF',
    alignment: 'center' as const,
  },
  sectionTitle: {
    fontSize: 12,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    margin: [0, 8, 0, 4],
  },
  label: {
    fontSize: 9,
    bold: true,
    color: '#666666',
  },
  value: {
    fontSize: 10,
    color: '#000000',
  },
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    alignment: 'center' as const,
  },
  tableCell: {
    fontSize: 9,
    color: '#000000',
  },
};

export interface PDFGeneratorOptions {
  watermark?: string;
  pageNumbers?: boolean;
  includeDate?: boolean;
  imageQuality?: number;
}

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
  pageCount?: number;
}

/**
 * Extraer valor de FieldValue
 */
function getFieldValue(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (field.value) return field.value;
  return '';
}

/**
 * Crear fila de tabla con etiqueta y valor
 */
function createFieldRow(label: string, value: string): any[] {
  return [
    { text: label, style: 'label', width: '40%' },
    { text: value || '-', style: 'value', width: '60%' },
  ];
}

/**
 * Crear tabla de dos columnas
 */
function createTwoColumnTable(rows: any[][]): ContentTable {
  return {
    table: {
      widths: ['50%', '50%'],
      body: rows,
    },
    layout: 'noBorders',
  };
}

export class PDFMakeGenerator {
  private defaultCustomization: FichaCustomization = {
    colors: {
      headerBg: '#1F4E79',
      headerText: '#FFFFFF',
      sectionBg: '#F5F5F5',
      sectionText: '#333333',
      labelText: '#666666',
      valueText: '#000000',
      borderColor: '#CCCCCC',
    },
    fonts: {
      titleSize: 14,
      labelSize: 9,
      valueSize: 10,
      fontFamily: 'Helvetica',
    },
    spacing: {
      sectionGap: 8,
      fieldGap: 4,
      padding: 5,
      margin: 15,
    },
    template: 'default',
    isGlobal: false,
  };

  /**
   * Generar PDF con pdfmake
   */
  async generatePDF(
    ficha: FichaState,
    pozo: Pozo,
    options: PDFGeneratorOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      // Importar pdfmake dinámicamente
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfMake = pdfMakeModule.default;
      
      // Cargar las fuentes correctamente
      try {
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
        
        // Intentar diferentes estructuras de importación
        if (pdfFontsModule?.default) {
          // Estructura más común: el vfs está directamente en default
          pdfMake.vfs = pdfFontsModule.default;
        } else if (pdfFontsModule?.pdfMake?.vfs) {
          // Estructura alternativa: pdfMake.vfs
          pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
        } else if (pdfFontsModule?.vfs) {
          // Estructura directa: vfs en el módulo
          pdfMake.vfs = pdfFontsModule.vfs;
        } else {
          console.warn('Estructura de fuentes no reconocida:', Object.keys(pdfFontsModule));
        }
      } catch (e) {
        console.warn('No se pudieron cargar las fuentes de pdfmake:', e);
        // Usar fuentes básicas si no se pueden cargar las personalizadas
      }
      
      const customization = this.mergeCustomization(ficha.customizations);
      
      // Construir documento
      const docDefinition: TDocumentDefinition = {
        pageSize: 'A4',
        pageMargins: [12, 12, 12, 12],
        defaultStyle: {
          font: 'Helvetica', // Fuente básica que siempre está disponible
          fontSize: 10,
        },
        styles: {
          header: STYLES.header,
          sectionTitle: STYLES.sectionTitle,
          label: STYLES.label,
          value: STYLES.value,
          tableHeader: STYLES.tableHeader,
          tableCell: STYLES.tableCell,
        },
        content: await this.buildContent(ficha, pozo, customization, options),
        footer: options.pageNumbers ? this.buildFooter() : undefined,
      };

      // Verificar que pdfMake esté correctamente configurado
      if (!pdfMake.vfs) {
        console.warn('pdfMake.vfs no está disponible, usando configuración básica');
      }

      // Generar PDF
      return new Promise((resolve) => {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          const pozoId = getFieldValue(pozo.identificacion?.idPozo) || 'ficha';
          resolve({
            success: true,
            blob,
            filename: `ficha_${pozoId}_${Date.now()}.pdf`,
            pageCount: 1,
          });
        });
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Construir contenido del PDF
   */
  private async buildContent(
    ficha: FichaState,
    pozo: Pozo,
    customization: FichaCustomization,
    options: PDFGeneratorOptions
  ): Promise<any[]> {
    const content: any[] = [];

    // Encabezado
    content.push(this.buildHeader(pozo));
    content.push({ text: '', margin: [0, 8] });

    // Identificación
    content.push(this.buildIdentificacionSection(pozo));
    content.push({ text: '', margin: [0, 8] });

    // Ubicación
    content.push(this.buildUbicacionSection(pozo));
    content.push({ text: '', margin: [0, 8] });

    // Estructura
    content.push(this.buildEstructuraSection(pozo));
    content.push({ text: '', margin: [0, 8] });

    // Tuberías
    if (pozo.tuberias && pozo.tuberias.length > 0) {
      content.push(this.buildTuberiasSection(pozo));
      content.push({ text: '', margin: [0, 8] });
    }

    // Sumideros
    if (pozo.sumideros && pozo.sumideros.length > 0) {
      content.push(this.buildSumiderosSection(pozo));
      content.push({ text: '', margin: [0, 8] });
    }

    // Fotos
    if (pozo.fotos && this.hasFotos(pozo.fotos)) {
      content.push(await this.buildFotosSection(pozo));
      content.push({ text: '', margin: [0, 8] });
    }

    // Observaciones
    if (pozo.observaciones) {
      content.push(this.buildObservacionesSection(pozo));
    }

    return content;
  }

  /**
   * Construir encabezado
   */
  private buildHeader(pozo: Pozo): any {
    const pozoId = getFieldValue(pozo.identificacion?.idPozo);
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'FICHA TÉCNICA DE POZO DE INSPECCIÓN',
              style: 'header',
              fillColor: '#1F4E79',
              padding: [10, 0],
            },
          ],
          [
            {
              text: `Pozo: ${pozoId}`,
              fontSize: 12,
              bold: true,
              padding: [8, 0],
            },
          ],
        ],
      },
      layout: 'noBorders',
    };
  }

  /**
   * Construir sección de identificación
   */
  private buildIdentificacionSection(pozo: Pozo): any {
    const ident = pozo.identificacion;
    if (!ident) return { text: '' };

    return {
      stack: [
        { text: 'IDENTIFICACIÓN', style: 'sectionTitle' },
        createTwoColumnTable([
          createFieldRow('ID Pozo', getFieldValue(ident.idPozo)),
          createFieldRow('Coordenada X', getFieldValue(ident.coordenadaX)),
          createFieldRow('Coordenada Y', getFieldValue(ident.coordenadaY)),
          createFieldRow('Fecha', getFieldValue(ident.fecha)),
          createFieldRow('Levantó', getFieldValue(ident.levanto)),
          createFieldRow('Estado', getFieldValue(ident.estado)),
        ]),
      ],
    };
  }

  /**
   * Construir sección de ubicación
   */
  private buildUbicacionSection(pozo: Pozo): any {
    const ubic = pozo.ubicacion;
    if (!ubic) return { text: '' };

    return {
      stack: [
        { text: 'UBICACIÓN', style: 'sectionTitle' },
        createTwoColumnTable([
          createFieldRow('Dirección', getFieldValue(ubic.direccion)),
          createFieldRow('Barrio', getFieldValue(ubic.barrio)),
          createFieldRow('Elevación', getFieldValue(ubic.elevacion)),
          createFieldRow('Profundidad', getFieldValue(ubic.profundidad)),
        ]),
      ],
    };
  }

  /**
   * Construir sección de estructura
   */
  private buildEstructuraSection(pozo: Pozo): any {
    const est = pozo.estructura;
    if (!est) return { text: '' };

    return {
      stack: [
        { text: 'ESTRUCTURA', style: 'sectionTitle' },
        createTwoColumnTable([
          createFieldRow('Tapa', getFieldValue(est.tapa)),
          createFieldRow('Cilindro', getFieldValue(est.cilindro)),
          createFieldRow('Cono', getFieldValue(est.cono)),
          createFieldRow('Peldaños', getFieldValue(est.peldanos)),
          createFieldRow('Material Cilindro', getFieldValue(est.materialCilindro)),
          createFieldRow('Material Cono', getFieldValue(est.materialCono)),
          createFieldRow('Diámetro Cilindro', getFieldValue(est.diametroCilindro)),
          createFieldRow('Diámetro Cono', getFieldValue(est.diametroCono)),
          createFieldRow('Profundidad Cilindro', getFieldValue(est.profundidadCilindro)),
          createFieldRow('Profundidad Cono', getFieldValue(est.profundidadCono)),
          createFieldRow('Estado Tapa', getFieldValue(est.estadoTapa)),
          createFieldRow('Estado Cilindro', getFieldValue(est.estadoCilindro)),
          createFieldRow('Estado Cono', getFieldValue(est.estadoCono)),
          createFieldRow('Estado Peldaños', getFieldValue(est.estadoPeldanos)),
        ]),
      ],
    };
  }

  /**
   * Construir sección de tuberías
   */
  private buildTuberiasSection(pozo: Pozo): any {
    const tuberias = pozo.tuberias || [];
    const entradas = tuberias.filter((t: any) => getFieldValue(t.tipoTuberia) === 'entrada');
    const salidas = tuberias.filter((t: any) => getFieldValue(t.tipoTuberia) === 'salida');

    const content: any[] = [{ text: 'TUBERÍAS', style: 'sectionTitle' }];

    if (entradas.length > 0) {
      content.push({ text: 'Entradas:', fontSize: 10, bold: true, margin: [0, 4, 0, 2] });
      content.push(this.buildTuberiasTable(entradas));
      content.push({ text: '', margin: [0, 4] });
    }

    if (salidas.length > 0) {
      content.push({ text: 'Salidas:', fontSize: 10, bold: true, margin: [0, 4, 0, 2] });
      content.push(this.buildTuberiasTable(salidas));
    }

    return { stack: content };
  }

  /**
   * Construir tabla de tuberías
   */
  private buildTuberiasTable(tuberias: any[]): ContentTable {
    const rows = [
      [
        { text: 'Diámetro', style: 'tableHeader' },
        { text: 'Material', style: 'tableHeader' },
        { text: 'Elevación', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' },
        { text: 'Longitud', style: 'tableHeader' },
      ],
    ];

    tuberias.forEach((t: any) => {
      rows.push([
        { text: getFieldValue(t.diametro), style: 'tableCell' },
        { text: getFieldValue(t.material), style: 'tableCell' },
        { text: getFieldValue(t.elevacion), style: 'tableCell' },
        { text: getFieldValue(t.estado), style: 'tableCell' },
        { text: getFieldValue(t.longitud), style: 'tableCell' },
      ]);
    });

    return {
      table: {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        body: rows,
      },
      layout: 'lightHorizontalLines',
    };
  }

  /**
   * Construir sección de sumideros
   */
  private buildSumiderosSection(pozo: Pozo): any {
    const sumideros = pozo.sumideros || [];

    return {
      stack: [
        { text: 'SUMIDEROS', style: 'sectionTitle' },
        this.buildSumiderosTable(sumideros),
      ],
    };
  }

  /**
   * Construir tabla de sumideros
   */
  private buildSumiderosTable(sumideros: any[]): ContentTable {
    const rows = [
      [
        { text: 'ID', style: 'tableHeader' },
        { text: 'Tipo', style: 'tableHeader' },
        { text: 'Material', style: 'tableHeader' },
        { text: 'Diámetro', style: 'tableHeader' },
        { text: 'Profundidad', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' },
      ],
    ];

    sumideros.forEach((s: any) => {
      rows.push([
        { text: getFieldValue(s.idSumidero), style: 'tableCell' },
        { text: getFieldValue(s.tipo), style: 'tableCell' },
        { text: getFieldValue(s.material), style: 'tableCell' },
        { text: getFieldValue(s.diametro), style: 'tableCell' },
        { text: getFieldValue(s.profundidad), style: 'tableCell' },
        { text: getFieldValue(s.estado), style: 'tableCell' },
      ]);
    });

    return {
      table: {
        widths: ['16.66%', '16.66%', '16.66%', '16.66%', '16.66%', '16.66%'],
        body: rows,
      },
      layout: 'lightHorizontalLines',
    };
  }

  /**
   * Construir sección de fotos
   */
  private async buildFotosSection(pozo: Pozo): Promise<any> {
    const fotos: any[] = [];

    // Recolectar todas las fotos
    if (pozo.fotos?.principal) fotos.push(...pozo.fotos.principal);
    if (pozo.fotos?.entradas) fotos.push(...pozo.fotos.entradas);
    if (pozo.fotos?.salidas) fotos.push(...pozo.fotos.salidas);
    if (pozo.fotos?.sumideros) fotos.push(...pozo.fotos.sumideros);
    if (pozo.fotos?.otras) fotos.push(...pozo.fotos.otras);

    if (fotos.length === 0) return { text: '' };

    const fotoRows: any[] = [];
    for (let i = 0; i < fotos.length; i += 2) {
      const foto1 = fotos[i];
      const foto2 = fotos[i + 1];

      const row: any[] = [];

      if (foto1) {
        row.push(await this.buildFotoCell(foto1));
      }
      if (foto2) {
        row.push(await this.buildFotoCell(foto2));
      }

      fotoRows.push(row);
    }

    return {
      stack: [
        { text: 'FOTOS', style: 'sectionTitle' },
        {
          table: {
            widths: ['50%', '50%'],
            body: fotoRows,
          },
          layout: 'noBorders',
        },
      ],
    };
  }

  /**
   * Construir celda de foto
   */
  private async buildFotoCell(foto: any): Promise<any> {
    const descripcion = getFieldValue(foto.descripcion);
    const base64 = foto.base64 || '';

    return {
      stack: [
        base64
          ? {
              image: base64,
              width: 150,
              height: 120,
              margin: [0, 0, 0, 4],
            }
          : { text: '[Foto no disponible]', fontSize: 9, color: '#999999' },
        {
          text: descripcion || 'Sin descripción',
          fontSize: 8,
          color: '#666666',
          alignment: 'center' as const,
        },
      ],
      margin: [4, 4],
    };
  }

  /**
   * Construir sección de observaciones
   */
  private buildObservacionesSection(pozo: Pozo): any {
    const obs = getFieldValue(pozo.observaciones);
    if (!obs) return { text: '' };

    return {
      stack: [
        { text: 'OBSERVACIONES', style: 'sectionTitle' },
        {
          text: obs,
          style: 'value',
          margin: [8, 4],
          alignment: 'justify' as const,
        },
      ],
    };
  }

  /**
   * Construir pie de página
   */
  private buildFooter(): any {
    return (currentPage: number, pageCount: number) => {
      return {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center' as const,
        fontSize: 9,
        color: '#999999',
        margin: [0, 10, 0, 0],
      };
    };
  }

  /**
   * Verificar si hay fotos
   */
  private hasFotos(fotos: any): boolean {
    return (
      (fotos.principal && fotos.principal.length > 0) ||
      (fotos.entradas && fotos.entradas.length > 0) ||
      (fotos.salidas && fotos.salidas.length > 0) ||
      (fotos.sumideros && fotos.sumideros.length > 0) ||
      (fotos.otras && fotos.otras.length > 0)
    );
  }

  /**
   * Fusionar customizaciones
   */
  private mergeCustomization(customizations: any): FichaCustomization {
    // Validar que customizations sea un array
    if (!Array.isArray(customizations)) {
      console.warn('customizations no es un array:', typeof customizations);
      return this.defaultCustomization;
    }

    if (customizations.length === 0) {
      return this.defaultCustomization;
    }

    const global = customizations.find((c: any) => c && c.isGlobal);
    return global || this.defaultCustomization;
  }
}
