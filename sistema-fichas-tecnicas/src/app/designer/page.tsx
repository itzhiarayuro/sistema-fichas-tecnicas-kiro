/**
 * Página del Diseñador de Fichas Técnicas
 * Requirements: 6.1-6.4
 * 
 * Layout: Panel izquierdo (campos) + Canvas (centro) + Propiedades (derecha)
 * Permite personalización completa de layouts, posiciones, tamaños y estilos.
 */

'use client';

import { useEffect, useState } from 'react';
import { useDesignStore, useInitializeDesignStore } from '@/stores';
import { AppShell } from '@/components/layout';
import { DesignToolbar } from '@/components/designer/DesignToolbar';
import { FieldsPanel } from '@/components/designer/FieldsPanel';
import { DesignCanvas } from '@/components/designer/DesignCanvas';
import { PropertiesPanel } from '@/components/designer/PropertiesPanel';
import { DrawingTools } from '@/components/designer/DrawingTools';
import { DesignPreview } from '@/components/designer/DesignPreview';
import type { FichaDesign } from '@/types';

export default function DesignerPage() {
  // Inicializar store con diseño por defecto si es necesario
  useInitializeDesignStore();
  
  // Store
  const designs = useDesignStore((state) => state.designs);
  const editorState = useDesignStore((state) => state.editorState);
  const setEditorState = useDesignStore((state) => state.setEditorState);
  const getDefaultDesign = useDesignStore((state) => state.getDefaultDesign);
  
  // Estado local
  const [currentDesign, setCurrentDesign] = useState<FichaDesign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawingTool, setDrawingTool] = useState<string | null>(null);
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showPreview, setShowPreview] = useState(false);
  
  // Inicializar con diseño por defecto
  useEffect(() => {
    const defaultDesign = getDefaultDesign();
    if (defaultDesign) {
      setCurrentDesign(defaultDesign);
      if (!editorState) {
        setEditorState({
          currentDesign: defaultDesign,
          selectedFieldId: null,
          zoomLevel: 1,
          scrollPosition: { x: 0, y: 0 },
          editMode: 'select',
          history: [],
          historyIndex: -1,
        });
      }
    }
    setIsLoading(false);
  }, [getDefaultDesign, editorState, setEditorState]);
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando diseñador...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  if (!currentDesign) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No hay diseños disponibles</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Recargar
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Toolbar */}
        <DesignToolbar design={currentDesign} onDesignChange={setCurrentDesign} />
        
        {/* Drawing Tools */}
        <DrawingTools
          activeTool={drawingTool}
          onToolSelect={setDrawingTool}
          fillColor={fillColor}
          onFillColorChange={setFillColor}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
        />

        {/* Preview Button */}
        <div className="px-4 py-2 bg-white border-b border-gray-200 flex justify-end">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            👁️ Ver Preview
          </button>
        </div>
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Fields */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <FieldsPanel />
          </div>
          
          {/* Center - Canvas */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            <DesignCanvas 
              design={currentDesign}
              drawingTool={drawingTool}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
            />
          </div>
          
          {/* Right panel - Properties */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            {editorState?.selectedFieldId ? (
              <PropertiesPanel design={currentDesign} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">Selecciona un campo en el canvas para editar sus propiedades</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <DesignPreview
          design={currentDesign}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </div>
    </AppShell>
  );
}
