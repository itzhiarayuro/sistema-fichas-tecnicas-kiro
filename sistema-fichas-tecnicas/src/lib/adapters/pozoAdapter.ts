/**
 * Adaptadores para la estructura de Pozo
 * 
 * Propósito: Mantener la estructura interna jerárquica pero exponer
 * una interfaz plana para compatibilidad con el código existente.
 * 
 * Esto permite:
 * - Cambiar la estructura interna sin afectar el código
 * - Mantener la organización lógica de datos
 * - Evitar duplicación de código
 * - Mejorar la tipificación gradualmente
 */

import { Pozo, FotoInfo, TuberiaInfo, SumideroInfo } from '@/types/pozo';
import { FieldValue } from '@/types/ficha';

/**
 * Estructura interna jerárquica del Pozo
 * Esta es la estructura "real" que se almacena internamente
 */
export interface PozoInterno {
  id: string;
  
  identificacion: {
    idPozo: FieldValue;
    coordenadaX: FieldValue;
    coordenadaY: FieldValue;
    fecha: FieldValue;
    levanto: FieldValue;
    estado: FieldValue;
  };
  
  ubicacion: {
    direccion: FieldValue;
    barrio: FieldValue;
    elevacion: FieldValue;
    profundidad: FieldValue;
  };
  
  componentes: {
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
  };
  
  observaciones: {
    observaciones: FieldValue;
  };
  
  tuberias: TuberiaInfo[];
  sumideros: SumideroInfo[];
  fotos: FotoInfo[];
  
  metadata: {
    createdAt: number;
    updatedAt: number;
    source: 'excel' | 'manual';
    version: number;
  };
}

/**
 * Convierte un Pozo plano a la estructura interna jerárquica
 * Útil cuando se reciben datos del código existente
 */
export function flatToPozoInterno(pozoPlano: Pozo): PozoInterno {
  return {
    id: pozoPlano.id,
    
    identificacion: {
      idPozo: pozoPlano.idPozo,
      coordenadaX: pozoPlano.coordenadaX,
      coordenadaY: pozoPlano.coordenadaY,
      fecha: pozoPlano.fecha,
      levanto: pozoPlano.levanto,
      estado: pozoPlano.estado,
    },
    
    ubicacion: {
      direccion: pozoPlano.direccion,
      barrio: pozoPlano.barrio,
      elevacion: pozoPlano.elevacion,
      profundidad: pozoPlano.profundidad,
    },
    
    componentes: {
      existeTapa: pozoPlano.existeTapa,
      estadoTapa: pozoPlano.estadoTapa,
      existeCilindro: pozoPlano.existeCilindro,
      diametroCilindro: pozoPlano.diametroCilindro,
      sistema: pozoPlano.sistema,
      anoInstalacion: pozoPlano.anoInstalacion,
      tipoCamara: pozoPlano.tipoCamara,
      estructuraPavimento: pozoPlano.estructuraPavimento,
      materialTapa: pozoPlano.materialTapa,
      existeCono: pozoPlano.existeCono,
      tipoCono: pozoPlano.tipoCono,
      materialCono: pozoPlano.materialCono,
      estadoCono: pozoPlano.estadoCono,
      materialCilindro: pozoPlano.materialCilindro,
      estadoCilindro: pozoPlano.estadoCilindro,
      existeCanuela: pozoPlano.existeCanuela,
      materialCanuela: pozoPlano.materialCanuela,
      estadoCanuela: pozoPlano.estadoCanuela,
      existePeldanos: pozoPlano.existePeldanos,
      materialPeldanos: pozoPlano.materialPeldanos,
      numeroPeldanos: pozoPlano.numeroPeldanos,
      estadoPeldanos: pozoPlano.estadoPeldanos,
    },
    
    observaciones: {
      observaciones: pozoPlano.observaciones,
    },
    
    tuberias: pozoPlano.tuberias,
    sumideros: pozoPlano.sumideros,
    
    fotos: convertirFotosPlanaAInterno(pozoPlano.fotos),
    
    metadata: pozoPlano.metadata,
  };
}

/**
 * Convierte la estructura interna jerárquica a un Pozo plano
 * Útil cuando se necesita exponer datos al código existente
 */
