/**
 * Parser de nomenclatura de fotos para pozos de inspección
 * Requirements: 10.1-10.4
 * 
 * Patrones soportados:
 * - Principales: T (Tapa), I (Interior), P (Panorámica)
 * - Entradas: E1-T (Entrada 1), E2-T (Entrada 2), etc.
 * - Salidas: S-T (Salida)
 * - Sumideros: SUM (Sumidero)
 * 
 * Reglas de nomenclatura:
 * - T = Tapa (solo T, sin -S-)
 * - I = Interior
 * - P = Panorámica
 * - E{n}-T = Entrada {n} (donde n es el número)
 * - S-T = Salida
 * - SUM = Sumidero
 * 
 * IMPORTANTE: Cualquier foto con "Z" en el nombre se IGNORA (no se procesa)
 * 
 * Formato general: {POZO_ID}-{TIPO}[-{SUBTIPO}]
 * Ejemplo: M680-T.jpg, M680-I.jpg, M680-P.jpg, M680-E1-T.jpg, M680-S-T.jpg, M680-SUM.jpg
 */

export interface NomenclaturaResult {
  /** ID del pozo extraído del nombre */
  pozoId: string;
  /** Categoría de la foto */
  categoria: 'PRINCIPAL' | 'ENTRADA' | 'SALIDA' | 'SUMIDERO' | 'OTRO';
  /** Subcategoría específica (ej: E1-T, S-T, SUM1) */
  subcategoria: string;
  /** Descripción legible del tipo de foto */
  tipo: string;
  /** Si la nomenclatura es válida */
  isValid: boolean;
  /** Mensaje de error si no es válida */
  error?: string;
  /** Si la foto contiene "Z" y debe ser ignorada */
  debeIgnorarse: boolean;
}

/**
 * Patrones de nomenclatura soportados
 * IMPORTANTE: Cualquier patrón con "Z" se marca como ignorado
 */
const PATTERNS = {
  // Fotos principales: M680-T (Tapa), M680-I (Interior), M680-P (Panorámica)
  // Solo T, I, P - sin -S- para T
  PRINCIPAL: /^([A-Z]\d+)-([TIP])$/i,
  
  // Entradas con número: M680-E1-T, M680-E2-T, etc.
  ENTRADA: /^([A-Z]\d+)-(E\d+)-T$/i,
  // Entradas con Z (ignoradas): M680-E1-Z, M680-E2-Z, etc.
  ENTRADA_Z: /^([A-Z]\d+)-(E\d+)-Z$/i,
  
  // Salida sin número: M680-S-T
  SALIDA: /^([A-Z]\d+)-S-T$/i,
  // Salida con Z (ignorada): M680-S-Z
  SALIDA_Z: /^([A-Z]\d+)-S-Z$/i,
  
  // Sumidero: M680-SUM
  SUMIDERO: /^([A-Z]\d+)-SUM$/i,
  // Sumidero con Z (ignorado): M680-SUM-Z
  SUMIDERO_Z: /^([A-Z]\d+)-SUM-Z$/i,
};

/** Descripciones legibles para tipos de fotos principales */
const TIPO_DESCRIPCION: Record<string, string> = {
  T: 'Tapa',
  I: 'Interior',
  P: 'Panorámica',
};

/** Descripciones para subtipos de entradas/salidas */
const SUBTIPO_DESCRIPCION: Record<string, string> = {
  T: 'Tubería',
};

/**
 * Parsea el nombre de un archivo de foto según la nomenclatura
 * @param filename - Nombre del archivo (con o sin extensión)
 * @returns Resultado del parsing con información estructurada
 */
