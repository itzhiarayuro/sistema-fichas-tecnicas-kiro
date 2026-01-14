/**
 * Tipos mejorados para Pozo con mejor tipificación
 * 
 * Este archivo proporciona tipos más específicos y seguros
 * que se pueden usar gradualmente en el código existente
 */

import { FieldValue } from './ficha';
import { TuberiaInfo, SumideroInfo, FotoInfo, PozoMetadata } from './pozo';

/**
 * Tipo para propiedades de identificación
 */
export interface IdentificacionPozoFlat {
  idPozo: FieldValue;
  coordenadaX: FieldValue;
  coordenadaY: FieldValue;
  fecha: FieldValue;
  levanto: FieldValue;
  estado: FieldValue;
}

/**
 * Tipo para propiedades de ubicación
 */
export interface UbicacionPozoFlat {
  direccion: FieldValue;
  barrio: FieldValue;
  elevacion: FieldValue;
  profundidad: FieldValue;
}

/**
 * Tipo para propiedades de componentes
 */
export interface ComponentesPozoFlat {
  existeTapa: FieldValue;
  estadoTapa: FieldValue;
  existeCilindro: FieldValue;
  diametroCilindro: FieldValue;
  sistema: FieldValue;
  anoInstalacion: FieldValue;
  tipoCamara: FieldValue;
  estructuraPavimento: FieldValue;
  materialTapa: FieldValue;
  existeCono: FieldValue;
  tipoCono: FieldValue;
  materialCono: FieldValue;
  estadoCono: FieldValue;
  materialCilindro: FieldValue;
  estadoCilindro: FieldValue;
  existeCanuela: FieldValue;
  materialCanuela: FieldValue;
  estadoCanuela: FieldValue;
  existePeldanos: FieldValue;
  materialPeldanos: FieldValue;
  numeroPeldanos: FieldValue;
  estadoPeldanos: FieldValue;
}

/**
 * Tipo para fotos organizadas por categoría
 */
export interface FotosCategorizado {
  principal?: string[];
  entradas?: string[];
  salidas?: string[];
  sumideros?: string[];
  otras?: string[];
}

/**
 * Tipo para acceso seguro a propiedades de Pozo
 * Proporciona métodos helper para acceder a valores
 */
export interface PozoAccessor {
  // Identificación
  getIdPozo(): string;
  getCoordenadaX(): string;
  getCoordenadaY(): string;
  getFecha(): string;
  getLevanto(): string;
  getEstado(): string;
  
  // Ubicación
  getDireccion(): string;
  getBarrio(): string;
  getElevacion(): string;
  getProfundidad(): string;
  
  // Componentes
  getExisteTapa(): string;
  getEstadoTapa(): string;
  getExisteCilindro(): string;
  getDiametroCilindro(): string;
  getSistema(): string;
  getAnoInstalacion(): string;
  getTipoCamara(): string;
  getEstructuraPavimento(): string;
  getMaterialTapa(): string;
  getExisteCono(): string;
  getTipoCono(): string;
  getMaterialCono(): string;
  getEstadoCono(): string;
  getMaterialCilindro(): string;
  getEstadoCilindro(): string;
  getExisteCanuela(): string;
  getMaterialCanuela(): string;
  getEstadoCanuela(): string;
  getExistePeldanos(): string;
  getMaterialPeldanos(): string;
  getNumeroPeldanos(): string;
  getEstadoPeldanos(): string;
  
  // Observaciones
  getObservaciones(): string;
  
  // Relaciones
  getTuberias(): TuberiaInfo[];
  getSumideros(): SumideroInfo[];
  getFotos(): FotoInfo[];
  getFotosCategorizado(): FotosCategorizado;
}

/**
 * Tipo para validación de Pozo
 */
export interface PozoValidationResult {
  isValid: boolean;
  errors: PozoValidationError[];
  warnings: PozoValidationWarning[];
}

export interface PozoValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface PozoValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Tipo para comparación de Pozos
 */
export interface PozoDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

/**
 * Tipo para búsqueda de Pozos
 */
export interface PozoSearchCriteria {
  idPozo?: string;
  direccion?: string;
  barrio?: string;
  estado?: string;
  sistema?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

/**
 * Tipo para resultado de búsqueda
 */
export interface PozoSearchResult {
  pozos: any[]; // Usar Pozo cuando esté disponible
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Tipo para estadísticas de Pozos
 */
export interface PozoStatistics {
  total: number;
  porEstado: Record<string, number>;
  porSistema: Record<string, number>;
  porBarrio: Record<string, number>;
  conFotos: number;
  sinFotos: number;
  conTuberias: number;
  conSumideros: number;
}
