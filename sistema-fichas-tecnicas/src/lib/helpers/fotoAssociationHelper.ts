/**
 * Helper para asociar fotos con pozos
 * Mapea fotos del store global a los pozos basándose en nomenclatura
 * 
 * FIX: Problema #2 - Las fotos no se asociaban con los pozos
 * Las fotos se guardaban en el store global pero pozo.fotos estaba vacío
 * Solución: Crear función que asocie fotos después de cargar
 */

import type { Pozo, FotoInfo } from '@/types';
import { parseNomenclatura } from '@/lib/parsers/nomenclatura';

/**
 * Asocia fotos del store global con los pozos
 * Modifica los pozos in-place para llenar pozo.fotos
 * 
 * @param pozos - Array de pozos a actualizar
 * @param fotos - Map de fotos del store global
 * @returns Array de pozos con fotos asociadas
 */
export function associatePhotosWithPozos(
  pozos: Pozo[],
  fotos: Map<string, any>
): Pozo[] {
  // Convertir Map a array para iterar
  const fotosArray = Array.from(fotos.values());
  
  // Para cada pozo, buscar fotos que coincidan
  return pozos.map(pozo => {
    // Extraer código del pozo (ej: "pozo-M680-1234567890-0" -> "M680")
    const pozoCodigoMatch = pozo.id.match(/^pozo-([A-Z]\d+)/);
    const pozoCodigo = pozoCodigoMatch ? pozoCodigoMatch[1] : '';
    
    if (!pozoCodigo) {
      console.warn(`[associatePhotosWithPozos] No se pudo extraer código del pozo: ${pozo.id}`);
      return pozo;
    }
    
    // Buscar fotos que coincidan con este pozo
    const fotosDelPozo = fotosArray.filter(foto => {
      if (!foto.filename) return false;
      
      // Extraer código del filename (ej: "M680-P.jpg" -> "M680")
      const fotoCodigoMatch = foto.filename.match(/^([A-Z]\d+)/);
      const fotoCodigo = fotoCodigoMatch ? fotoCodigoMatch[1] : '';
      
      return fotoCodigo.toUpperCase() === pozoCodigo.toUpperCase();
    });
    
    // Categorizar fotos por tipo
    const fotosCategorizadas = {
      principal: [] as string[],
      entradas: [] as string[],
      salidas: [] as string[],
      sumideros: [] as string[],
      otras: [] as string[],
    };
    
    fotosDelPozo.forEach(foto => {
      // Usar el ID de la foto (puede ser 'id' o 'idFoto' dependiendo de la estructura)
      const fotoId = (foto as any).id || (foto as any).idFoto;
      if (!fotoId) return;
      
      // Parsear nomenclatura para determinar categoría
      const nomenclatura = parseNomenclatura(foto.filename || '');
      
      // Guardar el ID de la foto en la categoría correspondiente
      switch (nomenclatura.categoria) {
        case 'PRINCIPAL':
          fotosCategorizadas.principal.push(fotoId);
          break;
        case 'ENTRADA':
          fotosCategorizadas.entradas.push(fotoId);
          break;
        case 'SALIDA':
          fotosCategorizadas.salidas.push(fotoId);
          break;
        case 'SUMIDERO':
          fotosCategorizadas.sumideros.push(fotoId);
          break;
        default:
          fotosCategorizadas.otras.push(fotoId);
      }
    });
    
    // Actualizar el pozo con las fotos asociadas
    return {
      ...pozo,
      fotos: fotosCategorizadas,
    };
  });
}

/**
 * Asocia una foto individual con un pozo
 * Útil cuando se agrega una foto después de la carga inicial
 * 
 * @param pozo - Pozo a actualizar
 * @param foto - Foto a asociar
 * @returns Pozo actualizado
 */
export function associatePhotoWithPozo(pozo: Pozo, foto: any): Pozo {
  // Extraer código del pozo
  const pozoCodigoMatch = pozo.id.match(/^pozo-([A-Z]\d+)/);
  const pozoCodigo = pozoCodigoMatch ? pozoCodigoMatch[1] : '';
  
  if (!pozoCodigo || !foto.filename) {
    return pozo;
  }
  
  // Extraer código del filename
  const fotoCodigoMatch = foto.filename.match(/^([A-Z]\d+)/);
  const fotoCodigo = fotoCodigoMatch ? fotoCodigoMatch[1] : '';
  
  // Si no coinciden, no asociar
  if (fotoCodigo.toUpperCase() !== pozoCodigo.toUpperCase()) {
    return pozo;
  }
  
  // Parsear nomenclatura para determinar categoría
  const nomenclatura = parseNomenclatura(foto.filename);
  
  // Usar el ID de la foto
  const fotoId = foto.id || foto.idFoto;
  if (!fotoId) return pozo;
  
  // Crear copia del pozo con la foto asociada
  const fotosActualizadas = { ...pozo.fotos };
  
  switch (nomenclatura.categoria) {
    case 'PRINCIPAL':
      fotosActualizadas.principal = [...(fotosActualizadas.principal || []), fotoId];
      break;
    case 'ENTRADA':
      fotosActualizadas.entradas = [...(fotosActualizadas.entradas || []), fotoId];
      break;
    case 'SALIDA':
      fotosActualizadas.salidas = [...(fotosActualizadas.salidas || []), fotoId];
      break;
    case 'SUMIDERO':
      fotosActualizadas.sumideros = [...(fotosActualizadas.sumideros || []), fotoId];
      break;
    default:
      fotosActualizadas.otras = [...(fotosActualizadas.otras || []), fotoId];
  }
  
  return {
    ...pozo,
    fotos: fotosActualizadas,
  };
}

/**
 * Desasocia una foto de un pozo
 * Útil cuando se elimina una foto
 * 
 * @param pozo - Pozo a actualizar
 * @param fotoId - ID de la foto a desasociar
 * @returns Pozo actualizado
 */
export function disassociatePhotoFromPozo(pozo: Pozo, fotoId: string): Pozo {
  const fotosActualizadas = {
    principal: (pozo.fotos.principal || []).filter(id => id !== fotoId),
    entradas: (pozo.fotos.entradas || []).filter(id => id !== fotoId),
    salidas: (pozo.fotos.salidas || []).filter(id => id !== fotoId),
    sumideros: (pozo.fotos.sumideros || []).filter(id => id !== fotoId),
    otras: (pozo.fotos.otras || []).filter(id => id !== fotoId),
  };
  
  return {
    ...pozo,
    fotos: fotosActualizadas,
  };
}
