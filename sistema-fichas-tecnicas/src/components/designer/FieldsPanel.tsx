/**
 * Panel de Campos - Diseñador de Fichas
 * Requirements: 6.1-6.4
 * 
 * Listar todos los campos del diccionario agrupados por categoría.
 * Soporta drag & drop, búsqueda y filtrado.
 */

'use client';

import { useState, useMemo } from 'react';
import type { FieldDictionary, FieldDictionaryEntry, FieldSearchConfig } from '@/types';

/**
 * Diccionario completo de campos disponibles
 * 33 POZO + 9 TUBERIAS + 8 SUMIDEROS + 6 FOTOS = 56 campos
 */
const FIELD_DICTIONARY: FieldDictionary = {
  identificacion: [
    {
      id: 'idPozo',
      name: 'ID Pozo',
      description: 'Identificador único del pozo',
      type: 'text',
      required: true,
      helpText: 'Ej: PZ1666, M680',
    },
    {
      id: 'coordenadaX',
      name: 'Coordenada X',
      description: 'Longitud geográfica',
      type: 'number',
      required: true,
      helpText: 'Ej: -74.123456',
    },
    {
      id: 'coordenadaY',
      name: 'Coordenada Y',
      description: 'Latitud geográfica',
      type: 'number',
      required: true,
      helpText: 'Ej: 4.678901',
    },
    {
      id: 'fecha',
      name: 'Fecha de Inspección',
      description: 'Fecha de inspección',
      type: 'date',
      required: true,
      helpText: 'Formato: YYYY-MM-DD',
    },
    {
      id: 'levanto',
      name: 'Inspector',
      description: 'Inspector que realizó levantamiento',
      type: 'text',
      required: true,
      helpText: 'Nombre del inspector',
    },
    {
      id: 'estado',
      name: 'Estado General',
      description: 'Estado general del pozo',
      type: 'select',
      required: true,
      options: ['Bueno', 'Regular', 'Malo', 'Muy Malo', 'No Aplica'],
    },
  ],
  ubicacion: [
    {
      id: 'direccion',
      name: 'Dirección',
      description: 'Dirección física del pozo',
      type: 'text',
      required: false,
    },
    {
      id: 'barrio',
      name: 'Barrio',
      description: 'Barrio o sector',
      type: 'text',
      required: false,
    },
    {
      id: 'elevacion',
      name: 'Elevación',
      description: 'Elevación sobre nivel del mar (m)',
      type: 'number',
      required: false,
    },
    {
      id: 'profundidad',
      name: 'Profundidad',
      description: 'Profundidad del pozo (m)',
      type: 'number',
      required: false,
    },
  ],
  componentes: [
    {
      id: 'existeTapa',
      name: '¿Existe Tapa?',
      description: 'Indica si el pozo tiene tapa',
      type: 'select',
      required: false,
      options: ['Sí', 'No'],
    },
    {
      id: 'estadoTapa',
      name: 'Estado Tapa',
      description: 'Estado de la tapa',
      type: 'select',
      required: false,
      options: ['Bueno', 'Regular', 'Malo'],
    },
    {
      id: 'existeCilindro',
      name: '¿Existe Cilindro?',
      description: 'Indica si el pozo tiene cilindro',
      type: 'select',
      required: false,
      options: ['Sí', 'No'],
    },
    {
      id: 'diametroCilindro',
      name: 'Diámetro Cilindro',
      description: 'Diámetro del cilindro (m)',
      type: 'number',
      required: false,
    },
    {
      id: 'sistema',
      name: 'Sistema',
      description: 'Sistema al que pertenece',
      type: 'text',
      required: false,
    },
    {
      id: 'anoInstalacion',
      name: 'Año Instalación',
      description: 'Año de instalación',
      type: 'number',
      required: false,
    },
    {
      id: 'tipoCamara',
      name: 'Tipo Cámara',
      description: 'Tipo de cámara',
      type: 'select',
      required: false,
      options: ['Circular', 'Rectangular', 'Cuadrada'],
    },
    {
      id: 'materialTapa',
      name: 'Material Tapa',
      description: 'Material de la tapa',
      type: 'text',
      required: false,
    },
    {
      id: 'materialCilindro',
      name: 'Material Cilindro',
      description: 'Material del cilindro',
      type: 'text',
      required: false,
    },
    {
      id: 'existePeldanos',
      name: '¿Existe Peldaños?',
      description: 'Indica si el pozo tiene peldaños',
      type: 'select',
      required: false,
      options: ['Sí', 'No'],
    },
    {
      id: 'numeroPeldanos',
      name: 'Número Peldaños',
      description: 'Cantidad de peldaños',
      type: 'number',
      required: false,
    },
  ],
  tuberias: [
    {
      id: 'idTuberia',
      name: 'ID Tubería',
      description: 'Identificador único',
      type: 'text',
      required: true,
    },
    {
      id: 'tipoTuberia',
      name: 'Tipo',
      description: 'Entrada o salida',
      type: 'select',
      required: true,
      options: ['Entrada', 'Salida'],
    },
    {
      id: 'diametroTuberia',
      name: 'Diámetro',
      description: 'Diámetro en mm',
      type: 'number',
      required: true,
    },
    {
      id: 'materialTuberia',
      name: 'Material',
      description: 'Material de la tubería',
      type: 'select',
      required: true,
      options: ['PVC', 'GRES', 'Concreto', 'Hierro Fundido', 'Polietileno'],
    },
    {
      id: 'cotaTuberia',
      name: 'Cota',
      description: 'Cota o profundidad',
      type: 'number',
      required: false,
    },
    {
      id: 'estadoTuberia',
      name: 'Estado',
      description: 'Estado de la tubería',
      type: 'select',
      required: false,
      options: ['Bueno', 'Regular', 'Malo'],
    },
    {
      id: 'emboquillado',
      name: 'Emboquillado',
      description: '¿Tiene emboquillado?',
      type: 'select',
      required: false,
      options: ['Sí', 'No'],
    },
    {
      id: 'longitudTuberia',
      name: 'Longitud',
      description: 'Longitud en metros',
      type: 'number',
      required: false,
    },
  ],
  sumideros: [
    {
      id: 'idSumidero',
      name: 'ID Sumidero',
      description: 'Identificador único',
      type: 'text',
      required: true,
    },
    {
      id: 'tipoSumidero',
      name: 'Tipo',
      description: 'Tipo de sumidero',
      type: 'select',
      required: false,
      options: ['Rejilla', 'Buzón', 'Combinado', 'Lateral'],
    },
    {
      id: 'numeroEsquema',
      name: 'Número Esquema',
      description: 'Número en esquema',
      type: 'number',
      required: false,
    },
    {
      id: 'diametroSumidero',
      name: 'Diámetro',
      description: 'Diámetro en mm',
      type: 'number',
      required: false,
    },
    {
      id: 'materialSumidero',
      name: 'Material',
      description: 'Material de la tubería',
      type: 'text',
      required: false,
    },
    {
      id: 'alturaSalida',
      name: 'Altura Salida',
      description: 'Altura de salida (m)',
      type: 'number',
      required: false,
    },
    {
      id: 'alturaLlegada',
      name: 'Altura Llegada',
      description: 'Altura de llegada (m)',
      type: 'number',
      required: false,
    },
  ],
  fotos: [
    {
      id: 'fotoTapa',
      name: 'Foto Tapa',
      description: 'Fotografía de la tapa',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoInterior',
      name: 'Foto Interior',
      description: 'Fotografía del interior',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoGeneral',
      name: 'Foto General',
      description: 'Fotografía general',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoEntrada',
      name: 'Foto Entrada',
      description: 'Fotografía de entrada',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoSalida',
      name: 'Foto Salida',
      description: 'Fotografía de salida',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoSumidero',
      name: 'Foto Sumidero',
      description: 'Fotografía de sumidero',
      type: 'image',
      required: false,
    },
    {
      id: 'fotoPanoramica',
      name: 'Foto Panorámica',
      description: 'Fotografía panorámica (P)',
      type: 'image',
      required: false,
    },
  ],
};

