/**
 * Implementación de PozoAccessor
 * Proporciona acceso seguro a propiedades de Pozo con conversión automática de tipos
 */

import { Pozo, FotoInfo } from '@/types/pozo';
import { PozoAccessor, FotosCategorizado } from '@/types/pozoTypes';
import { FieldValue } from '@/types/ficha';

/**
 * Convierte un FieldValue a string de forma segura
 */
function fieldValueToString(value: FieldValue | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'value' in value) return String(value.value);
  return String(value);
}

/**
 * Crea un FieldValue a partir de un string
 */
function createFieldValue(value: string): FieldValue {
  return {
    value,
    source: 'manual',
    modifiedAt: Date.now(),
  };
}

/**
 * Crea un accessor para un Pozo
 */
export function createPozoAccessor(pozo: Pozo): PozoAccessor {
  return {
    // Identificación
    getIdPozo: () => fieldValueToString(pozo.idPozo),
    getCoordenadaX: () => fieldValueToString(pozo.coordenadaX),
    getCoordenadaY: () => fieldValueToString(pozo.coordenadaY),
    getFecha: () => fieldValueToString(pozo.fecha),
    getLevanto: () => fieldValueToString(pozo.levanto),
    getEstado: () => fieldValueToString(pozo.estado),
    
    // Ubicación
    getDireccion: () => fieldValueToString(pozo.direccion),
    getBarrio: () => fieldValueToString(pozo.barrio),
    getElevacion: () => fieldValueToString(pozo.elevacion),
    getProfundidad: () => fieldValueToString(pozo.profundidad),
    
    // Componentes
    getExisteTapa: () => fieldValueToString(pozo.existeTapa),
    getEstadoTapa: () => fieldValueToString(pozo.estadoTapa),
    getExisteCilindro: () => fieldValueToString(pozo.existeCilindro),
    getDiametroCilindro: () => fieldValueToString(pozo.diametroCilindro),
    getSistema: () => fieldValueToString(pozo.sistema),
    getAnoInstalacion: () => fieldValueToString(pozo.anoInstalacion),
    getTipoCamara: () => fieldValueToString(pozo.tipoCamara),
    getEstructuraPavimento: () => fieldValueToString(pozo.estructuraPavimento),
    getMaterialTapa: () => fieldValueToString(pozo.materialTapa),
    getExisteCono: () => fieldValueToString(pozo.existeCono),
    getTipoCono: () => fieldValueToString(pozo.tipoCono),
    getMaterialCono: () => fieldValueToString(pozo.materialCono),
    getEstadoCono: () => fieldValueToString(pozo.estadoCono),
    getMaterialCilindro: () => fieldValueToString(pozo.materialCilindro),
    getEstadoCilindro: () => fieldValueToString(pozo.estadoCilindro),
    getExisteCanuela: () => fieldValueToString(pozo.existeCanuela),
    getMaterialCanuela: () => fieldValueToString(pozo.materialCanuela),
    getEstadoCanuela: () => fieldValueToString(pozo.estadoCanuela),
    getExistePeldanos: () => fieldValueToString(pozo.existePeldanos),
    getMaterialPeldanos: () => fieldValueToString(pozo.materialPeldanos),
    getNumeroPeldanos: () => fieldValueToString(pozo.numeroPeldanos),
    getEstadoPeldanos: () => fieldValueToString(pozo.estadoPeldanos),
    
    // Observaciones
    getObservaciones: () => fieldValueToString(pozo.observaciones),
    
    // Relaciones
    getTuberias: () => pozo.tuberias || [],
    getSumideros: () => pozo.sumideros || [],
    getFotos: () => {
      // Si fotos es un array, devolverlo directamente
      if (Array.isArray(pozo.fotos)) {
        return pozo.fotos;
      }
      // Si fotos es un objeto categorizado, convertirlo a array
      return convertirFotosCategoriadoAArray(pozo.fotos);
    },
    getFotosCategorizado: () => {
      // Si fotos es un objeto categorizado, devolverlo directamente
      if (!Array.isArray(pozo.fotos)) {
        return pozo.fotos;
      }
      // Si fotos es un array, convertirlo a categorizado
      return convertirFotosArrayACategorizado(pozo.fotos);
    },
  };
}

/**
 * Convierte fotos categorizadas a array
 */
function convertirFotosCategoriadoAArray(fotos: FotosCategorizado): FotoInfo[] {
  const resultado: FotoInfo[] = [];
  
  if (fotos.principal) {
    resultado.push(
      ...fotos.principal.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('tapa'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de tapa'),
      }))
    );
  }
  
  if (fotos.entradas) {
    resultado.push(
      ...fotos.entradas.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('entrada'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de entrada'),
      }))
    );
  }
  
  if (fotos.salidas) {
    resultado.push(
      ...fotos.salidas.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('salida'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de salida'),
      }))
    );
  }
  
  if (fotos.sumideros) {
    resultado.push(
      ...fotos.sumideros.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('sumidero'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de sumidero'),
      }))
    );
  }
  
  if (fotos.otras) {
    resultado.push(
      ...fotos.otras.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('otro'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Otra foto'),
      }))
    );
  }
  
  return resultado;
}

/**
 * Convierte fotos array a categorizado
 */
function convertirFotosArrayACategorizado(fotos: FotoInfo[]): FotosCategorizado {
  const resultado: FotosCategorizado = {};
  
  for (const foto of fotos) {
    const tipoFoto = fieldValueToString(foto.tipoFoto);
    const rutaArchivo = fieldValueToString(foto.rutaArchivo);
    
    switch (tipoFoto) {
      case 'tapa':
        if (!resultado.principal) resultado.principal = [];
        resultado.principal.push(rutaArchivo);
        break;
      case 'entrada':
        if (!resultado.entradas) resultado.entradas = [];
        resultado.entradas.push(rutaArchivo);
        break;
      case 'salida':
        if (!resultado.salidas) resultado.salidas = [];
        resultado.salidas.push(rutaArchivo);
        break;
      case 'sumidero':
        if (!resultado.sumideros) resultado.sumideros = [];
        resultado.sumideros.push(rutaArchivo);
        break;
      default:
        if (!resultado.otras) resultado.otras = [];
        resultado.otras.push(rutaArchivo);
    }
  }
  
  return resultado;
}
