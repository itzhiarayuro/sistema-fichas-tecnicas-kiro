/**
 * fontConfig.ts - Configuración de fuentes para pdfmake
 * 
 * Helvetica: Fuente estándar de PDF (no requiere VFS)
 */

/**
 * Definición de fuentes para pdfmake
 * Helvetica es una fuente estándar de PDF incluida en todos los lectores
 */
export const fonts = {
  // No se necesita configurar fonts cuando se usa Helvetica por defecto
};

/**
 * Fuente por defecto para todos los documentos
 * Helvetica es la fuente por defecto de pdfmake
 */
export const DEFAULT_FONT = 'Helvetica';

/**
 * Estilos predefinidos para formularios y tablas técnicas
 * Optimizados para legibilidad y consistencia visual
 * NO especificar font para usar Helvetica por defecto
 */
export const pdfStyles = {
  // Encabezados
  header: {
    fontSize: 16,
    bold: true,
    color: '#FFFFFF',
    alignment: 'center' as const,
  },
  subheader: {
    fontSize: 14,
    bold: true,
    color: '#1F4E79',
  },
  
  // Secciones
  sectionTitle: {
    fontSize: 11,
    bold: true,
    color: '#FFFFFF',
    fillColor: '#1F4E79',
    margin: [0, 8, 0, 4] as [number, number, number, number],
  },
  
  // Campos de formulario
  label: {
    fontSize: 9,
    bold: true,
    color: '#4A4A4A',
  },
  value: {
    fontSize: 10,
    color: '#000000',
  },
  
  // Tablas
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
  tableCellNumber: {
    fontSize: 9,
    color: '#000000',
    alignment: 'right' as const,
  },
  
  // Texto general
  body: {
    fontSize: 10,
    color: '#333333',
  },
  small: {
    fontSize: 8,
    color: '#666666',
  },
  footer: {
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
