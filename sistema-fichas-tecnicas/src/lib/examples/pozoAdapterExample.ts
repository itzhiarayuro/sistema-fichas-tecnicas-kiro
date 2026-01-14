/**
 * Ejemplos de uso de los adaptadores de Pozo
 * 
 * Este archivo muestra cómo usar los adaptadores para:
 * 1. Acceso seguro a propiedades
 * 2. Conversión entre estructuras
 * 3. Manejo de fotos
 * 4. Validación de datos
 */

import { Pozo } from '@/types/pozo';
import { createPozoAccessor } from '@/lib/helpers/pozoAccessor';
import { flatToPozoInterno, pozoInternoAFlat, getFieldValue } from '@/lib/adapters/pozoAdapter';

/**
 * Ejemplo 1: Acceso seguro a propiedades
 * 
 * Usa PozoAccessor para acceder a valores de forma segura
 * sin preocuparse por el tipo de FieldValue
 */
export function ejemplo1_AccesoSeguro(pozo: Pozo) {
  const accessor = createPozoAccessor(pozo);
  
  // Acceso seguro - siempre retorna string
  const idPozo = accessor.getIdPozo();
  const direccion = accessor.getDireccion();
  const barrio = accessor.getBarrio();
  const estado = accessor.getEstado();
  
  console.log(`Pozo: ${idPozo}`);
  console.log(`Ubicación: ${direccion}, ${barrio}`);
  console.log(`Estado: ${estado}`);
  
  // Acceso a relaciones
  const tuberias = accessor.getTuberias();
  const sumideros = accessor.getSumideros();
  const fotos = accessor.getFotosCategorizado();
  
  console.log(`Tuberías: ${tuberias.length}`);
  console.log(`Sumideros: ${sumideros.length}`);
  console.log(`Fotos principales: ${fotos.principal?.length || 0}`);
}

/**
 * Ejemplo 2: Conversión a estructura interna
 * 
 * Convierte un Pozo plano a la estructura interna jerárquica
 * Útil para procesamiento interno o almacenamiento
 */
export function ejemplo2_ConversionAInterno(pozo: Pozo) {
  // Convertir a estructura interna
  const pozoInterno = flatToPozoInterno(pozo);
  
  // Acceso a estructura jerárquica
  console.log('Identificación:');
  console.log(`  ID: ${getFieldValue(pozoInterno.identificacion.idPozo)}`);
  console.log(`  Coordenadas: (${getFieldValue(pozoInterno.identificacion.coordenadaX)}, ${getFieldValue(pozoInterno.identificacion.coordenadaY)})`);
  
  console.log('Ubicación:');
  console.log(`  Dirección: ${getFieldValue(pozoInterno.ubicacion.direccion)}`);
  console.log(`  Barrio: ${getFieldValue(pozoInterno.ubicacion.barrio)}`);
  
  console.log('Componentes:');
  console.log(`  Existe tapa: ${getFieldValue(pozoInterno.componentes.existeTapa)}`);
  console.log(`  Estado tapa: ${getFieldValue(pozoInterno.componentes.estadoTapa)}`);
}

/**
 * Ejemplo 3: Conversión de vuelta a plano
 * 
 * Convierte la estructura interna de vuelta a plano
 * Útil para exponer datos al código existente
 */
export function ejemplo3_ConversionAPlano(pozo: Pozo) {
  // Convertir a interno
  const pozoInterno = flatToPozoInterno(pozo);
  
  // Hacer cambios en la estructura interna
  pozoInterno.componentes.estadoTapa = {
    value: 'Malo',
    source: 'manual',
    modifiedAt: Date.now(),
  };
  
  // Convertir de vuelta a plano
  const pozoActualizado = pozoInternoAFlat(pozoInterno);
  
  // El código existente puede usar el Pozo actualizado
  console.log(`Estado tapa actualizado: ${getFieldValue(pozoActualizado.estadoTapa)}`);
}

/**
 * Ejemplo 4: Manejo de fotos
 * 
 * Demuestra cómo trabajar con fotos en ambos formatos
 */
export function ejemplo4_ManejoDeFotos(pozo: Pozo) {
  const accessor = createPozoAccessor(pozo);
  
  // Acceso a fotos categorizadas
  const fotos = accessor.getFotosCategorizado();
  
  console.log('Fotos por categoría:');
  console.log(`  Principales: ${fotos.principal?.length || 0}`);
  console.log(`  Entradas: ${fotos.entradas?.length || 0}`);
  console.log(`  Salidas: ${fotos.salidas?.length || 0}`);
  console.log(`  Sumideros: ${fotos.sumideros?.length || 0}`);
  console.log(`  Otras: ${fotos.otras?.length || 0}`);
  
  // Acceso a fotos como array
  const fotosArray = accessor.getFotos();
  console.log(`Total de fotos: ${fotosArray.length}`);
  
  // Iterar sobre fotos
  fotosArray.forEach((foto) => {
    const tipoFoto = getFieldValue(foto.tipoFoto);
    const ruta = getFieldValue(foto.rutaArchivo);
    console.log(`  - ${tipoFoto}: ${ruta}`);
  });
}

/**
 * Ejemplo 5: Validación de datos
 * 
 * Demuestra cómo validar datos de un Pozo
 */
