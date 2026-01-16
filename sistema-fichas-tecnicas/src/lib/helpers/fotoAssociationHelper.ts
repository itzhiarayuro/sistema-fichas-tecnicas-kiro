/**
 * Helper para asociar fotos con pozos
 * Mapea fotos del store global a los pozos basándose en nomenclatura
 * 
 * FIX: Problema #2 - Las fotos no se asociaban con los pozos
 * Las fotos se guardaban en el store global pero pozo.fotos estaba vacío
 * Solución: Crear función que asocie fotos después de cargar
 * 
 * FIX: Problema #3 - Las fotos perdían dataUrl
 * Solo se guardaban los IDs, no los objetos FotoInfo completos
 * Solución: Guardar objetos FotoInfo completos con dataUrl
 */

import type { Pozo, FotoInfo } from '@/types';
import { parseNomenclatura } from '@/lib/parsers/nomenclatura';

/**
 * Asocia fotos del store global con los pozos
 * Modifica los pozos in-place para llenar pozo.fotos con objetos FotoInfo completos
 * 
 * @param pozos - Array de pozos a actualizar
 * @param fotos - Map de fotos del store global (con dataUrl)
 * @returns Array de pozos con fotos asociadas (incluyendo dataUrl)
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
    
    // Categorizar fotos por tipo (guardando objetos FotoInfo completos)
    const fotosCategorizadas = {
      principal: [] as FotoInfo[],
      entradas: [] as FotoInfo[],
      salidas: [] as FotoInfo[],
      sumideros: [] as FotoInfo[],
      otras: [] as FotoInfo[],
    };
    
    fotosDelPozo.forEach(foto => {
      // Crear objeto FotoInfo completo con dataUrl
      const fotoInfo: FotoInfo = {
        idFoto: foto.id || foto.idFoto || `foto-${Date.now()}`,
        idPozo: typeof pozo.idPozo === 'string' ? pozo.idPozo : (pozo.idPozo as any)?.value || '',
        tipoFoto: foto.tipoFoto || 'general',
        rutaArchivo: foto.filename || '',
        fechaCaptura: foto.fechaCaptura || new Date().toISOString(),
        descripcion: foto.descripcion || '',
        dataUrl: foto.dataUrl, // ← IMPORTANTE: Mantener dataUrl
        filename: foto.filename,
      };
      
      // Parsear nomenclatura para determinar categoría
      const nomenclatura = parseNomenclatura(foto.filename || '');
      
      // Guardar el objeto FotoInfo completo en la categoría correspondiente
      switch (nomenclatura.categoria) {
        case 'PRINCIPAL':
          fotosCategorizadas.principal.push(fotoInfo);
          break;
        case 'ENTRADA':
          fotosCategorizadas.entradas.push(fotoInfo);
          break;
        case 'SALIDA':
          fotosCategorizadas.salidas.push(fotoInfo);
          break;
        case 'SUMIDERO':
          fotosCategorizadas.sumideros.push(fotoInfo);
          break;
        default:
          fotosCategorizadas.otras.push(fotoInfo);
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
 * @param foto - Foto a asociar (con dataUrl)
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
  
  // Crear objeto FotoInfo completo con dataUrl
  const fotoInfo: FotoInfo = {
    idFoto: foto.id || foto.idFoto || `foto-${Date.now()}`,
    idPozo: typeof pozo.idPozo === 'string' ? pozo.idPozo : (pozo.idPozo as any)?.value || '',
    tipoFoto: foto.tipoFoto || 'general',
    rutaArchivo: foto.filename || '',
    fechaCaptura: foto.fechaCaptura || new Date().toISOString(),
    descripcion: foto.descripcion || '',
    dataUrl: foto.dataUrl, // ← IMPORTANTE: Mantener dataUrl
    filename: foto.filename,
  };
  
  // Crear copia del pozo con la foto asociada
  const fotosActualizadas = { ...pozo.fotos };
  
  switch (nomenclatura.categoria) {
    case 'PRINCIPAL':
      fotosActualizadas.principal = [...(fotosActualizadas.principal || []), fotoInfo];
      break;
    case 'ENTRADA':
      fotosActualizadas.entradas = [...(fotosActualizadas.entradas || []), fotoInfo];
      break;
    case 'SALIDA':
      fotosActualizadas.salidas = [...(fotosActualizadas.salidas || []), fotoInfo];
      break;
    case 'SUMIDERO':
      fotosActualizadas.sumideros = [...(fotosActualizadas.sumideros || []), fotoInfo];
      break;
    default:
      fotosActualizadas.otras = [...(fotosActualizadas.otras || []), fotoInfo];
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
    principal: (pozo.fotos.principal || []).filter((foto) => {
      const id = typeof foto === 'string' ? foto : (typeof foto.idFoto === 'string' ? foto.idFoto : (foto.idFoto as any)?.value);
      return id !== fotoId;
    }),
    entradas: (pozo.fotos.entradas || []).filter((foto) => {
      const id = typeof foto === 'string' ? foto : (typeof foto.idFoto === 'string' ? foto.idFoto : (foto.idFoto as any)?.value);
      return id !== fotoId;
    }),
    salidas: (pozo.fotos.salidas || []).filter((foto) => {
      const id = typeof foto === 'string' ? foto : (typeof foto.idFoto === 'string' ? foto.idFoto : (foto.idFoto as any)?.value);
      return id !== fotoId;
    }),
    sumideros: (pozo.fotos.sumideros || []).filter((foto) => {
      const id = typeof foto === 'string' ? foto : (typeof foto.idFoto === 'string' ? foto.idFoto : (foto.idFoto as any)?.value);
      return id !== fotoId;
    }),
    otras: (pozo.fotos.otras || []).filter((foto) => {
      const id = typeof foto === 'string' ? foto : (typeof foto.idFoto === 'string' ? foto.idFoto : (foto.idFoto as any)?.value);
      return id !== fotoId;
    }),
  };
  
  return {
    ...pozo,
    fotos: fotosActualizadas,
  };
}
