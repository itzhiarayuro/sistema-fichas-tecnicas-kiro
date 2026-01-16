/**
 * BatchGeneratorPdfMake - Generación de PDFs en lote con pdfmake
 * Requirements: 7.3-7.6
 * 
 * Permite generar múltiples PDFs con progreso, cancelación y empaquetado ZIP.
 * Versión mejorada con pdfmake.
 */

import { PDFMakeGenerator, type PDFGeneratorOptions } from './pdfMakeGenerator';
import type { FichaState } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';

export interface BatchItem {
  ficha: FichaState;
  pozo: Pozo;
}

export interface BatchProgress {
  total: number;
  completed: number;
  current: string;
  percentage: number;
  errors: BatchError[];
}

export interface BatchError {
  pozoId: string;
  codigo: string;
  error: string;
}

export interface BatchResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: BatchError[];
  zipBlob?: Blob;
  zipFilename?: string;
}

export type ProgressCallback = (progress: BatchProgress) => void;

/**
 * Clase para generación de PDFs en lote con pdfmake
 */
export class BatchGeneratorPdfMake {
  private pdfGenerator: PDFMakeGenerator;
  private cancelled: boolean = false;

  constructor() {
    this.pdfGenerator = new PDFMakeGenerator();
  }

  /**
   * Genera PDFs para múltiples fichas
   */
  async generateBatch(
    items: BatchItem[],
    options: PDFGeneratorOptions = {},
    onProgress?: ProgressCallback
  ): Promise<BatchResult> {
    this.cancelled = false;
    
    // Importación dinámica de JSZip para evitar problemas de SSR
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const errors: BatchError[] = [];
    let successCount = 0;

    const progress: BatchProgress = {
      total: items.length,
      completed: 0,
      current: '',
      percentage: 0,
      errors: [],
    };

    for (let i = 0; i < items.length; i++) {
      // Verificar cancelación
      if (this.cancelled) {
        break;
      }

      const item = items[i];
      const pozoId = item.pozo.idPozo || `pozo-${i}`;

      // Actualizar progreso
      progress.current = `Generando PDF para ${pozoId}...`;
      progress.completed = i;
      progress.percentage = Math.round((i / items.length) * 100);

      if (onProgress) {
        onProgress(progress);
      }

      try {
        // Generar PDF
        const result = await this.pdfGenerator.generatePDF(item.ficha, item.pozo, options);

        if (!result.success || !result.blob) {
          throw new Error(result.error || 'Error desconocido');
        }

        // Agregar al ZIP
        const filename = result.filename || `ficha_${pozoId}.pdf`;
        zip.file(filename, result.blob);
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        errors.push({
          pozoId: String(pozoId),
          codigo: String(pozoId),
          error: errorMessage,
        });
      }
    }

    // Finalizar progreso
    progress.completed = items.length;
    progress.percentage = 100;
    progress.errors = errors;

    if (onProgress) {
      onProgress(progress);
    }

    // Generar ZIP
    let zipBlob: Blob | undefined;
    let zipFilename: string | undefined;

    if (successCount > 0) {
      zipBlob = await zip.generateAsync({ type: 'blob' });
      zipFilename = `fichas_${new Date().getTime()}.zip`;
    }

    return {
      success: errors.length === 0,
      totalProcessed: items.length,
      successCount,
      errorCount: errors.length,
      errors,
      zipBlob,
      zipFilename,
    };
  }

  /**
   * Cancelar generación
   */
  cancel(): void {
    this.cancelled = true;
  }
}