export function ejemplo5_ValidacionDatos(pozo: Pozo) {
  const accessor = createPozoAccessor(pozo);
  
  // Validar campos obligatorios
  const idPozo = accessor.getIdPozo();
  const direccion = accessor.getDireccion();
  const barrio = accessor.getBarrio();
  
  const errores: string[] = [];
  
  if (!idPozo) errores.push('ID del pozo es obligatorio');
  if (!direccion) errores.push('Dirección es obligatoria');
  if (!barrio) errores.push('Barrio es obligatorio');
  
  // Validar campos numéricos
  const profundidad = accessor.getProfundidad();
  if (profundidad && isNaN(Number(profundidad))) {
    errores.push('Profundidad debe ser un número');
  }
  
  // Validar relaciones
  const tuberias = accessor.getTuberias();
  if (tuberias.length === 0) {
    console.warn('Advertencia: El pozo no tiene tuberías');
  }
  
  if (errores.length > 0) {
    console.error('Errores de validación:');
    errores.forEach((error) => console.error(`  - ${error}`));
  } else {
    console.log('✓ Validación exitosa');
  }
}

/**
 * Ejemplo 6: Búsqueda y filtrado
 * 
 * Demuestra cómo buscar y filtrar pozos
 */
export function ejemplo6_BusquedaYFiltrado(pozos: Pozo[], criterio: string) {
  const resultados = pozos.filter((pozo) => {
    const accessor = createPozoAccessor(pozo);
    
    const idPozo = accessor.getIdPozo().toLowerCase();
    const direccion = accessor.getDireccion().toLowerCase();
    const barrio = accessor.getBarrio().toLowerCase();
    
    const criterioLower = criterio.toLowerCase();
    
    return (
      idPozo.includes(criterioLower) ||
      direccion.includes(criterioLower) ||
      barrio.includes(criterioLower)
    );
  });
  
  console.log(`Encontrados ${resultados.length} pozos que coinciden con "${criterio}"`);
  resultados.forEach((pozo) => {
    const accessor = createPozoAccessor(pozo);
    console.log(`  - ${accessor.getIdPozo()}: ${accessor.getDireccion()}`);
  });
}

/**
 * Ejemplo 7: Generación de reporte
 * 
 * Demuestra cómo generar un reporte de un Pozo
 */
export function ejemplo7_GeneracionDeReporte(pozo: Pozo): string {
  const accessor = createPozoAccessor(pozo);
  
  const lineas: string[] = [];
  
  lineas.push('='.repeat(50));
  lineas.push('REPORTE DE POZO');
  lineas.push('='.repeat(50));
  
  lineas.push('');
  lineas.push('IDENTIFICACIÓN');
  lineas.push(`  ID: ${accessor.getIdPozo()}`);
  lineas.push(`  Fecha: ${accessor.getFecha()}`);
  lineas.push(`  Inspector: ${accessor.getLevanto()}`);
  lineas.push(`  Estado: ${accessor.getEstado()}`);
  
  lineas.push('');
  lineas.push('UBICACIÓN');
  lineas.push(`  Dirección: ${accessor.getDireccion()}`);
  lineas.push(`  Barrio: ${accessor.getBarrio()}`);
  lineas.push(`  Elevación: ${accessor.getElevacion()} m`);
  lineas.push(`  Profundidad: ${accessor.getProfundidad()} m`);
  
  lineas.push('');
  lineas.push('COMPONENTES');
  lineas.push(`  Existe tapa: ${accessor.getExisteTapa()}`);
  lineas.push(`  Estado tapa: ${accessor.getEstadoTapa()}`);
  lineas.push(`  Existe cilindro: ${accessor.getExisteCilindro()}`);
  lineas.push(`  Diámetro cilindro: ${accessor.getDiametroCilindro()} m`);
  
  lineas.push('');
  lineas.push('RELACIONES');
  lineas.push(`  Tuberías: ${accessor.getTuberias().length}`);
  lineas.push(`  Sumideros: ${accessor.getSumideros().length}`);
  
  const fotos = accessor.getFotosCategorizado();
  lineas.push(`  Fotos: ${(fotos.principal?.length || 0) + (fotos.entradas?.length || 0) + (fotos.salidas?.length || 0) + (fotos.sumideros?.length || 0) + (fotos.otras?.length || 0)}`);
  
  lineas.push('');
  lineas.push('OBSERVACIONES');
  lineas.push(`  ${accessor.getObservaciones()}`);
  
  lineas.push('');
  lineas.push('='.repeat(50));
  
  return lineas.join('\n');
}

/**
 * Ejemplo 8: Comparación de pozos
 * 
 * Demuestra cómo comparar dos pozos
 */
export function ejemplo8_ComparacionDePozos(pozo1: Pozo, pozo2: Pozo) {
  const accessor1 = createPozoAccessor(pozo1);
  const accessor2 = createPozoAccessor(pozo2);
  
  const cambios: string[] = [];
  
  // Comparar identificación
  if (accessor1.getIdPozo() !== accessor2.getIdPozo()) {
    cambios.push(`ID: ${accessor1.getIdPozo()} → ${accessor2.getIdPozo()}`);
  }
  
  // Comparar ubicación
  if (accessor1.getDireccion() !== accessor2.getDireccion()) {
    cambios.push(`Dirección: ${accessor1.getDireccion()} → ${accessor2.getDireccion()}`);
  }
  
  // Comparar componentes
  if (accessor1.getEstadoTapa() !== accessor2.getEstadoTapa()) {
    cambios.push(`Estado tapa: ${accessor1.getEstadoTapa()} → ${accessor2.getEstadoTapa()}`);
  }
  
  if (cambios.length === 0) {
    console.log('No hay cambios entre los pozos');
  } else {
    console.log('Cambios detectados:');
    cambios.forEach((cambio) => console.log(`  - ${cambio}`));
  }
}
