/**
 * Configuración de Paginación y Encabezados Reimprimibles
 * Requirements: 7.1, 7.2
 * 
 * Define cómo se pagina el contenido repetible (tuberías, sumideros, fotos)
 * y qué campos se repiten como encabezado en cada página
 */

/**
 * Configuración de límites por página
 */
export interface PaginationLimits {
  // Tuberías
  maxEntradasPorPagina: number;      // Máximo de entradas por página (default: 10)
  maxSalidasPorPagina: number;       // Máximo de salidas por página (default: 2)
  
  // Sumideros
  maxSumiderosPorPagina: number;     // Máximo de sumideros por página (default: 6)
  
  // Fotos
  maxFotosPorPagina: number;         // Máximo de fotos por página (default: 4)
}

/**
 * Campos que pueden ser reimprimibles en cada página
 */
export enum RepeatableHeaderField {
  // Identificación
  ID_POZO = 'idPozo',
  FECHA = 'fecha',
  LEVANTO = 'levanto',
  ESTADO = 'estado',
  
  // Ubicación
  DIRECCION = 'direccion',
  BARRIO = 'barrio',
  PROFUNDIDAD = 'profundidad',
  
  // Componentes
  TIPO_CAMARA = 'tipoCamara',
  SISTEMA = 'sistema',
  
  // Coordenadas
  COORDENADA_X = 'coordenadaX',
  COORDENADA_Y = 'coordenadaY',
}

/**
 * Configuración de encabezados reimprimibles
 */
export interface RepeatableHeaderConfig {
  // Habilitar encabezados reimprimibles
  enabled: boolean;
  
  // Campos a repetir en cada página
  fields: RepeatableHeaderField[];
  
  // Altura del encabezado en mm
  height: number;
  
  // Mostrar línea separadora
  showSeparator: boolean;
  
  // Estilo del encabezado
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
  };
}

/**
 * Configuración completa de paginación
 */
export interface PaginationConfig {
  // Límites de elementos por página
  limits: PaginationLimits;
  
  // Configuración de encabezados reimprimibles
  repeatableHeader: RepeatableHeaderConfig;
  
  // Mostrar indicador de página (ej: "Página 1 de 3")
  showPageIndicator: boolean;
  
  // Mostrar sección de contenido en cada página
  showSectionTitles: boolean;
}

/**
 * Valores por defecto para paginación
 */
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  limits: {
    maxEntradasPorPagina: 10,
    maxSalidasPorPagina: 2,
    maxSumiderosPorPagina: 6,
    maxFotosPorPagina: 4,
  },
  repeatableHeader: {
    enabled: true,
    fields: [
      RepeatableHeaderField.ID_POZO,
      RepeatableHeaderField.FECHA,
      RepeatableHeaderField.DIRECCION,
    ],
    height: 20,
    showSeparator: true,
    style: {
      backgroundColor: '#F5F5F5',
      textColor: '#333333',
      fontSize: 9,
      fontWeight: 'normal',
    },
  },
  showPageIndicator: true,
  showSectionTitles: true,
};

/**
 * Información de página para renderizado
 */
export interface PageInfo {
  pageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  contentType: 'tuberias' | 'sumideros' | 'fotos' | 'mixed';
  itemsOnPage: number;
}

/**
 * Resultado de paginación
 */
export interface PaginationResult {
  pages: PaginatedContent[];
  totalPages: number;
  totalItems: number;
}

/**
 * Contenido paginado
 */
export interface PaginatedContent {
  pageNumber: number;
  tuberias: {
    entradas: any[];
    salidas: any[];
  };
  sumideros: any[];
  fotos: any[];
  hasContent: boolean;
}
