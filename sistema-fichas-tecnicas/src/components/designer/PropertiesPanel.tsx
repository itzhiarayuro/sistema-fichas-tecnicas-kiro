/**
 * Panel de Propiedades - Diseñador de Fichas
 * Requirements: 6.1-6.4
 * 
 * Editar propiedades del elemento seleccionado:
 * - Posición (X, Y)
 * - Tamaño (Ancho, Alto)
 * - Estilos (fontSize, fontFamily, color, etc)
 * - Label personalizado
 * - ¿Es repetible?
 */

'use client';

import { useState, useEffect } from 'react';
import { useDesignStore } from '@/stores';
import type { FichaDesign, FieldPlacement } from '@/types';

interface PropertiesPanelProps {
  design: FichaDesign;
}

export function PropertiesPanel({ design }: PropertiesPanelProps) {
  const editorState = useDesignStore((state) => state.editorState);
  const updateDesign = useDesignStore((state) => state.updateDesign);
  
  const selectedFieldId = editorState?.selectedFieldId;
  const selectedField = design.fieldPlacements.find((f) => f.id === selectedFieldId);
  
  const [localField, setLocalField] = useState<FieldPlacement | null>(selectedField || null);
  
  // Sincronizar cuando cambia la selección
  useEffect(() => {
    setLocalField(selectedField || null);
  }, [selectedFieldId, selectedField]);
  
  if (!localField) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Selecciona un campo para editar</p>
      </div>
    );
  }
  
  // Guardar cambios
  const saveChanges = () => {
    if (!localField) return;
    
    const updatedPlacements = design.fieldPlacements.map((f) =>
      f.id === localField.id ? localField : f
    );
    
    updateDesign(design.id, {
      ...design,
      fieldPlacements: updatedPlacements,
      updatedAt: Date.now(),
    });
  };
  
  // Manejar cambios
  const handleChange = (updates: Partial<FieldPlacement>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
  };
  
  const handlePositionChange = (key: 'x' | 'y', value: number) => {
    handleChange({
      position: { ...localField.position, [key]: value },
    });
  };
  
  const handleSizeChange = (key: 'width' | 'height', value: number) => {
    handleChange({
      position: { ...localField.position, [key]: value },
    });
  };
  
  const handleStyleChange = (key: keyof typeof localField.style, value: any) => {
    handleChange({
      style: { ...localField.style, [key]: value },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
        <p className="text-sm text-gray-600 mt-1">{localField.fieldName}</p>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ID del campo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID del Campo
          </label>
          <input
            type="text"
            value={localField.fieldId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
          />
        </div>
        
        {/* Tipo de dato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Dato
          </label>
          <input
            type="text"
            value={localField.fieldType}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
          />
        </div>
        
        {/* Label personalizado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Personalizado
          </label>
          <input
            type="text"
            value={localField.customLabel || ''}
            onChange={(e) => handleChange({ customLabel: e.target.value || undefined })}
            placeholder={localField.fieldName}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {/* Posición */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Posición</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X (px)</label>
              <input
                type="number"
                value={Math.round(localField.position.x)}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y (px)</label>
              <input
                type="number"
                value={Math.round(localField.position.y)}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Tamaño */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tamaño</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ancho (px)</label>
              <input
                type="number"
                value={Math.round(localField.position.width)}
                onChange={(e) => handleSizeChange('width', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alto (px)</label>
              <input
                type="number"
                value={Math.round(localField.position.height)}
                onChange={(e) => handleSizeChange('height', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Estilos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Estilos</h3>
          <div className="space-y-3">
            {/* Font Size */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tamaño de Fuente (px)</label>
              <input
                type="number"
                value={localField.style.fontSize}
                onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Font Family */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Familia de Fuente</label>
              <select
                value={localField.style.fontFamily}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Inter</option>
                <option>Arial</option>
                <option>Helvetica</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
              </select>
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Color de Texto</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localField.style.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localField.style.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Background Color */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Color de Fondo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localField.style.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localField.style.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Border Radius */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Radio de Borde (px)</label>
              <input
                type="number"
                value={localField.style.borderRadius}
                onChange={(e) => handleStyleChange('borderRadius', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Padding */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding (px)</label>
              <input
                type="number"
                value={localField.style.padding}
                onChange={(e) => handleStyleChange('padding', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Repetible */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localField.isRepeatable}
              onChange={(e) => handleChange({ isRepeatable: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">¿Es repetible?</span>
          </label>
          {localField.isRepeatable && localField.repeatableConfig && (
            <div className="mt-3 p-3 bg-gray-50 rounded space-y-2">
            {/* Max Repetitions */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Máximo de Repeticiones (0 = ilimitado)
              </label>
              <input
                type="number"
                value={localField.repeatableConfig?.maxRepetitions || 0}
                onChange={(e) =>
                  handleChange({
                    repeatableConfig: {
                      maxRepetitions: parseFloat(e.target.value),
                      spacing: localField.repeatableConfig?.spacing || 10,
                      showNumbering: localField.repeatableConfig?.showNumbering || false,
                    },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Spacing */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Espaciado entre Repeticiones (px)
              </label>
              <input
                type="number"
                value={localField.repeatableConfig?.spacing || 10}
                onChange={(e) =>
                  handleChange({
                    repeatableConfig: {
                      maxRepetitions: localField.repeatableConfig?.maxRepetitions || 0,
                      spacing: parseFloat(e.target.value),
                      showNumbering: localField.repeatableConfig?.showNumbering || false,
                    },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Show Numbering */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localField.repeatableConfig?.showNumbering || false}
                onChange={(e) =>
                  handleChange({
                    repeatableConfig: {
                      maxRepetitions: localField.repeatableConfig?.maxRepetitions || 0,
                      spacing: localField.repeatableConfig?.spacing || 10,
                      showNumbering: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Mostrar numeración</span>
            </label>
            </div>
          )}
        </div>
        
        {/* Visibilidad */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localField.visible}
              onChange={(e) => handleChange({ visible: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Visible</span>
          </label>
        </div>
        
        {/* Bloqueado */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localField.locked}
              onChange={(e) => handleChange({ locked: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Bloqueado</span>
          </label>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={saveChanges}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          Guardar Cambios
        </button>
        <button
          onClick={() => {
            const updatedPlacements = design.fieldPlacements.filter(
              (f) => f.id !== localField.id
            );
            updateDesign(design.id, {
              ...design,
              fieldPlacements: updatedPlacements,
              updatedAt: Date.now(),
            });
            useDesignStore.setState((state) => ({
              editorState: state.editorState ? { ...state.editorState, selectedFieldId: null } : null,
            }));
          }}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Eliminar Campo
        </button>
      </div>
    </div>
  );
}
