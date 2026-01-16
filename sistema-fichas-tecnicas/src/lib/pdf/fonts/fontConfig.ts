/**
 * fontConfig.ts - Configuración de fuentes para pdfmake
 * 
 * Roboto: Fuente por defecto de pdfmake con soporte UTF-8 completo
 * Incluida automáticamente en pdfmake/build/vfs_fonts
 */

/**
 * Definición de fuentes para pdfmake
 * Roboto está incluida por defecto en pdfmake
 */
export const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

/**
 * Fuente por defecto para todos los documentos
 */
export const DEFAULT_FONT = 'Roboto';

/**
 * Estilos predefinidos para formularios y tablas técnicas
 * Optimizados para legibilidad y consistencia visual
 */
export const pdfStyles = {
  // Encabezados
  header: {
    font: 'Roboto',
    fontSize: 16,
    bold: true,
    color: '#FFFFFF',
    alignment: 'center' as const,
  },
  subheader: {
    font: 'Roboto',
    fontSize: 14,
    bold: true,
    color: '#1F4E79',
  },
  
  // Secciones
  sectionTitle: {
    font: 'Roboto',
    fontSize: 11,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    margin: [0, 8, 0, 4] as [number, number, number, number],
  },
  
  // Campos de formulario
  label: {
    font: 'Roboto',
    fontSize: 9,
    bold: true,
    color: '#4A4A4A',
  },
  value: {
    font: 'Roboto',
    fontSize: 10,
    color: '#000000',
  },
  
  // Tablas
  tableHeader: {
    font: 'Roboto',
    fontSize: 9,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    alignment: 'center' as const,
  },
  tableCell: {
    font: 'Roboto',
    fontSize: 9,
    color: '#000000',
  },
  tableCellNumber: {
    font: 'Roboto',
    fontSize: 9,
    color: '#000000',
    alignment: 'right' as const,
  },
  
  // Texto general
  body: {
    font: 'Roboto',
    fontSize: 10,
    color: '#333333',
  },
  small: {
    font: 'Roboto',
    fontSize: 8,
    color: '#666666',
  },
  footer: {
    font: 'Roboto',
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
