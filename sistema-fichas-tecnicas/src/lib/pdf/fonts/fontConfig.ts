/**
 * fontConfig.ts - Configuración de fuentes Inter para pdfmake
 * 
 * Inter: Fuente con números tabulares y soporte UTF-8 completo
 * Ideal para formularios técnicos y tablas con datos numéricos
 */

/**
 * Definición de fuentes para pdfmake
 * Mapea estilos (normal, bold, italics, bolditalics) a archivos TTF
 */
export const fonts = {
  Inter: {
    normal: 'Inter-Regular.ttf',
    bold: 'Inter-Bold.ttf',
    italics: 'Inter-Italic.ttf',
    bolditalics: 'Inter-BoldItalic.ttf',
  },
  // Fallback usando Medium como Bold si Bold no está disponible
  InterMedium: {
    normal: 'Inter-Regular.ttf',
    bold: 'Inter-Medium.ttf',
    italics: 'Inter-Italic.ttf',
    bolditalics: 'Inter-Medium.ttf',
  },
};

/**
 * Fuente por defecto para todos los documentos
 */
export const DEFAULT_FONT = 'Inter';

/**
 * Estilos predefinidos para formularios y tablas técnicas
 * Optimizados para legibilidad y consistencia visual
 */
export const pdfStyles = {
  // Encabezados
  header: {
    font: 'Inter',
    fontSize: 16,
    bold: true,
    color: '#FFFFFF',
    alignment: 'center' as const,
  },
  subheader: {
    font: 'Inter',
    fontSize: 14,
    bold: true,
    color: '#1F4E79',
  },
  
  // Secciones
  sectionTitle: {
    font: 'Inter',
    fontSize: 11,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    margin: [0, 8, 0, 4] as [number, number, number, number],
  },
  
  // Campos de formulario
  label: {
    font: 'Inter',
    fontSize: 9,
    bold: true,
    color: '#4A4A4A',
  },
  value: {
    font: 'Inter',
    fontSize: 10,
    color: '#000000',
  },
  
  // Tablas
  tableHeader: {
    font: 'Inter',
    fontSize: 9,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    alignment: 'center' as const,
  },
  tableCell: {
    font: 'Inter',
    fontSize: 9,
    color: '#000000',
  },
  tableCellNumber: {
    font: 'Inter',
    fontSize: 9,
    color: '#000000',
    alignment: 'right' as const,
  },
  
  // Texto general
  body: {
    font: 'Inter',
    fontSize: 10,
    color: '#333333',
  },
  small: {
    font: 'Inter',
    fontSize: 8,
    color: '#666666',
  },
  footer: {
    font: 'Inter',
    fontSize: 8,
    color: '#999999',
    alignment: 'center' as const,
  },
};

/**
 * Configuración por defecto del documento
 */
export const defaultDocumentConfig = {
  defaultStyle: {
    font: DEFAULT_FONT,
    fontSize: 10,
    lineHeight: 1.2,
  },
  pageSize: 'A4' as const,
  pageMargins: [20, 20, 20, 30] as [number, number, number, number],
};

export default { fonts, pdfStyles, defaultDocumentConfig, DEFAULT_FONT };
