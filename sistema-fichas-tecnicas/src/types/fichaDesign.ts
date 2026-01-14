/**
 * Tipos para el Diseñador de Fichas Técnicas
 * Requirements: 6.1-6.4
 * 
 * Este módulo define la estructura de datos para el diseñador visual de fichas,
 * permitiendo personalización completa de layouts, posiciones, tamaños y estilos.
 */

/**
 * Posición y tamaño de un elemento en el canvas
 */
export interface ElementPosition {
  /** Posición X en píxeles (relativa al canvas) */
  x: number;
  /** Posición Y en píxeles (relativa al canvas) */
  y: number;
  /** Ancho en píxeles */
  width: number;
  /** Alto en píxeles */
  height: number;
}

/**
 * Estilos CSS para un elemento
 */
export interface ElementStyle {
  /** Tamaño de fuente en píxeles */
  fontSize: number;
  /** Familia de fuente */
  fontFamily: string;
  /** Color del texto */
  color: string;
  /** Color de fondo */
  backgroundColor: string;
  /** Radio de borde en píxeles */
  borderRadius: number;
  /** Padding interno en píxeles */
  padding: number;
  /** Peso de la fuente (normal, bold, etc) */
  fontWeight?: string;
  /** Alineación del texto (left, center, right) */
  textAlign?: 'left' | 'center' | 'right';
  /** Altura de línea */
  lineHeight?: number;
  /** Borde */
  border?: string;
  /** Opacidad (0-1) */
  opacity?: number;
}

/**
 * Información de un campo colocado en el diseño
 */
export interface FieldPlacement {
  /** ID único del placement */
  id: string;
  
  /** ID del campo del diccionario (ej: "idPozo", "direccion", etc) */
  fieldId: string;
  
  /** Nombre del campo para referencia */
  fieldName: string;
  
  /** Tipo de dato del campo */
  fieldType: 'text' | 'number' | 'date' | 'select' | 'image' | 'repeatable';
  
  /** Posición y tamaño en el canvas */
  position: ElementPosition;
  
  /** Estilos aplicados al elemento */
  style: ElementStyle;
  
  /** Label personalizado (si es diferente al nombre del campo) */
  customLabel?: string;
  
  /** ¿Es un campo repetible? (para tuberías, sumideros, fotos) */
  isRepeatable: boolean;
  
  /** Configuración para campos repetibles */
  repeatableConfig?: {
    /** Máximo número de repeticiones (0 = ilimitado) */
    maxRepetitions: number;
    /** Espaciado entre repeticiones en píxeles */
    spacing: number;
    /** ¿Mostrar numeración? */
    showNumbering: boolean;
  };
  
  /** Orden de visualización en el canvas */
  zIndex: number;
  
  /** ¿Está bloqueado para edición? */
  locked: boolean;
  
  /** ¿Está visible en el diseño? */
  visible: boolean;
  
  /** Timestamp de creación */
  createdAt: number;
  
  /** Timestamp de última modificación */
  updatedAt: number;
}

/**
 * Figura geométrica en el diseño
 */
export interface GeometricShape {
  /** ID único de la figura */
  id: string;
  
  /** Tipo de figura: rectangle, circle, line, etc */
  type: 'rectangle' | 'circle' | 'line' | 'triangle';
  
  /** Posición y tamaño en el canvas */
  position: ElementPosition;
  
  /** Propiedades de estilo */
  style: {
    /** Color de relleno */
    fillColor: string;
    /** Color del borde */
    strokeColor: string;
    /** Ancho del borde en píxeles */
    strokeWidth: number;
    /** Opacidad (0-1) */
    opacity: number;
    /** Tipo de línea (solid, dashed, dotted) */
    strokeDasharray?: string;
  };
  
  /** Orden de visualización */
  zIndex: number;
  
  /** ¿Está bloqueada? */
  locked: boolean;
  
  /** ¿Está visible? */
  visible: boolean;
  
  /** Timestamp de creación */
  createdAt: number;
  
  /** Timestamp de última modificación */
  updatedAt: number;
}

/**
 * Configuración de página para el diseño
 */
export interface PageConfig {
  /** Tamaño de página: A4, Letter, etc */
  size: 'A4' | 'Letter' | 'Legal' | 'Custom';
  
  /** Orientación: portrait o landscape */
  orientation: 'portrait' | 'landscape';
  
  /** Ancho de página en píxeles (para renderizado) */
  width: number;
  
  /** Alto de página en píxeles (para renderizado) */
  height: number;
  
  /** Márgenes en píxeles */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  /** Mostrar grilla de guía */
  showGrid: boolean;
  
  /** Tamaño de grilla en píxeles */
  gridSize: number;
  
  /** Snap to grid habilitado */
  snapToGrid: boolean;
}

/**
 * Configuración de colores y estilos globales del diseño
 */
export interface DesignTheme {
  /** Color primario */
  primaryColor: string;
  
  /** Color secundario */
  secondaryColor: string;
  
  /** Color de fondo */
  backgroundColor: string;
  
  /** Color de texto por defecto */
  textColor: string;
  
  /** Color de bordes */
  borderColor: string;
  
  /** Familia de fuente por defecto */
  fontFamily: string;
  
  /** Tamaño de fuente base */
  baseFontSize: number;
}

/**
 * Diseño completo de una ficha técnica
 */
export interface FichaDesign {
  /** ID único del diseño */
  id: string;
  
  /** Nombre del diseño */
  name: string;
  
  /** Descripción del diseño */
  description?: string;
  
  /** Configuración de página */
  pageConfig: PageConfig;
  
  /** Tema de colores y estilos */
  theme: DesignTheme;
  
  /** Campos colocados en el diseño */
  fieldPlacements: FieldPlacement[];
  
