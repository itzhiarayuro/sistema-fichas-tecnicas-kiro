/**
 * Generador de PDF con Paginación Automática
 * Requirements: 7.1, 7.2
 * 
 * Genera PDFs con:
 * - Paginación automática para tuberías, sumideros y fotos
 * - Encabezados reimprimibles configurables
 * - Límites personalizables por página
 */

import { jsPDF } from 'jspdf';
import type { FichaState } from '@/types/ficha';
import type { Pozo, TuberiaInfo, SumideroInfo, FotoInfo } from '@/types/pozo';
import type { PaginationConfig, PaginatedContent, RepeatableHeaderField } from '@/types/paginationConfig';
import { PaginationService } from './paginationService';

const PDF_CONFIG = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 12,
  headerHeight: 25,
  sectionTitleHeight: 8,
  lineHeight: 5.5,
  imageQuality: 0.85,
  maxImageWidth: 50,
  maxImageHeight: 35,
  footerHeight: 10,
};

interface RenderContext {
  doc: jsPDF;
  currentY: number;
  pageNumber: number;
  totalPages: number;
  paginationService: PaginationService;
  paginationConfig: PaginationConfig;
}

export class PaginatedPDFGenerator {
  private paginationService: PaginationService;

  constructor(paginationConfig?: Partial<PaginationConfig>) {
    this.paginationService = new PaginationService(paginationConfig);
  }

  /**
   * Genera PDF con paginación automática
   */
  async generatePaginatedPDF(
    ficha: FichaState,
    pozo: any,
    options?: {
      watermark?: string;
      pageNumbers?: boolean;
      includeDate?: boolean;
    }
  ): Promise<{ blob: Blob; filename: string; pageCount: number }> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Paginar contenido
    const paginationResult = this.paginationService.paginatePozo(pozo);
    const totalPages = paginationResult.totalPages;

    const ctx: RenderContext = {
      doc,
      currentY: PDF_CONFIG.margin,
      pageNumber: 1,
      totalPages,
      paginationService: this.paginationService,
      paginationConfig: this.paginationService.getConfig(),
    };

    // Renderizar primera página con información general
    this.renderFirstPage(ctx, pozo);

    // Renderizar páginas de contenido paginado
    for (const page of paginationResult.pages) {
      doc.addPage();
      ctx.pageNumber++;
      ctx.currentY = PDF_CONFIG.margin;

      // Renderizar encabezado reimprimible
      if (ctx.paginationConfig.repeatableHeader.enabled) {
        this.renderRepeatableHeader(ctx, pozo);
      }

      // Renderizar contenido de la página
      await this.renderPaginatedContent(ctx, page, pozo);
    }

    // Renderizar pie de página
    if (options?.pageNumbers || options?.includeDate) {
      this.renderFooters(ctx, options);
    }

    const blob = doc.output('blob');
    
    // FIX: Problema #3 - Extraer pozoId de forma robusta
    let pozoIdForFilename = 'ficha';
    if (pozo.identificacion?.idPozo?.value) {
      pozoIdForFilename = pozo.identificacion.idPozo.value;
    } else if (pozo.idPozo?.value) {
      pozoIdForFilename = pozo.idPozo.value;
    } else if (typeof pozo.idPozo === 'string') {
      pozoIdForFilename = pozo.idPozo;
    }
    