export function pozoInternoAFlat(pozoInterno: PozoInterno): Pozo {
  return {
    id: pozoInterno.id,
    
    // Identificación
    idPozo: pozoInterno.identificacion.idPozo,
    coordenadaX: pozoInterno.identificacion.coordenadaX,
    coordenadaY: pozoInterno.identificacion.coordenadaY,
    fecha: pozoInterno.identificacion.fecha,
    levanto: pozoInterno.identificacion.levanto,
    estado: pozoInterno.identificacion.estado,
    
    // Ubicación
    direccion: pozoInterno.ubicacion.direccion,
    barrio: pozoInterno.ubicacion.barrio,
    elevacion: pozoInterno.ubicacion.elevacion,
    profundidad: pozoInterno.ubicacion.profundidad,
    
    // Componentes
    existeTapa: pozoInterno.componentes.existeTapa,
    estadoTapa: pozoInterno.componentes.estadoTapa,
    existeCilindro: pozoInterno.componentes.existeCilindro,
    diametroCilindro: pozoInterno.componentes.diametroCilindro,
    sistema: pozoInterno.componentes.sistema,
    anoInstalacion: pozoInterno.componentes.anoInstalacion,
    tipoCamara: pozoInterno.componentes.tipoCamara,
    estructuraPavimento: pozoInterno.componentes.estructuraPavimento,
    materialTapa: pozoInterno.componentes.materialTapa,
    existeCono: pozoInterno.componentes.existeCono,
    tipoCono: pozoInterno.componentes.tipoCono,
    materialCono: pozoInterno.componentes.materialCono,
    estadoCono: pozoInterno.componentes.estadoCono,
    materialCilindro: pozoInterno.componentes.materialCilindro,
    estadoCilindro: pozoInterno.componentes.estadoCilindro,
    existeCanuela: pozoInterno.componentes.existeCanuela,
    materialCanuela: pozoInterno.componentes.materialCanuela,
    estadoCanuela: pozoInterno.componentes.estadoCanuela,
    existePeldanos: pozoInterno.componentes.existePeldanos,
    materialPeldanos: pozoInterno.componentes.materialPeldanos,
    numeroPeldanos: pozoInterno.componentes.numeroPeldanos,
    estadoPeldanos: pozoInterno.componentes.estadoPeldanos,
    
    // Observaciones
    observaciones: pozoInterno.observaciones.observaciones,
    
    // Relaciones
    tuberias: pozoInterno.tuberias,
    sumideros: pozoInterno.sumideros,
    fotos: convertirFotosInternoAPlana(pozoInterno.fotos),
    
    // Metadatos
    metadata: pozoInterno.metadata,
  };
}

/**
 * Convierte fotos de formato plano (con categorías) a formato interno (array)
 */
function convertirFotosPlanaAInterno(
  fotosPlana: Pozo['fotos']
): FotoInfo[] {
  const fotos: FotoInfo[] = [];
  
  if (fotosPlana.principal) {
    fotos.push(
      ...fotosPlana.principal.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('tapa'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de tapa'),
      }))
    );
  }
  
  if (fotosPlana.entradas) {
    fotos.push(
      ...fotosPlana.entradas.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('entrada'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de entrada'),
      }))
    );
  }
  
  if (fotosPlana.salidas) {
    fotos.push(
      ...fotosPlana.salidas.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('salida'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de salida'),
      }))
    );
  }
  
  if (fotosPlana.sumideros) {
    fotos.push(
      ...fotosPlana.sumideros.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('sumidero'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Foto de sumidero'),
      }))
    );
  }
  
  if (fotosPlana.otras) {
    fotos.push(
      ...fotosPlana.otras.map((ruta) => ({
        idFoto: createFieldValue(`FOTO-${Date.now()}-${Math.random()}`),
        idPozo: createFieldValue(''),
        tipoFoto: createFieldValue('otro'),
        rutaArchivo: createFieldValue(ruta),
        fechaCaptura: createFieldValue(new Date().toISOString()),
        descripcion: createFieldValue('Otra foto'),
      }))
    );
  }
  
  return fotos;
}

/**
 * Convierte fotos de formato interno (array) a formato plano (con categorías)
 */
function convertirFotosInternoAPlana(fotos: FotoInfo[]): Pozo['fotos'] {
  const fotosPlana: Pozo['fotos'] = {};
  
  for (const foto of fotos) {
    const tipoFoto = typeof foto.tipoFoto === 'string' ? foto.tipoFoto : foto.tipoFoto.value;
    const rutaArchivo = typeof foto.rutaArchivo === 'string' ? foto.rutaArchivo : foto.rutaArchivo.value;
    
    switch (tipoFoto) {
      case 'tapa':
        if (!fotosPlana.principal) fotosPlana.principal = [];
        fotosPlana.principal.push(rutaArchivo);
        break;
      case 'entrada':
        if (!fotosPlana.entradas) fotosPlana.entradas = [];
        fotosPlana.entradas.push(rutaArchivo);
        break;
      case 'salida':
        if (!fotosPlana.salidas) fotosPlana.salidas = [];
        fotosPlana.salidas.push(rutaArchivo);
        break;
      case 'sumidero':
        if (!fotosPlana.sumideros) fotosPlana.sumideros = [];
        fotosPlana.sumideros.push(rutaArchivo);
        break;
      default:
        if (!fotosPlana.otras) fotosPlana.otras = [];
        fotosPlana.otras.push(rutaArchivo);
    }
  }
  
  return fotosPlana;
}

/**
 * Obtiene un valor de FieldValue de forma segura
 * Maneja tanto strings como objetos FieldValue
 */
export function getFieldValue(value: FieldValue | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'value' in value) return String(value.value);
  return String(value);
}

/**
 * Crea un FieldValue a partir de un string
 */
export function createFieldValue(value: string | number | boolean): FieldValue {
  return {
    value: String(value),
    source: 'manual',
    modifiedAt: Date.now(),
  };
}