  /** Figuras geométricas en el diseño */
  shapes: GeometricShape[];
  
  /** ¿Es un diseño por defecto del sistema? */
  isDefault: boolean;
  
  /** ¿Es un diseño global (aplica a todas las fichas)? */
  isGlobal: boolean;
  
  /** Versión del diseño */
  version: number;
  
  /** Timestamp de creación */
  createdAt: number;
  
  /** Timestamp de última modificación */
  updatedAt: number;
  
  /** Usuario que creó el diseño */
  createdBy?: string;
  
  /** Metadatos adicionales */
  metadata?: Record<string, any>;
}

/**
 * Plantilla de diseño guardada (versión histórica)
 */
export interface DesignTemplate {
  /** ID único de la plantilla */
  id: string;
  
  /** ID del diseño padre */
  designId: string;
  
  /** Nombre de la versión */
  versionName: string;
  
  /** Número de versión */
  versionNumber: number;
  
  /** Descripción de cambios en esta versión */
  changelog?: string;
  
  /** Diseño completo en esta versión */
  design: FichaDesign;
  
  /** ¿Es la versión actual? */
  isCurrent: boolean;
  
  /** Timestamp de creación de la versión */
  createdAt: number;
  
  /** Usuario que creó la versión */
  createdBy?: string;
}

/**
 * Estado del editor de diseños
 */
export interface DesignEditorState {
  /** Diseño actual siendo editado */
  currentDesign: FichaDesign | null;
  
  /** Elemento seleccionado en el canvas */
  selectedFieldId: string | null;
  
  /** Nivel de zoom (0.5 = 50%, 1 = 100%, 2 = 200%) */
  zoomLevel: number;
  
  /** Posición de scroll del canvas */
  scrollPosition: {
    x: number;
    y: number;
  };
  
  /** Modo de edición */
  editMode: 'select' | 'draw' | 'text';
  
  /** Historial de cambios para undo/redo */
  history: DesignHistoryEntry[];
  
  /** Índice actual en el historial */
  historyIndex: number;
}

/**
 * Entrada en el historial de cambios del diseño
 */
export interface DesignHistoryEntry {
  /** ID único de la entrada */
  id: string;
  
  /** Timestamp del cambio */
  timestamp: number;
  
  /** Descripción del cambio */
  action: string;
  
  /** Diseño anterior */
  previousDesign: FichaDesign;
  
  /** Diseño nuevo */
  newDesign: FichaDesign;
}

/**
 * Configuración para importar diseño desde HTML
 */
export interface HTMLImportConfig {
  /** Contenido HTML a importar */
  htmlContent: string;
  
  /** Mapeo de selectores CSS a IDs de campos */
  selectorMapping: Record<string, string>;
  
  /** ¿Extraer estilos CSS? */
  extractStyles: boolean;
  
  /** ¿Extraer imágenes? */
  extractImages: boolean;
  
  /** Nombre del nuevo diseño */
  designName: string;
}

/**
 * Resultado de importación de HTML
 */
export interface HTMLImportResult {
  /** ¿Fue exitosa la importación? */
  success: boolean;
  
  /** Diseño creado (si fue exitosa) */
  design?: FichaDesign;
  
  /** Errores encontrados durante la importación */
  errors: string[];
  
  /** Advertencias (campos no mapeados, etc) */
  warnings: string[];
  
  /** Estadísticas de la importación */
  stats: {
    totalElements: number;
    mappedElements: number;
    unmappedElements: number;
  };
}

/**
 * Configuración para exportar diseño a PDF
 */
export interface DesignPDFExportConfig {
  /** Diseño a exportar */
  design: FichaDesign;
  
  /** Datos del pozo a renderizar */
  pozoData: Record<string, any>;
  
  /** Resolución en DPI */
  dpi: number;
  
  /** ¿Incluir marcas de corte? */
  includeBleed: boolean;
  
  /** ¿Comprimir imágenes? */
  compressImages: boolean;
}

/**
 * Diccionario de campos disponibles para el diseñador
 * Agrupa todos los campos del sistema por categoría
 */
export interface FieldDictionary {
  /** Campos de identificación del pozo */
  identificacion: FieldDictionaryEntry[];
  
  /** Campos de ubicación */
  ubicacion: FieldDictionaryEntry[];
  
  /** Campos de componentes del pozo */
  componentes: FieldDictionaryEntry[];
  
  /** Campos de tuberías (repetibles) */
  tuberias: FieldDictionaryEntry[];
  
  /** Campos de sumideros (repetibles) */
  sumideros: FieldDictionaryEntry[];
  
  /** Campos de fotos (repetibles) */
  fotos: FieldDictionaryEntry[];
}

/**
 * Entrada en el diccionario de campos
 */
export interface FieldDictionaryEntry {
  /** ID único del campo */
  id: string;
  
  /** Nombre del campo */
  name: string;
  
  /** Descripción del campo */
  description: string;
  
  /** Tipo de dato */
  type: 'text' | 'number' | 'date' | 'select' | 'image' | 'repeatable';
  
  /** ¿Es obligatorio? */
  required: boolean;
  
  /** Valores posibles (para select) */
  options?: string[];
  
  /** Valor por defecto */
  defaultValue?: string;
  
  /** Patrón de validación (regex) */
  validationPattern?: string;
  
  /** Mensaje de ayuda */
  helpText?: string;
}

/**
 * Configuración de búsqueda y filtrado en el panel de campos
 */
export interface FieldSearchConfig {
  /** Término de búsqueda */
  searchTerm: string;
  
  /** Categorías a mostrar */
  categories: string[];
  
  /** ¿Mostrar solo campos obligatorios? */
  onlyRequired: boolean;
  
  /** ¿Mostrar solo campos repetibles? */
  onlyRepeatable: boolean;
}