interface FieldsPanelProps {
  onFieldDragStart?: (field: FieldDictionaryEntry) => void;
}

export function FieldsPanel({ onFieldDragStart }: FieldsPanelProps) {
  const [searchConfig, setSearchConfig] = useState<FieldSearchConfig>({
    searchTerm: '',
    categories: Object.keys(FIELD_DICTIONARY),
    onlyRequired: false,
    onlyRepeatable: false,
  });
  
  // Filtrar campos según búsqueda y configuración
  const filteredFields = useMemo(() => {
    const result: Record<string, FieldDictionaryEntry[]> = {};
    
    Object.entries(FIELD_DICTIONARY).forEach(([category, fields]) => {
      if (!searchConfig.categories.includes(category)) return;
      
      const filtered = fields.filter((field: FieldDictionaryEntry) => {
        // Filtro de búsqueda
        if (searchConfig.searchTerm) {
          const term = searchConfig.searchTerm.toLowerCase();
          const matches =
            field.name.toLowerCase().includes(term) ||
            field.description.toLowerCase().includes(term);
          if (!matches) return false;
        }
        
        // Filtro de obligatorios
        if (searchConfig.onlyRequired && !field.required) return false;
        
        // Filtro de repetibles
        if (searchConfig.onlyRepeatable && field.type !== 'repeatable') return false;
        
        return true;
      });
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [searchConfig]);
  
  const handleDragStart = (e: React.DragEvent, field: FieldDictionaryEntry) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    onFieldDragStart?.(field);
  };
  
  const toggleCategory = (category: string) => {
    setSearchConfig((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };
  
  const categoryLabels: Record<string, string> = {
    identificacion: 'Identificación',
    ubicacion: 'Ubicación',
    componentes: 'Componentes',
    tuberias: 'Tuberías',
    sumideros: 'Sumideros',
    fotos: 'Fotografías',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campos</h2>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar campos..."
            value={searchConfig.searchTerm}
            onChange={(e) =>
              setSearchConfig((prev) => ({
                ...prev,
                searchTerm: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchConfig.onlyRequired}
              onChange={(e) =>
                setSearchConfig((prev) => ({
                  ...prev,
                  onlyRequired: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Solo obligatorios</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchConfig.onlyRepeatable}
              onChange={(e) =>
                setSearchConfig((prev) => ({
                  ...prev,
                  onlyRepeatable: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Solo repetibles</span>
          </label>
        </div>
      </div>
      
      {/* Fields list */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(filteredFields).length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No hay campos que coincidan</p>
          </div>
        ) : (
          Object.entries(filteredFields).map(([category, fields]) => (
            <div key={category} className="border-b border-gray-200">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm text-gray-900">
                  {categoryLabels[category]}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {fields.length}
                </span>
              </button>
              
              {/* Fields */}
              {searchConfig.categories.includes(category) && (
                <div className="px-2 py-2 space-y-1">
                  {fields.map((field) => (
                    <FieldItem
                      key={field.id}
                      field={field}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * FieldItem - Elemento individual de campo
 */
interface FieldItemProps {
  field: FieldDictionaryEntry;
  onDragStart: (e: React.DragEvent, field: FieldDictionaryEntry) => void;
}

function FieldItem({ field, onDragStart }: FieldItemProps) {
  const typeIcons: Record<string, string> = {
    text: '📝',
    number: '🔢',
    date: '📅',
    select: '📋',
    image: '🖼️',
    repeatable: '🔁',
  };
  
  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent) => onDragStart(e, field)}
      className="p-2 bg-white border border-gray-200 rounded cursor-move hover:border-primary hover:bg-primary-50 transition-all group"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{typeIcons[field.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {field.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {field.description}
          </p>
          {field.required && (
            <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Obligatorio
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
