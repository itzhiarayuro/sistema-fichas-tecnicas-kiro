/**
 * Importador de HTML - Diseñador de Fichas
 * Requirements: 6.1-6.4
 * 
 * Upload de archivo HTML
 * Parsear HTML y extraer estructura
 * Mapear elementos HTML a campos del diccionario
 * Guardar como nueva versión de diseño
 */

'use client';

import { useState, useRef } from 'react';
import { useDesignStore } from '@/stores';
import type { FichaDesign, FieldPlacement, HTMLImportResult } from '@/types';

interface HTMLImporterProps {
  onImportComplete?: (design: FichaDesign) => void;
}

export function HTMLImporter({ onImportComplete }: HTMLImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HTMLImportResult | null>(null);
  const [designName, setDesignName] = useState('Diseño Importado');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store
  const createDesign = useDesignStore((state) => state.createDesign);
  const getDefaultDesign = useDesignStore((state) => state.getDefaultDesign);
  
  // Manejar selección de archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const content = await file.text();
      const importResult = parseHTMLToDesign(content, designName);
      setResult(importResult);
      
      if (importResult.success && importResult.design) {
        createDesign(importResult.design);
        onImportComplete?.(importResult.design);
      }
    } catch (error) {
      console.error('Error importing HTML:', error);
      setResult({
        success: false,
        errors: ['Error al leer el archivo HTML'],
        warnings: [],
        stats: { totalElements: 0, mappedElements: 0, unmappedElements: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Parsear HTML a diseño
  const parseHTMLToDesign = (htmlContent: string, name: string): HTMLImportResult => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        return {
          success: false,
          errors: ['HTML inválido'],
          warnings: [],
          stats: { totalElements: 0, mappedElements: 0, unmappedElements: 0 },
        };
      }
      
      const fieldPlacements: FieldPlacement[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      let totalElements = 0;
      let mappedElements = 0;
      
      // Extraer elementos del HTML
      const elements = doc.querySelectorAll('[data-field-id], input, textarea, select, label');
      totalElements = elements.length;
      
      let zIndex = 0;
      elements.forEach((element, index) => {
        try {
          const fieldId = element.getAttribute('data-field-id') || element.id || `field-${index}`;
          const fieldName = element.getAttribute('data-field-name') || element.textContent || fieldId;
          
          // Obtener posición y tamaño
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          
          const placement: FieldPlacement = {
            id: `placement-${Date.now()}-${index}`,
            fieldId,
            fieldName,
            fieldType: 'text',
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width || 100,
              height: rect.height || 30,
            },
            style: {
              fontSize: parseFloat(computedStyle.fontSize) || 12,
              fontFamily: computedStyle.fontFamily || 'Inter',
              color: computedStyle.color || '#333333',
              backgroundColor: computedStyle.backgroundColor || 'transparent',
              borderRadius: parseFloat(computedStyle.borderRadius) || 0,
              padding: parseFloat(computedStyle.padding) || 4,
            },
            isRepeatable: false,
            zIndex,
            locked: false,
            visible: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          fieldPlacements.push(placement);
          mappedElements++;
          zIndex++;
        } catch (error) {
          warnings.push(`Error procesando elemento ${index}: ${error}`);
        }
      });
      
      // Crear diseño
      const defaultDesign = getDefaultDesign();
      const design: FichaDesign = {
        id: `design-${Date.now()}`,
        name,
        description: `Importado desde HTML el ${new Date().toLocaleDateString()}`,
        isDefault: false,
        isGlobal: false,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pageConfig: defaultDesign?.pageConfig || {
          size: 'A4',
          orientation: 'portrait',
          width: 210,
          height: 297,
          margins: { top: 10, right: 10, bottom: 10, left: 10 },
          showGrid: false,
          gridSize: 10,
          snapToGrid: true,
        },
        theme: defaultDesign?.theme || {
          primaryColor: '#1F4E79',
          secondaryColor: '#2E7D32',
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
          borderColor: '#CCCCCC',
          fontFamily: 'Inter',
          baseFontSize: 12,
        },
        fieldPlacements,
        metadata: {
          importedFrom: 'HTML',
          importDate: new Date().toISOString(),
        },
      };
      
      return {
        success: true,
        design,
        errors,
        warnings,
        stats: {
          totalElements,
          mappedElements,
          unmappedElements: totalElements - mappedElements,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Error al parsear HTML: ${error}`],
        warnings: [],
        stats: { totalElements: 0, mappedElements: 0, unmappedElements: 0 },
      };
    }
  };
  
  // Resetear
  const handleReset = () => {
    setResult(null);
    setDesignName('Diseño Importado');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Botón para abrir */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Importar desde HTML"
      >
        📥 Importar HTML
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Importar Diseño desde HTML</h2>
            
            {!result ? (
              <>
                {/* File input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo HTML
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileSelect}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                  />
                </div>
                
                {/* Design name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Diseño
                  </label>
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
                  />
                </div>
                
                {/* Loading state */}
                {isLoading && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Procesando archivo...</p>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Result */}
                <div className="mb-4 space-y-3">
                  {result.success ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">✓ Importación exitosa</p>
                      <p className="text-xs text-green-600 mt-1">
                        {result.stats.mappedElements} elementos mapeados
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-700">✗ Error en importación</p>
                      {result.errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-600 mt-1">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-700">⚠ Advertencias</p>
                      {result.warnings.slice(0, 3).map((warning, i) => (
                        <p key={i} className="text-xs text-yellow-600 mt-1">
                          {warning}
                        </p>
                      ))}
                      {result.warnings.length > 3 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          +{result.warnings.length - 3} más...
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Total: {result.stats.totalElements} | Mapeados: {result.stats.mappedElements} | No mapeados: {result.stats.unmappedElements}
                    </p>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
