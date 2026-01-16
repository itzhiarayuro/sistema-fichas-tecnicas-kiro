/**
 * Módulo de generación de PDF
 * Requirements: 7.1-7.6
 * 
 * Exporta tanto jsPDF (legado) como pdfmake (nuevo)
 */

// Generador jsPDF (legado)
export {
  PDFGenerator,
  pdfGenerator,
  generateFichaPDF,
  downloadPDF,
  type PDFGeneratorOptions,
  type PDFGenerationResult,
} from './pdfGenerator';

// Generador pdfmake (nuevo)
export {
  PDFMakeGenerator,
  type PDFGeneratorOptions as PDFMakeGeneratorOptions,
  type PDFGenerationResult as PDFMakeGenerationResult,
} from './pdfMakeGenerator';

// Generador en lote
export {
  BatchGenerator,
  batchGenerator,
  generateBatchPDFs,
  downloadZip,
  type BatchItem,
  type BatchProgress,
  type BatchError,
  type BatchResult,
  type ProgressCallback,
} from './batchGenerator';
