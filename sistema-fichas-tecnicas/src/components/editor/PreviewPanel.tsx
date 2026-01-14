/**
 * PreviewPanel - Panel de vista previa en tiempo real
 * Requirements: 4.1
 * 
 * Renderiza la ficha técnica en formato de vista previa,
 * sincronizada en tiempo real con el editor.
 * 
 * Características:
 * - Renderizado en tiempo real de cambios
 * - Formato similar al PDF final
 * - Soporte para personalización de estilos
 * - Indicadores de campos editados
 */

'use client';

import { useMemo } from 'react';
import type { FichaState, FichaSection, FieldValue, FichaCustomization } from '@/types/ficha';
import type { Pozo, FotoInfo } from '@/types/pozo';

interface PreviewPanelProps {
  /** Estado de la ficha (sincronizado) */
  fichaState?: FichaState | null;
  /** Datos del pozo (fallback si no hay fichaState) */
  pozo: Pozo;
  /** Personalizaciones de formato */
  customizations?: FichaCustomization;
  /** Mostrar indicadores de campos editados */
  showEditIndicators?: boolean;
  /** Escala de zoom (1 = 100%) */
  zoom?: number;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Obtiene el valor de un campo desde el estado de la ficha o el pozo
 */
function getFieldValue(
  fichaState: FichaState | null | undefined,
  sectionType: string,
  field: string,
  fallback: string
): { value: string; source: FieldValue['source']; isEdited: boolean } {
  if (!fichaState) {
    return { value: fallback, source: 'excel', isEdited: false };
  }

  const section = fichaState.sections.find((s) => s.type === sectionType);
  if (!section || !section.content[field]) {
    return { value: fallback, source: 'default', isEdited: false };
  }

  const fieldValue = section.content[field];
  return {
    value: fieldValue.value || fallback,
    source: fieldValue.source,
    isEdited: fieldValue.source === 'manual',
  };
}

/**
 * Componente para mostrar un campo con indicador de edición
 */
function FieldDisplay({
  label,
  value,
  isEdited,
  showIndicator,
  suffix,
}: {
  label: string;
  value: string;
  isEdited: boolean;
  showIndicator: boolean;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <span className="text-gray-500">{label}:</span>
      <span className={`ml-2 font-medium ${isEdited && showIndicator ? 'text-amber-700' : ''}`}>
        {value || <span className="text-gray-400 italic">Sin datos</span>}
        {suffix && value && ` ${suffix}`}
      </span>
      {isEdited && showIndicator && (
        <span className="ml-1 inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" title="Campo editado" />
      )}
    </div>
  );
}

export function PreviewPanel({
  fichaState,
  pozo,
  customizations,
  showEditIndicators = true,
  zoom = 1,
  className = '',
}: PreviewPanelProps) {
  // Estilos personalizados
  const styles = useMemo(() => {
    const colors = customizations?.colors ?? {
      headerBg: '#1F4E79',
      headerText: '#FFFFFF',
      sectionBg: '#FFFFFF',
      sectionText: '#333333',
      labelText: '#666666',
      valueText: '#000000',
      borderColor: '#E5E7EB',
    };

    const fonts = customizations?.fonts ?? {
      titleSize: 16,
      labelSize: 12,
      valueSize: 12,
      fontFamily: 'Inter',
    };

    const spacing = customizations?.spacing ?? {
      sectionGap: 16,
      fieldGap: 8,
      padding: 16,
      margin: 24,
    };

    return { colors, fonts, spacing };
  }, [customizations]);

  // Obtener valores de campos con trazabilidad
  const identificacion = useMemo(() => ({
    codigo: getFieldValue(fichaState, 'identificacion', 'codigo', pozo.idPozo),
    direccion: getFieldValue(fichaState, 'identificacion', 'direccion', pozo.direccion),
    barrio: getFieldValue(fichaState, 'identificacion', 'barrio', pozo.barrio),
    sistema: getFieldValue(fichaState, 'identificacion', 'sistema', pozo.sistema),
    estado: getFieldValue(fichaState, 'identificacion', 'estado', pozo.estado),
    fecha: getFieldValue(fichaState, 'identificacion', 'fecha', pozo.fecha),
  }), [fichaState, pozo]);

  const estructura = useMemo(() => ({
    alturaTotal: getFieldValue(fichaState, 'estructura', 'alturaTotal', pozo.elevacion),
    rasante: getFieldValue(fichaState, 'estructura', 'rasante', pozo.profundidad),
    tapaMaterial: getFieldValue(fichaState, 'estructura', 'tapaMaterial', pozo.materialTapa),
    tapaEstado: getFieldValue(fichaState, 'estructura', 'tapaEstado', pozo.estadoTapa),
    conoTipo: getFieldValue(fichaState, 'estructura', 'conoTipo', pozo.tipoCono),
    conoMaterial: getFieldValue(fichaState, 'estructura', 'conoMaterial', pozo.materialCono),
    cuerpoDiametro: getFieldValue(fichaState, 'estructura', 'cuerpoDiametro', pozo.diametroCilindro),
    canuelaMaterial: getFieldValue(fichaState, 'estructura', 'canuelaMaterial', pozo.materialCanuela),
    peldanosCantidad: getFieldValue(fichaState, 'estructura', 'peldanosCantidad', pozo.numeroPeldanos),
    peldanosMaterial: getFieldValue(fichaState, 'estructura', 'peldanosMaterial', pozo.materialPeldanos),
  }), [fichaState, pozo]);

  const observaciones = useMemo(() => 
    getFieldValue(fichaState, 'observaciones', 'texto', pozo.observaciones),
  [fichaState, pozo]);

  // Obtener fotos (pueden venir del estado de la ficha o del pozo)
  const fotos = useMemo(() => {
    // Por ahora usamos las fotos del pozo directamente
    // En el futuro, esto podría venir del estado de la ficha
    return {
      principal: pozo.fotos.principal,
      entradas: pozo.fotos.entradas,
      salidas: pozo.fotos.salidas,
      sumideros: pozo.fotos.sumideros,
      otras: pozo.fotos.otras,
    };
  }, [pozo.fotos]);

  // Todas las fotos para el grid
  const allPhotos = useMemo(() => [
    ...fotos.principal,
    ...fotos.entradas,
    ...fotos.salidas,
    ...fotos.sumideros,
    ...fotos.otras,
  ].slice(0, 6), [fotos]);

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{ 
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        fontFamily: styles.fonts.fontFamily,
      }}
    >
      {/* Contenedor con padding */}
      <div style={{ padding: styles.spacing.margin }}>
        {/* Header de la ficha */}
        <div 
          className="pb-4 mb-6"
          style={{ borderBottom: `2px solid ${styles.colors.headerBg}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="font-bold"
                style={{ 
                  fontSize: styles.fonts.titleSize + 8,
                  color: styles.colors.headerBg,
                }}
              >
                FICHA TÉCNICA DE POZO
              </h1>
              <p style={{ color: styles.colors.labelText }}>
                Sistema de Alcantarillado
              </p>
            </div>
            <div className="text-right">
              <p 
                className="font-semibold"
                style={{ 
                  fontSize: styles.fonts.titleSize,
                  color: styles.colors.sectionText,
                }}
              >
                {identificacion.codigo.value}
                {identificacion.codigo.isEdited && showEditIndicators && (
                  <span className="ml-1 inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
                )}
              </p>
              <p style={{ fontSize: styles.fonts.labelSize, color: styles.colors.labelText }}>
                {identificacion.fecha.value}
              </p>
            </div>
          </div>
        </div>

        {/* Sección de identificación */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2 
            className="font-semibold pb-2 mb-3"
            style={{ 
              fontSize: styles.fonts.titleSize,
              color: styles.colors.headerBg,
              borderBottom: `1px solid ${styles.colors.borderColor}`,
            }}
          >
            1. IDENTIFICACIÓN
          </h2>
          <div 
            className="grid grid-cols-2 gap-4"
            style={{ fontSize: styles.fonts.valueSize }}
          >
            <FieldDisplay 
              label="Código" 
              value={identificacion.codigo.value} 
              isEdited={identificacion.codigo.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Sistema" 
              value={identificacion.sistema.value} 
              isEdited={identificacion.sistema.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Dirección" 
              value={identificacion.direccion.value} 
              isEdited={identificacion.direccion.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Barrio" 
              value={identificacion.barrio.value} 
              isEdited={identificacion.barrio.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Estado" 
              value={identificacion.estado.value} 
              isEdited={identificacion.estado.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Fecha" 
              value={identificacion.fecha.value} 
              isEdited={identificacion.fecha.isEdited}
              showIndicator={showEditIndicators}
            />
          </div>
        </div>

        {/* Sección de estructura */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2 
            className="font-semibold pb-2 mb-3"
            style={{ 
              fontSize: styles.fonts.titleSize,
              color: styles.colors.headerBg,
              borderBottom: `1px solid ${styles.colors.borderColor}`,
            }}
          >
            2. ESTRUCTURA
          </h2>
          <div 
            className="grid grid-cols-2 gap-4"
            style={{ fontSize: styles.fonts.valueSize }}
          >
            <FieldDisplay 
              label="Altura Total" 
              value={estructura.alturaTotal.value} 
              isEdited={estructura.alturaTotal.isEdited}
              showIndicator={showEditIndicators}
              suffix="m"
            />
            <FieldDisplay 
              label="Rasante" 
              value={estructura.rasante.value} 
              isEdited={estructura.rasante.isEdited}
              showIndicator={showEditIndicators}
              suffix="m"
            />
            <FieldDisplay 
              label="Tapa Material" 
              value={estructura.tapaMaterial.value} 
              isEdited={estructura.tapaMaterial.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Tapa Estado" 
              value={estructura.tapaEstado.value} 
              isEdited={estructura.tapaEstado.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Cono Tipo" 
              value={estructura.conoTipo.value} 
              isEdited={estructura.conoTipo.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Cono Material" 
              value={estructura.conoMaterial.value} 
              isEdited={estructura.conoMaterial.isEdited}
              showIndicator={showEditIndicators}
            />
            <FieldDisplay 
              label="Diámetro Cuerpo" 
              value={estructura.cuerpoDiametro.value} 
              isEdited={estructura.cuerpoDiametro.isEdited}
              showIndicator={showEditIndicators}
              suffix="m"
            />
            <FieldDisplay 
              label="Canuela Material" 
              value={estructura.canuelaMaterial.value} 
              isEdited={estructura.canuelaMaterial.isEdited}
              showIndicator={showEditIndicators}
            />
            <div className="col-span-2">
              <span className="text-gray-500">Peldaños:</span>
              <span className={`ml-2 font-medium ${estructura.peldanosCantidad.isEdited && showEditIndicators ? 'text-amber-700' : ''}`}>
                {estructura.peldanosCantidad.value || '0'} ({estructura.peldanosMaterial.value || 'N/A'})
              </span>
              {(estructura.peldanosCantidad.isEdited || estructura.peldanosMaterial.isEdited) && showEditIndicators && (
                <span className="ml-1 inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Sección de tuberías */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2 
            className="font-semibold pb-2 mb-3"
            style={{ 
              fontSize: styles.fonts.titleSize,
              color: styles.colors.headerBg,
              borderBottom: `1px solid ${styles.colors.borderColor}`,
            }}
          >
            3. TUBERÍAS
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Entradas ({pozo.tuberias.entradas.length})
              </h3>
              {pozo.tuberias.entradas.length > 0 ? (
                <div className="space-y-2">
                  {pozo.tuberias.entradas.map((t, i) => (
                    <div 
                      key={t.id} 
                      className="bg-gray-50 p-2 rounded"
                      style={{ fontSize: styles.fonts.valueSize }}
                    >
                      <span className="font-medium">E{i + 1}:</span> Ø{t.diametro}mm, {t.material}, Cota: {t.cota}m
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic" style={{ fontSize: styles.fonts.valueSize }}>
                  Sin entradas
                </p>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Salidas ({pozo.tuberias.salidas.length})
              </h3>
              {pozo.tuberias.salidas.length > 0 ? (
                <div className="space-y-2">
                  {pozo.tuberias.salidas.map((t, i) => (
                    <div 
                      key={t.id} 
                      className="bg-gray-50 p-2 rounded"
                      style={{ fontSize: styles.fonts.valueSize }}
                    >
                      <span className="font-medium">S{i + 1}:</span> Ø{t.diametro}mm, {t.material}, Cota: {t.cota}m
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic" style={{ fontSize: styles.fonts.valueSize }}>
                  Sin salidas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de observaciones */}
        <div style={{ marginBottom: styles.spacing.sectionGap }}>
          <h2 
            className="font-semibold pb-2 mb-3"
            style={{ 
              fontSize: styles.fonts.titleSize,
              color: styles.colors.headerBg,
              borderBottom: `1px solid ${styles.colors.borderColor}`,
            }}
          >
            4. OBSERVACIONES
          </h2>
          <p 
            className={observaciones.isEdited && showEditIndicators ? 'text-amber-700' : 'text-gray-700'}
            style={{ fontSize: styles.fonts.valueSize }}
          >
            {observaciones.value || <span className="text-gray-400 italic">Sin observaciones</span>}
            {observaciones.isEdited && showEditIndicators && (
              <span className="ml-1 inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </p>
        </div>

        {/* Sección de fotos */}
        <div>
          <h2 
            className="font-semibold pb-2 mb-3"
            style={{ 
              fontSize: styles.fonts.titleSize,
              color: styles.colors.headerBg,
              borderBottom: `1px solid ${styles.colors.borderColor}`,
            }}
          >
            5. REGISTRO FOTOGRÁFICO
          </h2>
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {allPhotos.map((foto) => (
                <div 
                  key={foto.id} 
                  className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative group"
                >
                  {foto.dataUrl ? (
                    <img 
                      src={foto.dataUrl} 
                      alt={foto.descripcion} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                  )}
                  {/* Overlay con descripción */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {foto.descripcion || foto.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-center py-8" style={{ fontSize: styles.fonts.valueSize }}>
              No hay fotografías disponibles
            </p>
          )}
        </div>

        {/* Indicador de campos editados (leyenda) */}
        {showEditIndicators && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>Campo editado manualmente</span>
          </div>
        )}
      </div>
    </div>
  );
}