export function parseNomenclatura(filename: string): NomenclaturaResult {
  // Remover extensión si existe
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').trim();
  
  if (!nameWithoutExt) {
    return createInvalidResult(filename, 'Nombre de archivo vacío');
  }
  
  // PRIMERO: Verificar si contiene "Z" - si es así, IGNORAR
  // Intentar patrón ENTRADA_Z (ignoradas)
  let match = nameWithoutExt.match(PATTERNS.ENTRADA_Z);
  if (match) {
    const entradaNum = match[2].toUpperCase();
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'ENTRADA',
      subcategoria: `${entradaNum}-Z`,
      tipo: `Entrada ${entradaNum.slice(1)} (IGNORADA - contiene Z)`,
      isValid: true,
      debeIgnorarse: true,
    };
  }
  
  // Intentar patrón SALIDA_Z (ignoradas)
  match = nameWithoutExt.match(PATTERNS.SALIDA_Z);
  if (match) {
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'SALIDA',
      subcategoria: `S-Z`,
      tipo: `Salida (IGNORADA - contiene Z)`,
      isValid: true,
      debeIgnorarse: true,
    };
  }
  
  // Intentar patrón SUMIDERO_Z (ignoradas)
  match = nameWithoutExt.match(PATTERNS.SUMIDERO_Z);
  if (match) {
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'SUMIDERO',
      subcategoria: `SUM-Z`,
      tipo: `Sumidero (IGNORADA - contiene Z)`,
      isValid: true,
      debeIgnorarse: true,
    };
  }
  
  // SEGUNDO: Procesar fotos válidas (sin Z)
  
  // Intentar patrón PRINCIPAL (T, I, P)
  match = nameWithoutExt.match(PATTERNS.PRINCIPAL);
  if (match) {
    const tipoCode = match[2].toUpperCase();
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'PRINCIPAL',
      subcategoria: tipoCode,
      tipo: TIPO_DESCRIPCION[tipoCode] || tipoCode,
      isValid: true,
      debeIgnorarse: false,
    };
  }
  
  // Intentar patrón ENTRADA (E{n}-T)
  match = nameWithoutExt.match(PATTERNS.ENTRADA);
  if (match) {
    const entradaNum = match[2].toUpperCase();
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'ENTRADA',
      subcategoria: `${entradaNum}-T`,
      tipo: `Entrada ${entradaNum.slice(1)}`,
      isValid: true,
      debeIgnorarse: false,
    };
  }
  
  // Intentar patrón SALIDA (S-T)
  match = nameWithoutExt.match(PATTERNS.SALIDA);
  if (match) {
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'SALIDA',
      subcategoria: `S-T`,
      tipo: `Salida`,
      isValid: true,
      debeIgnorarse: false,
    };
  }
  
  // Intentar patrón SUMIDERO (SUM)
  match = nameWithoutExt.match(PATTERNS.SUMIDERO);
  if (match) {
    return {
      pozoId: match[1].toUpperCase(),
      categoria: 'SUMIDERO',
      subcategoria: `SUM`,
      tipo: `Sumidero`,
      isValid: true,
      debeIgnorarse: false,
    };
  }
  
  // No coincide con ningún patrón
  return createInvalidResult(filename, `Nomenclatura no reconocida: ${filename}`);
}

/**
 * Crea un resultado inválido con valores por defecto
 */
function createInvalidResult(filename: string, error: string): NomenclaturaResult {
  const debeIgnorarse = /Z/i.test(filename);
  return {
    pozoId: '',
    categoria: 'OTRO',
    subcategoria: '',
    tipo: 'Desconocido',
    isValid: false,
    error,
    debeIgnorarse,
  };
}

/**
 * Reconstruye el nombre de archivo desde los componentes parseados
 * Usado para validar round-trip (Property 2)
 * @param result - Resultado de parseNomenclatura
 * @returns Nombre reconstruido sin extensión
 */
export function buildNomenclatura(result: NomenclaturaResult): string {
  if (!result.isValid || !result.pozoId) {
    return '';
  }
  
  switch (result.categoria) {
    case 'PRINCIPAL':
      return `${result.pozoId}-${result.subcategoria}`;
    case 'ENTRADA':
    case 'SALIDA':
      return `${result.pozoId}-${result.subcategoria}`;
    case 'SUMIDERO':
      return `${result.pozoId}-${result.subcategoria}`;
    default:
      return '';
  }
}

/**
 * Valida si un nombre de archivo sigue la nomenclatura
 * @param filename - Nombre del archivo a validar
 * @returns true si la nomenclatura es válida
 */
export function isValidNomenclatura(filename: string): boolean {
  return parseNomenclatura(filename).isValid;
}

/**
 * Obtiene todos los tipos de fotos principales soportados
 * @returns Array de códigos de tipos principales (T, I, P)
 */
export function getTiposPrincipales(): string[] {
  return Object.keys(TIPO_DESCRIPCION);
}

/**
 * Obtiene la descripción de un tipo de foto principal
 * @param codigo - Código del tipo (P, T, I, A, F, M)
 * @returns Descripción legible o el código si no existe
 */
export function getDescripcionTipo(codigo: string): string {
  return TIPO_DESCRIPCION[codigo.toUpperCase()] || codigo;
}