    return {
      blob,
      filename: `ficha_${pozoIdForFilename}_${Date.now()}.pdf`,
      pageCount: ctx.pageNumber,
    };
  }

  /**
   * Renderiza la primera página con información general
   */
  private renderFirstPage(ctx: RenderContext, pozo: any): void {
    const { doc } = ctx;

    // Encabezado
    doc.setFillColor(31, 78, 121); // #1F4E79
    doc.rect(0, 0, PDF_CONFIG.pageWidth, PDF_CONFIG.headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA TECNICA DE POZO DE INSPECCION', PDF_CONFIG.pageWidth / 2, 10, {
      align: 'center',
    });
    doc.setFontSize(12);
    
    // FIX: Problema #3 - Soportar múltiples formatos de pozoId (PZ, M, etc.)
    // El pozo puede tener estructura plana (pozo.idPozo) o jerárquica (pozo.identificacion.idPozo)
    let pozoId = '';
    if (pozo.identificacion?.idPozo?.value) {
      pozoId = pozo.identificacion.idPozo.value;
    } else if (pozo.idPozo?.value) {
      pozoId = pozo.idPozo.value;
    } else if (typeof pozo.idPozo === 'string') {
      pozoId = pozo.idPozo;
    } else if (typeof pozo.identificacion?.idPozo === 'string') {
      pozoId = pozo.identificacion.idPozo;
    }
    
    doc.text(`Pozo: ${pozoId}`, PDF_CONFIG.pageWidth / 2, 18, {
      align: 'center',
    });

    ctx.currentY = PDF_CONFIG.headerHeight + 5;

    // Información de identificación
    this.renderSectionTitle(ctx, 'IDENTIFICACION');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const colWidth = (PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2) / 2;
    const leftX = PDF_CONFIG.margin;
    const rightX = PDF_CONFIG.margin + colWidth;

    this.renderField(ctx, 'ID Pozo', this.extractValue(pozo.idPozo || pozo.identificacion?.idPozo), leftX, colWidth);
    this.renderField(
      ctx,
      'Levantó',
      this.extractValue(pozo.levanto || pozo.identificacion?.levanto),
      rightX,
      colWidth
    );
    ctx.currentY += PDF_CONFIG.lineHeight;

    this.renderField(ctx, 'Fecha', this.extractValue(pozo.fecha || pozo.identificacion?.fecha), leftX, colWidth);
    this.renderField(
      ctx,
      'Estado',
      this.extractValue(pozo.estado || pozo.identificacion?.estado),
      rightX,
      colWidth
    );
    ctx.currentY += PDF_CONFIG.lineHeight;

    // Información de ubicación
    this.renderSectionTitle(ctx, 'UBICACION');
    this.renderField(
      ctx,
      'Dirección',
      this.extractValue(pozo.direccion),
      leftX,
      colWidth * 2
    );
    ctx.currentY += PDF_CONFIG.lineHeight;

    this.renderField(ctx, 'Barrio', this.extractValue(pozo.barrio), leftX, colWidth);
    this.renderField(
      ctx,
      'Profundidad (m)',
      this.extractValue(pozo.profundidad),
      rightX,
      colWidth
    );
    ctx.currentY += PDF_CONFIG.lineHeight;

    // Información de componentes
    this.renderSectionTitle(ctx, 'COMPONENTES');
    this.renderField(
      ctx,
      'Tipo Cámara',
      this.extractValue(pozo.tipoCamara),
      leftX,
      colWidth
    );
    this.renderField(
      ctx,
      'Sistema',
      this.extractValue(pozo.sistema),
      rightX,
      colWidth
    );
    ctx.currentY += PDF_CONFIG.lineHeight;

    // Información de paginación
    const stats = this.paginationService.getStats(pozo);
    this.renderSectionTitle(ctx, 'RESUMEN DE CONTENIDO');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    const summaryText = `
Entradas: ${stats.totalEntradas} (${stats.entradasPages} página${stats.entradasPages !== 1 ? 's' : ''})
Salidas: ${stats.totalSalidas} (${stats.salidasPages} página${stats.salidasPages !== 1 ? 's' : ''})
Sumideros: ${stats.totalSumideros} (${stats.sumiderosPages} página${stats.sumiderosPages !== 1 ? 's' : ''})
Fotos: ${stats.totalFotos} (${stats.fotosPages} página${stats.fotosPages !== 1 ? 's' : ''})
Total de páginas: ${stats.totalPages}
    `.trim();

    const lines = summaryText.split('\n');
    for (const line of lines) {
      this.checkPageBreak(ctx, PDF_CONFIG.lineHeight);
      doc.text(line, PDF_CONFIG.margin, ctx.currentY);
      ctx.currentY += PDF_CONFIG.lineHeight;
    }
  }

  /**
   * Renderiza el encabezado reimprimible
   */
  private renderRepeatableHeader(ctx: RenderContext, pozo: Pozo): void {
    const { doc, paginationConfig } = ctx;
    const { repeatableHeader } = paginationConfig;

    if (!repeatableHeader.enabled || repeatableHeader.fields.length === 0) {
      return;
    }

    const style = repeatableHeader.style;
    const startY = ctx.currentY;

    // Fondo del encabezado
    if (style.backgroundColor) {
      doc.setFillColor(
        ...this.hexToRgb(style.backgroundColor || '#F5F5F5')
      );
      doc.rect(
        PDF_CONFIG.margin,
        startY,
        PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2,
        repeatableHeader.height,
        'F'
      );
    }

    // Renderizar campos
    doc.setTextColor(...this.hexToRgb(style.textColor || '#333333'));
    doc.setFontSize(style.fontSize || 9);
    doc.setFont('helvetica', style.fontWeight === 'bold' ? 'bold' : 'normal');

    let fieldY = startY + 5;
    const colWidth = (PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2) / 2;
    const leftX = PDF_CONFIG.margin + 2;
    const rightX = PDF_CONFIG.margin + colWidth + 2;

    let col = 0;
    for (const field of repeatableHeader.fields) {
      const value = this.getFieldValue(pozo, field as RepeatableHeaderField);
      const x = col === 0 ? leftX : rightX;

      doc.text(`${field}: ${value}`, x, fieldY, { maxWidth: colWidth - 4 });

      col = (col + 1) % 2;
      if (col === 0) {
        fieldY += 5;
      }
    }

    // Línea separadora
    if (repeatableHeader.showSeparator) {
      doc.setDrawColor(200, 200, 200);
      doc.line(
        PDF_CONFIG.margin,
        startY + repeatableHeader.height,
        PDF_CONFIG.pageWidth - PDF_CONFIG.margin,
        startY + repeatableHeader.height
      );
    }

    ctx.currentY = startY + repeatableHeader.height + 3;
  }

  /**
   * Renderiza el contenido paginado
   */
  private async renderPaginatedContent(
    ctx: RenderContext,
    page: PaginatedContent,
    pozo: Pozo
  ): Promise<void> {
    const { doc } = ctx;

    // Renderizar entradas
    if (page.tuberias.entradas.length > 0) {
      this.renderSectionTitle(ctx, 'TUBERIAS - ENTRADAS');
      this.renderTuberiaTable(ctx, page.tuberias.entradas);
      ctx.currentY += 5;
    }

    // Renderizar salidas
    if (page.tuberias.salidas.length > 0) {
      this.renderSectionTitle(ctx, 'TUBERIAS - SALIDAS');
      this.renderTuberiaTable(ctx, page.tuberias.salidas);
      ctx.currentY += 5;
    }

    // Renderizar sumideros
    if (page.sumideros.length > 0) {
      this.renderSectionTitle(ctx, 'SUMIDEROS');
      this.renderSumideroTable(ctx, page.sumideros);
      ctx.currentY += 5;
    }

    // Renderizar fotos
    if (page.fotos.length > 0) {
      this.renderSectionTitle(ctx, 'FOTOGRAFIAS');
      await this.renderPhotosGrid(ctx, page.fotos);
    }
  }

  /**
   * Renderiza tabla de tuberías
   */
  private renderTuberiaTable(ctx: RenderContext, tuberias: TuberiaInfo[]): void {
    const { doc } = ctx;
    const tableWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2;
    const colWidths = [
      tableWidth * 0.2,
      tableWidth * 0.2,
      tableWidth * 0.2,
      tableWidth * 0.2,
      tableWidth * 0.2,
    ];
    const headers = ['Ø (mm)', 'Material', 'Cota', 'Estado', 'Longitud'];

    // Encabezado de tabla
    doc.setFillColor(245, 245, 245);
    doc.rect(
      PDF_CONFIG.margin,
      ctx.currentY - 4,
      tableWidth,
      6,
      'F'
    );
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    let x = PDF_CONFIG.margin;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, ctx.currentY);
      x += colWidths[i];
    });
    ctx.currentY += PDF_CONFIG.lineHeight;

    // Filas
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    for (const tub of tuberias) {
      this.checkPageBreak(ctx, PDF_CONFIG.lineHeight);
      x = PDF_CONFIG.margin;
      doc.text(tub.diametro?.value || '-', x + 2, ctx.currentY);
      x += colWidths[0];
      doc.text(tub.material?.value || '-', x + 2, ctx.currentY);
      x += colWidths[1];
      doc.text(tub.cota?.value || '-', x + 2, ctx.currentY);
      x += colWidths[2];
      doc.text(tub.estado?.value || '-', x + 2, ctx.currentY);
      x += colWidths[3];
      doc.text(tub.longitud?.value || '-', x + 2, ctx.currentY);
      ctx.currentY += PDF_CONFIG.lineHeight;
    }
  }

  /**
   * Renderiza tabla de sumideros
   */
  private renderSumideroTable(ctx: RenderContext, sumideros: SumideroInfo[]): void {
    const { doc } = ctx;
    const tableWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2;
    const colWidths = [
      tableWidth * 0.15,
      tableWidth * 0.2,
      tableWidth * 0.2,
      tableWidth * 0.15,
      tableWidth * 0.15,
      tableWidth * 0.15,
    ];
    const headers = ['ID', 'Tipo', 'Material', 'Ø (mm)', 'H Salida', 'H Llegada'];

    // Encabezado de tabla
    doc.setFillColor(245, 245, 245);
    doc.rect(
      PDF_CONFIG.margin,
      ctx.currentY - 4,
      tableWidth,
      6,
      'F'
    );
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    let x = PDF_CONFIG.margin;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, ctx.currentY);
      x += colWidths[i];
    });
    ctx.currentY += PDF_CONFIG.lineHeight;

    // Filas
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    for (const sum of sumideros) {
      this.checkPageBreak(ctx, PDF_CONFIG.lineHeight);
      x = PDF_CONFIG.margin;
      doc.text(sum.idSumidero?.value || '-', x + 2, ctx.currentY);
      x += colWidths[0];
      doc.text(sum.tipoSumidero?.value || '-', x + 2, ctx.currentY);
      x += colWidths[1];
      doc.text(sum.materialTuberia?.value || '-', x + 2, ctx.currentY);
      x += colWidths[2];
      doc.text(sum.diametro?.value || '-', x + 2, ctx.currentY);
      x += colWidths[3];
      doc.text(sum.alturaSalida?.value || '-', x + 2, ctx.currentY);
      x += colWidths[4];
      doc.text(sum.alturaLlegada?.value || '-', x + 2, ctx.currentY);
      ctx.currentY += PDF_CONFIG.lineHeight;
    }
  }

  /**
   * Renderiza grid de fotos
   */
  private async renderPhotosGrid(ctx: RenderContext, fotos: FotoInfo[]): Promise<void> {
    const photosPerRow = 2;
    const photoWidth = PDF_CONFIG.maxImageWidth;
    const photoHeight = PDF_CONFIG.maxImageHeight;
    const gap = 8;
    const startX = PDF_CONFIG.margin;

    for (let i = 0; i < fotos.length; i++) {
      const col = i % photosPerRow;
      const x = startX + col * (photoWidth + gap);

      if (col === 0 && i > 0) {
        ctx.currentY += photoHeight + 15;
        this.checkPageBreak(ctx, photoHeight + 20);
      }

      await this.renderPhoto(ctx, fotos[i], x, ctx.currentY, photoWidth, photoHeight);
    }

    ctx.currentY += photoHeight + 15;
  }

  /**
   * Renderiza una foto individual
   */
  private async renderPhoto(
    ctx: RenderContext,
    foto: FotoInfo,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
  ): Promise<void> {
    const { doc } = ctx;

    try {
      if (foto.dataUrl) {
        const img = await this.loadImage(foto.dataUrl);
        const { width, height } = this.calculateImageDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );
        doc.addImage(foto.dataUrl, 'JPEG', x, y, width, height, undefined, 'MEDIUM');

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        const description = foto.descripcion?.value || foto.tipoFoto?.value || 'Foto';
        doc.text(description, x, y + height + 2, { maxWidth });
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(249, 249, 249);
        doc.rect(x, y, maxWidth, maxHeight, 'FD');
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text('Imagen no disponible', x + maxWidth / 2, y + maxHeight / 2, {
          align: 'center',
        });
      }
    } catch {
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, maxWidth, maxHeight);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text('Error al cargar', x + 2, y + maxHeight / 2);
    }
  }

  /**
   * Renderiza título de sección
   */
  private renderSectionTitle(ctx: RenderContext, title: string): void {
    const { doc } = ctx;
    this.checkPageBreak(ctx, PDF_CONFIG.sectionTitleHeight + 3);
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, PDF_CONFIG.margin, ctx.currentY);
    ctx.currentY += PDF_CONFIG.sectionTitleHeight;
  }

  /**
   * Renderiza un campo
   */
  private renderField(
    ctx: RenderContext,
    label: string,
    value: string,
    x: number,
    width: number
  ): void {
    const { doc } = ctx;
    doc.setTextColor(102, 102, 102);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', x, ctx.currentY);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', x, ctx.currentY + 3, { maxWidth: width - 2 });

    ctx.currentY += PDF_CONFIG.lineHeight;
  }

  /**
   * Obtiene el valor de un campo
   */
  private getFieldValue(pozo: Pozo, field: RepeatableHeaderField): string {
    switch (field) {
      case 'idPozo':
        return this.extractValue(pozo.idPozo);
      case 'fecha':
        return this.extractValue(pozo.fecha);
      case 'levanto':
        return this.extractValue(pozo.levanto);
      case 'estado':
        return this.extractValue(pozo.estado);
      case 'direccion':
        return this.extractValue(pozo.direccion);
      case 'barrio':
        return this.extractValue(pozo.barrio);
      case 'profundidad':
        return this.extractValue(pozo.profundidad);
      case 'tipoCamara':
        return this.extractValue(pozo.tipoCamara);
      case 'sistema':
        return this.extractValue(pozo.sistema);
      case 'coordenadaX':
        return this.extractValue(pozo.coordenadaX);
      case 'coordenadaY':
        return this.extractValue(pozo.coordenadaY);
      default:
        return '-';
    }
  }

  /**
   * Extrae el valor de un FieldValue
   */
  private extractValue(field: any): string {
    if (!field) return '-';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && 'value' in field) return field.value || '-';
    return String(field);
  }

  /**
   * Verifica si hay espacio para el siguiente elemento
   */
  private checkPageBreak(ctx: RenderContext, requiredSpace: number): void {
    const availableSpace =
      PDF_CONFIG.pageHeight - ctx.currentY - PDF_CONFIG.footerHeight - PDF_CONFIG.margin;
    if (availableSpace < requiredSpace) {
      ctx.doc.addPage();
      ctx.pageNumber++;
      ctx.currentY = PDF_CONFIG.margin;

      // Renderizar encabezado reimprimible en nueva página
      if (ctx.paginationConfig.repeatableHeader.enabled) {
        // Nota: Necesitaría acceso al pozo aquí
        // Por ahora, solo incrementamos el Y
      }
    }
  }

  /**
   * Renderiza pie de página
   */
  private renderFooters(
    ctx: RenderContext,
    options?: { pageNumbers?: boolean; includeDate?: boolean }
  ): void {
    const { doc, pageNumber, totalPages } = ctx;

    for (let i = 1; i <= pageNumber; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);
      const footerY = PDF_CONFIG.pageHeight - 8;

      if (options?.pageNumbers) {
        doc.text(`Página ${i} de ${totalPages}`, PDF_CONFIG.pageWidth / 2, footerY, {
          align: 'center',
        });
      }

      if (options?.includeDate) {
        const date = new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        doc.text(date, PDF_CONFIG.pageWidth - PDF_CONFIG.margin, footerY, {
          align: 'right',
        });
      }
    }
  }

  /**
   * Carga una imagen
   */
  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Calcula dimensiones de imagen
   */
  private calculateImageDimensions(
    origW: number,
    origH: number,
    maxW: number,
    maxH: number
  ): { width: number; height: number } {
    const ratio = Math.min(maxW / origW, maxH / origH);
    return { width: origW * ratio, height: origH * ratio };
  }

  /**
   * Convierte hex a RGB
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }
}

export const paginatedPdfGenerator = new PaginatedPDFGenerator();
