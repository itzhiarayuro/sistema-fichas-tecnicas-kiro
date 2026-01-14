/**
 * Toolbar del Diseñador - Diseñador de Fichas
 * Requirements: 6.1-6.4
 * 
 * Botones: Nuevo, Guardar, Cargar, Duplicar, Eliminar
 * Selector de tamaño de página (A4, Letter)
 * Selector de orientación (Portrait, Landscape)
 * Zoom controls
 * Preview PDF
 */

'use client';

import { useState } from 'react';
import { useDesignStore } from '@/stores';
import type { FichaDesign, PageConfig } from '@/types';

interface DesignToolbarProps {
  design: FichaDesign;
  onDesignChange: (design: FichaDesign) => void;
}

export function DesignToolbar({ design, onDesignChange }: DesignToolbarProps) {
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [designName, setDesignName] = useState(design.name);
  
  // Store
  const createDesign = useDesignStore((state) => state.createDesign);
  const updateDesign = useDesignStore((state) => state.updateDesign);
  const deleteDesign = useDesignStore((state) => state.deleteDesign);
  const duplicateDesign = useDesignStore((state) => state.duplicateDesign);
  const createVersion = useDesignStore((state) => state.createVersion);
  const getAllDesigns = useDesignStore((state) => state.getAllDesigns);
  
  // Manejar nuevo diseño
  const handleNewDesign = () => {
    const newDesign: FichaDesign = {
      id: `design-${Date.now()}`,
      name: 'Nuevo Diseño',
      description: '',
      isDefault: false,
      isGlobal: false,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pageConfig: design.pageConfig,
      theme: design.theme,
      fieldPlacements: [],
      metadata: {},
    };
    createDesign(newDesign);
    onDesignChange(newDesign);
  };
  
  // Manejar guardar
  const handleSave = () => {
    updateDesign(design.id, {
      ...design,
      name: designName,
      updatedAt: Date.now(),
    });
    createVersion(design.id, `v${design.version}`, 'Cambios guardados');
    setShowSaveDialog(false);
  };
  
  // Manejar duplicar
  const handleDuplicate = () => {
    const duplicated = duplicateDesign(design.id, `${design.name} (Copia)`);
    if (duplicated) {
      onDesignChange(duplicated);
    }
  };
  
  // Manejar eliminar
  const handleDelete = () => {
    if (confirm(`¿Eliminar diseño "${design.name}"?`)) {
      deleteDesign(design.id);
      const designs = getAllDesigns();
      if (designs.length > 0) {
        onDesignChange(designs[0]);
      }
    }
  };
  
  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (size: 'A4' | 'Letter' | 'Legal') => {
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 210, height: 297 },
      Letter: { width: 215.9, height: 279.4 },
      Legal: { width: 215.9, height: 355.6 },
    };
    
    const newPageConfig: PageConfig = {
      ...design.pageConfig,
      size,
      ...sizes[size],
    };
    
    updateDesign(design.id, {
      ...design,
      pageConfig: newPageConfig,
      updatedAt: Date.now(),
    });
    
    onDesignChange({
      ...design,
      pageConfig: newPageConfig,
    });
  };
  
  // Manejar cambio de orientación
  const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
    const newPageConfig: PageConfig = {
      ...design.pageConfig,
      orientation,
      width: orientation === 'landscape' ? design.pageConfig.height : design.pageConfig.width,
      height: orientation === 'landscape' ? design.pageConfig.width : design.pageConfig.height,
    };
    
    updateDesign(design.id, {
      ...design,
      pageConfig: newPageConfig,
      updatedAt: Date.now(),
    });
    
    onDesignChange({
      ...design,
      pageConfig: newPageConfig,
    });
  };
  
  // Manejar preview PDF
  const handlePreviewPDF = () => {
    // Abrir modal de preview
    const previewWindow = window.open('', 'pdfPreview', 'width=1000,height=800');
    if (!previewWindow) {
      alert('No se pudo abrir la ventana de preview. Verifica que los pop-ups estén habilitados.');
      return;
    }
    
    // Generar HTML del preview
    const html = generatePreviewHTML(design);
    previewWindow.document.write(html);
    previewWindow.document.close();
  };
  
  // Generar HTML para preview
  const generatePreviewHTML = (design: FichaDesign): string => {
    const { pageConfig, theme, fieldPlacements } = design;
    
    const pageWidthMm = pageConfig.width;
    const pageHeightMm = pageConfig.height;
    
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${design.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.fontFamily}, Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .toolbar {
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .toolbar button {
      padding: 8px 16px;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    
    .toolbar button:hover {
      background-color: #e5e7eb;
    }
    
    .page {
      width: ${pageWidthMm}mm;
      height: ${pageHeightMm}mm;
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      position: relative;
      margin: 0 auto 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .page-content {
      width: 100%;
      height: 100%;
      position: relative;
      padding: ${pageConfig.margins.top}mm ${pageConfig.margins.right}mm ${pageConfig.margins.bottom}mm ${pageConfig.margins.left}mm;
    }
    
    .field {
      position: absolute;
      font-size: ${theme.baseFontSize}pt;
      overflow: hidden;
      text-overflow: ellipsis;
      border: 1px solid #e5e7eb;
      padding: 4px;
      background-color: rgba(255, 255, 255, 0.5);
    }
    
    .field-label {
      font-weight: bold;
      font-size: ${theme.baseFontSize - 1}pt;
      color: ${theme.primaryColor};
      margin-bottom: 2px;
    }
    
    .field-value {
      font-size: ${theme.baseFontSize}pt;
      color: ${theme.textColor};
    }
    
    .field-placeholder {
      color: #9ca3af;
      font-style: italic;
    }
    
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      .toolbar {
        display: none;
      }
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">🖨️ Imprimir</button>
    <button onclick="window.close()">❌ Cerrar</button>
    <span style="margin-left: auto; font-size: 12px; color: #6b7280;">
      ${design.name} - ${pageConfig.size} ${pageConfig.orientation}
    </span>
  </div>
  
  <div class="page">
    <div class="page-content">
`;
    
    // Agregar campos colocados
    fieldPlacements.forEach((placement) => {
      if (!placement.visible) return;
      
      // Convertir posición de píxeles a mm
      const xMm = (placement.position.x / 96) * 25.4;
      const yMm = (placement.position.y / 96) * 25.4;
      const widthMm = (placement.position.width / 96) * 25.4;
      const heightMm = (placement.position.height / 96) * 25.4;
      
      const fieldStyle = `
        position: absolute;
        left: ${xMm}mm;
        top: ${yMm}mm;
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        font-size: ${placement.style.fontSize}pt;
        font-family: ${placement.style.fontFamily};
        color: ${placement.style.color};
        background-color: ${placement.style.backgroundColor};
        border-radius: ${placement.style.borderRadius}px;
        padding: ${placement.style.padding}px;
        z-index: ${placement.zIndex};
      `;
      
      html += `<div class="field" style="${fieldStyle}">
        <div class="field-label">${escapeHTML(placement.customLabel || placement.fieldName)}</div>
        <div class="field-value field-placeholder">[${placement.fieldType}]</div>
      </div>`;
    });
    
    html += `
    </div>
  </div>
</body>
</html>`;
    
    return html;
  };
  
  // Escapar HTML
  const escapeHTML = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left section - Design name and actions */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{design.name}</h1>
            <p className="text-xs text-gray-500">
              {design.pageConfig.size} - {design.pageConfig.orientation}
            </p>
          </div>
        </div>
        
        {/* Center section - Page settings */}
        <div className="flex items-center gap-2">
          {/* Page size */}
          <div className="relative">
            <button
              onClick={() => setShowPageSettings(!showPageSettings)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              📄 {design.pageConfig.size}
            </button>
            
            {showPageSettings && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      handlePageSizeChange('A4');
                      setShowPageSettings(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    A4 (210 x 297 mm)
                  </button>
                  <button
                    onClick={() => {
                      handlePageSizeChange('Letter');
                      setShowPageSettings(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    Letter (8.5 x 11 in)
                  </button>
                  <button
                    onClick={() => {
                      handlePageSizeChange('Legal');
                      setShowPageSettings(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    Legal (8.5 x 14 in)
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Orientation */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleOrientationChange('portrait')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                design.pageConfig.orientation === 'portrait'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title="Portrait"
            >
              📋
            </button>
            <button
              onClick={() => handleOrientationChange('landscape')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                design.pageConfig.orientation === 'landscape'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title="Landscape"
            >
              📺
            </button>
          </div>
        </div>
        
        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Save */}
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Guardar diseño"
          >
            💾 Guardar
          </button>
          
          {/* New */}
          <button
            onClick={handleNewDesign}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Nuevo diseño"
          >
            ➕ Nuevo
          </button>
          
          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Duplicar diseño"
          >
            📋 Duplicar
          </button>
          
          {/* Preview PDF */}
          <button
            onClick={handlePreviewPDF}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Preview PDF"
          >
            👁️ Preview
          </button>
          
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            title="Eliminar diseño"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guardar Diseño</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Diseño
              </label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
