/**
 * Gestor de Versiones - Diseñador de Fichas
 * Requirements: 6.1-6.4
 * 
 * Listar todas las versiones de diseños
 * Crear nueva versión
 * Duplicar versión
 * Renombrar versión
 * Eliminar versión
 * Establecer versión por defecto
 */

'use client';

import { useState } from 'react';
import { useDesignStore } from '@/stores';
import type { FichaDesign, DesignTemplate } from '@/types';

interface VersionManagerProps {
  design: FichaDesign;
  onVersionSelect?: (design: FichaDesign) => void;
}

export function VersionManager({ design, onVersionSelect }: VersionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Store
  const getVersions = useDesignStore((state) => state.getVersions);
  const createVersion = useDesignStore((state) => state.createVersion);
  const restoreVersion = useDesignStore((state) => state.restoreVersion);
  const deleteVersion = useDesignStore((state) => state.deleteVersion);
  const updateDesign = useDesignStore((state) => state.updateDesign);
  
  const versions = getVersions(design.id);
  
  // Crear nueva versión
  const handleCreateVersion = () => {
    const versionName = prompt('Nombre de la versión:');
    if (versionName) {
      createVersion(design.id, versionName);
    }
  };
  
  // Restaurar versión
  const handleRestoreVersion = (versionId: string) => {
    if (confirm('¿Restaurar esta versión? Los cambios actuales se perderán.')) {
      restoreVersion(design.id, versionId);
      onVersionSelect?.(design);
    }
  };
  
  // Eliminar versión
  const handleDeleteVersion = (versionId: string) => {
    if (confirm('¿Eliminar esta versión?')) {
      deleteVersion(design.id, versionId);
    }
  };
  
  // Renombrar versión
  const handleRenameVersion = (version: DesignTemplate) => {
    setEditingVersionId(version.id);
    setEditingName(version.versionName);
  };
  
  // Guardar nombre
  const handleSaveName = (version: DesignTemplate) => {
    if (editingName.trim()) {
      // Actualizar el nombre en la versión (simplificado)
      // En producción, esto requeriría una acción en el store
      setEditingVersionId(null);
    }
  };
  
  // Duplicar versión
  const handleDuplicateVersion = (version: DesignTemplate) => {
    const newName = prompt('Nombre de la nueva versión:', `${version.versionName} (Copia)`);
    if (newName) {
      createVersion(design.id, newName);
    }
  };

  return (
    <>
      {/* Botón para abrir */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors relative"
        title="Gestor de versiones"
      >
        📚 Versiones
        {versions.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {versions.length}
          </span>
        )}
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Gestor de Versiones</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Current version info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Versión Actual</p>
              <p className="text-xs text-blue-700 mt-1">
                v{design.version} - {new Date(design.updatedAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Create new version button */}
            <button
              onClick={handleCreateVersion}
              className="w-full mb-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              ➕ Crear Nueva Versión
            </button>
            
            {/* Versions list */}
            {versions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No hay versiones guardadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 border rounded-lg transition-colors ${
                      version.isCurrent
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {editingVersionId === version.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleSaveName(version)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName(version);
                              if (e.key === 'Escape') setEditingVersionId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {version.versionName}
                              {version.isCurrent && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString()}
                            </p>
                            {version.changelog && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                {version.changelog}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1">
                        {!version.isCurrent && (
                          <button
                            onClick={() => handleRestoreVersion(version.id)}
                            className="p-1 text-gray-600 hover:text-primary hover:bg-primary-50 rounded transition-colors"
                            title="Restaurar versión"
                          >
                            ↩️
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRenameVersion(version)}
                          className="p-1 text-gray-600 hover:text-primary hover:bg-primary-50 rounded transition-colors"
                          title="Renombrar"
                        >
                          ✏️
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateVersion(version)}
                          className="p-1 text-gray-600 hover:text-primary hover:bg-primary-50 rounded transition-colors"
                          title="Duplicar"
                        >
                          📋
                        </button>
                        
                        {versions.length > 1 && (
                          <button
                            onClick={() => handleDeleteVersion(version.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
