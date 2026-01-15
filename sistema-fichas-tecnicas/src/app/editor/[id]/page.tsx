/**
 * Editor Page - Página de edición de ficha técnica
 * Requirements: 3.1, 4.1-4.5, 6.1-6.4, 12.1, 12.2, 12.4, 14.1-14.4, 16.8, 16.9, 18.2, 18.4, 18.5
 * 
 * Integra el EditorLayout con las secciones de ficha para
 * proporcionar una experiencia de edición visual completa
 * con sincronización bidireccional en tiempo real.
 * 
 * Incluye:
 * - Panel de personalización de formato (colores, fuentes, espaciado)
 * - Selector de plantillas predefinidas
 * - Indicador de scope (local vs global)
 * - Confirmación doble para acciones destructivas
 * - Modo guiado con recomendaciones contextuales (Requirements 14.1-14.4)
 * - Indicadores de flujo del workflow (Requirements 18.4, 18.5)
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  EditorLayout,
  PreviewPanel,
  IdentificacionSection,
  EstructuraSection,
  TuberiasSection,
  FotosSection,
  ObservacionesSection,
  CustomizationPanel,
  TemplateSelector,
  templateToCustomization,
  ScopeIndicator,
  ToolBar,
} from '@/components/editor';
import { useConfirmDialog } from '@/components/ui';
import { 
  RecommendationsPanel, 
  RestrictedAction,
  GuidedModeBadge,
} from '@/components/guided';
import { AppShell, WorkflowBreadcrumbs, NextStepIndicator } from '@/components/layout';
import { useGlobalStore, useUIStore, type Template } from '@/stores';
import { createFichaStore, type FichaStore } from '@/stores/fichaStore';
import { useSyncEngine, type SyncConflict } from '@/lib/sync';
import type { FieldValue, FichaState, FichaCustomization } from '@/types/ficha';

// Helper para crear FieldValue desde string
function createFieldValue(value: string, source: FieldValue['source'] = 'excel'): FieldValue {
  return { value, source };
}

// Helper para crear estado inicial de ficha desde pozo
function createInitialFichaState(pozoId: string): FichaState {
  return {
    id: `ficha-${pozoId}`,
    pozoId,
    status: 'editing',
    sections: [
      {
        id: 'identificacion',
        type: 'identificacion',
        order: 0,
        visible: true,
        locked: true,
        content: {},
      },
      {
        id: 'estructura',
        type: 'estructura',
        order: 1,
        visible: true,
        locked: false,
        content: {},
      },
      {
        id: 'tuberias',
        type: 'tuberias',
        order: 2,
        visible: true,
        locked: false,
        content: {},
      },
      {
        id: 'fotos',
        type: 'fotos',
        order: 3,
        visible: true,
        locked: false,
        content: {},
      },
      {
        id: 'observaciones',
        type: 'observaciones',
        order: 4,
        visible: true,
        locked: false,
        content: {},
      },
    ],
    customizations: {
      colors: {
        headerBg: '#1F4E79',
        headerText: '#FFFFFF',
        sectionBg: '#FFFFFF',
        sectionText: '#333333',
        labelText: '#666666',
        valueText: '#000000',
        borderColor: '#E5E7EB',
      },
      fonts: {
        titleSize: 16,
        labelSize: 12,
        valueSize: 12,
        fontFamily: 'Inter',
      },
      spacing: {
        sectionGap: 16,
        fieldGap: 8,
        padding: 16,
        margin: 24,
      },
      template: 'standard',
      isGlobal: false,
    },
    history: [],
    errors: [],
    lastModified: Date.now(),
    version: 1,
  };
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const pozoId = params.id as string;
  
  const pozo = useGlobalStore((state) => state.getPozoById(pozoId));
  const setCurrentStep = useGlobalStore((state) => state.setCurrentStep);
  const addToast = useUIStore((state) => state.addToast);
  const { confirmResetFormat, confirmDiscardChanges } = useConfirmDialog();
  
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [showCustomization, setShowCustomization] = useState(false);
  const [fichaStore, setFichaStore] = useState<FichaStore | null>(null);
  
  // Set current workflow step
  useEffect(() => {
    setCurrentStep('edit');
  }, [setCurrentStep]);
  
  // Initialize ficha store
  useEffect(() => {
    if (!pozoId) return;
    
    const initialState = createInitialFichaState(pozoId);
    const store = createFichaStore(initialState);
    setFichaStore(store.getState());
  }, [pozoId]);
  
  // Estado de personalización local
  const [customizations, setCustomizations] = useState<FichaCustomization>({
    colors: {
      headerBg: '#1F4E79',
      headerText: '#FFFFFF',
      sectionBg: '#FFFFFF',
      sectionText: '#333333',
      labelText: '#666666',
      valueText: '#000000',
      borderColor: '#E5E7EB',
    },
    fonts: {
      titleSize: 16,
      labelSize: 12,
      valueSize: 12,
      fontFamily: 'Inter',
    },
    spacing: {
      sectionGap: 16,
      fieldGap: 8,
      padding: 16,
      margin: 24,
    },
    template: 'standard',
    isGlobal: false,
  });
  
  // Estado inicial de la ficha
  const initialFichaState = useMemo(() => {
    if (!pozo) return null;
    return createInitialFichaState(pozoId);
  }, [pozoId, pozo]);
  
  // Callback para manejar conflictos de sincronización
  const handleConflict = useCallback((conflict: SyncConflict) => {
    addToast({
      type: 'warning',
      message: conflict.message,
      duration: 5000,
    });
  }, [addToast]);
  
  // Hook de sincronización
  const {
    syncedState,
    version,
    isPending,
    updateField,
  } = useSyncEngine({
    initialState: initialFichaState,
    onConflict: handleConflict,
    debug: process.env.NODE_ENV === 'development',
  });
  
  // Datos de identificación
  const identificacionData = useMemo(() => {
    if (!pozo) {
      return {
        codigo: createFieldValue('', 'default'),
        direccion: createFieldValue('', 'default'),
        barrio: createFieldValue('', 'default'),
        sistema: createFieldValue('', 'default'),
        estado: createFieldValue('', 'default'),
        fecha: createFieldValue('', 'default'),
      };
    }
    return {
      codigo: createFieldValue(pozo.idPozo),
      direccion: createFieldValue(pozo.direccion),
      barrio: createFieldValue(pozo.barrio),
      sistema: createFieldValue(pozo.sistema),
      estado: createFieldValue(pozo.estado),
      fecha: createFieldValue(pozo.fecha),
    };
  }, [pozo]);
  
  // Datos de estructura
  const estructuraData = useMemo(() => {
    if (!pozo) {
      return {
        alturaTotal: createFieldValue('', 'default'),
        rasante: createFieldValue('', 'default'),
        tapaMaterial: createFieldValue('', 'default'),
        tapaEstado: createFieldValue('', 'default'),
        conoTipo: createFieldValue('', 'default'),
        conoMaterial: createFieldValue('', 'default'),
        cuerpoDiametro: createFieldValue('', 'default'),
        canuelaMaterial: createFieldValue('', 'default'),
        peldanosCantidad: createFieldValue('', 'default'),
        peldanosMaterial: createFieldValue('', 'default'),
      };
    }
    return {
      alturaTotal: createFieldValue(pozo.elevacion),
      rasante: createFieldValue(pozo.profundidad),
      tapaMaterial: createFieldValue(pozo.materialTapa),
      tapaEstado: createFieldValue(pozo.estadoTapa),
      conoTipo: createFieldValue(pozo.tipoCono),
      conoMaterial: createFieldValue(pozo.materialCono),
      cuerpoDiametro: createFieldValue(pozo.diametroCilindro),
      canuelaMaterial: createFieldValue(pozo.materialCanuela),
      peldanosCantidad: createFieldValue(pozo.numeroPeldanos),
      peldanosMaterial: createFieldValue(pozo.materialPeldanos),
    };
  }, [pozo]);
  
  // Datos de tuberías
  const tuberiasData = useMemo(() => {
    if (!pozo || !pozo.tuberias) {
      return { entradas: [], salidas: [] };
    }
    
    // Filtrar tuberías por tipo
    const entradas = Array.isArray(pozo.tuberias) 
      ? pozo.tuberias.filter((t: any) => {
          const tipo = typeof t.tipoTuberia === 'string' ? t.tipoTuberia : t.tipoTuberia?.value;
          return tipo === 'entrada';
        })
      : [];
    
    const salidas = Array.isArray(pozo.tuberias)
      ? pozo.tuberias.filter((t: any) => {
          const tipo = typeof t.tipoTuberia === 'string' ? t.tipoTuberia : t.tipoTuberia?.value;
          return tipo === 'salida';
        })
      : [];
    
    return {
      entradas: entradas.map((t: any) => ({
        id: t.idTuberia || t.id,
        diametro: createFieldValue(t.diametro),
        material: createFieldValue(t.material),
        cota: createFieldValue(t.cota),
        direccion: createFieldValue(t.tipoTuberia),
      })),
      salidas: salidas.map((t: any) => ({
        id: t.idTuberia || t.id,
        diametro: createFieldValue(t.diametro),
        material: createFieldValue(t.material),
        cota: createFieldValue(t.cota),
        direccion: createFieldValue(t.tipoTuberia),
      })),
    };
  }, [pozo]);
  
  // Datos de fotos organizadas por categoría
  const fotosData = useMemo(() => {
    if (!pozo) {
      return {
        principal: [],
        entradas: [],
        salidas: [],
        sumideros: [],
        otras: [],
      };
    }
    return {
      principal: pozo.fotos?.principal || [],
      entradas: pozo.fotos?.entradas || [],
      salidas: pozo.fotos?.salidas || [],
      sumideros: pozo.fotos?.sumideros || [],
      otras: pozo.fotos?.otras || [],
    };
  }, [pozo]);
  
  // Observaciones
  const observacionesData = useMemo(() => {
    if (!pozo) {
      return createFieldValue('', 'default');
    }
    return createFieldValue(pozo.observaciones);
  }, [pozo]);
  
  // Handlers para cambios de campo (sincronizados)
  const handleFieldChange = useCallback((sectionId: string, field: string, value: string) => {
    updateField(sectionId, field, value, 'editor');
  }, [updateField]);
  
  // Handler para resetear formato con confirmación doble
  const handleResetFormat = useCallback(async () => {
    const confirmed = await confirmResetFormat();
    if (confirmed) {
      // Reset customizations to default
      setCustomizations({
        colors: {
          headerBg: '#1F4E79',
          headerText: '#FFFFFF',
          sectionBg: '#FFFFFF',
          sectionText: '#333333',
          labelText: '#666666',
          valueText: '#000000',
          borderColor: '#E5E7EB',
        },
        fonts: {
          titleSize: 16,
          labelSize: 12,
          valueSize: 12,
          fontFamily: 'Inter',
        },
        spacing: {
          sectionGap: 16,
          fieldGap: 8,
          padding: 16,
          margin: 24,
        },
        template: 'standard',
        isGlobal: false,
      });
      addToast({
        type: 'success',
        message: 'Formato restaurado a valores predeterminados',
      });
    }
  }, [confirmResetFormat, addToast]);
  
  // Handler para cambios de personalización
  const handleCustomizationsChange = useCallback((changes: Partial<FichaCustomization>) => {
    setCustomizations((prev) => ({
      ...prev,
      ...changes,
      colors: changes.colors ? { ...prev.colors, ...changes.colors } : prev.colors,
      fonts: changes.fonts ? { ...prev.fonts, ...changes.fonts } : prev.fonts,
      spacing: changes.spacing ? { ...prev.spacing, ...changes.spacing } : prev.spacing,
    }));
  }, []);
  
  // Handler para selección de plantilla
  const handleTemplateSelect = useCallback((template: Template) => {
    const newCustomizations = templateToCustomization(template);
    setCustomizations((prev) => ({
      ...prev,
      ...newCustomizations,
      colors: { ...prev.colors, ...newCustomizations.colors },
      fonts: { ...prev.fonts, ...newCustomizations.fonts },
    }));
    addToast({
      type: 'success',
      message: `Plantilla "${template.name}" aplicada`,
    });
  }, [addToast]);
  
  // Handler para cambio de scope
  const handleScopeChange = useCallback((isGlobal: boolean) => {
    setCustomizations((prev) => ({ ...prev, isGlobal }));
    addToast({
      type: 'info',
      message: isGlobal 
        ? 'Los cambios se aplicarán a futuras fichas'
        : 'Los cambios solo afectan esta ficha',
    });
  }, [addToast]);
  
  // Handler para volver con confirmación si hay cambios sin guardar
  const handleBack = useCallback(async () => {
    // TODO: Verificar si hay cambios sin guardar
    const hasUnsavedChanges = false; // Placeholder - implementar detección de cambios
    
    if (hasUnsavedChanges) {
      const confirmed = await confirmDiscardChanges();
      if (!confirmed) return;
    }
    
    router.push('/pozos');
  }, [confirmDiscardChanges, router]);
  
  // Si no hay pozo, mostrar mensaje
  if (!pozo) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Pozo no encontrado</h2>
            <p className="text-gray-500 mb-4">
              No se encontró el pozo con ID: {pozoId}
            </p>
            <button
              onClick={() => router.push('/pozos')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Volver a la lista de pozos
            </button>
          </div>
        </div>
      </AppShell>
    );
  }
  
  // Contenido del editor
  const editorContent = (
    <div className="space-y-4">
      {/* Panel de recomendaciones del modo guiado - Requirements 14.1-14.4 */}
      <RecommendationsPanel className="mb-4" maxItems={2} />
      
      {/* Panel de personalización colapsable */}
      {showCustomization && (
        <div className="space-y-4">
          <TemplateSelector
            currentTemplate={customizations.template}
            onTemplateSelect={handleTemplateSelect}
            variant="dropdown"
          />
          <RestrictedAction action="advanced-customization">
            <CustomizationPanel
              customizations={customizations}
              onCustomizationsChange={handleCustomizationsChange}
              onToggleCollapse={() => setShowCustomization(false)}
            />
          </RestrictedAction>
        </div>
      )}
      
      <IdentificacionSection
        id="identificacion"
        data={identificacionData}
        locked={true}
        onFieldChange={(field, value) => handleFieldChange('identificacion', field as string, value)}
      />
      
      <EstructuraSection
        id="estructura"
        data={estructuraData}
        onFieldChange={(field, value) => handleFieldChange('estructura', field as string, value)}
      />
      
      <TuberiasSection
        id="tuberias"
        entradas={tuberiasData.entradas}
        salidas={tuberiasData.salidas}
      />
      
      <FotosSection
        id="fotos"
        principal={fotosData.principal}
        entradas={fotosData.entradas}
        salidas={fotosData.salidas}
        sumideros={fotosData.sumideros}
        otras={fotosData.otras}
      />
      
      <ObservacionesSection
        id="observaciones"
        observaciones={observacionesData}
        onObservacionesChange={(value: string) => handleFieldChange('observaciones', 'texto', value)}
      />
    </div>
  );
  
  // Contenido de la vista previa (usando PreviewPanel con sincronización)
  const previewContent = (
    <PreviewPanel
      fichaState={syncedState}
      pozo={pozo}
      showEditIndicators={true}
    />
  );
  
  // Toolbar
  const toolbar = fichaStore ? (
    <ToolBar
      fichaStore={fichaStore}
      pozo={pozo}
      onBack={handleBack}
      onCustomizeClick={() => setShowCustomization(!showCustomization)}
      onResetFormat={handleResetFormat}
      onGeneratePDF={async () => {
        // Validar que haya fotos
        const fotosCount = (
          (fotosData.principal?.length || 0) +
          (fotosData.entradas?.length || 0) +
          (fotosData.salidas?.length || 0) +
          (fotosData.sumideros?.length || 0) +
          (fotosData.otras?.length || 0)
        );

        if (fotosCount === 0) {
          addToast({
            type: 'error',
            message: 'No se puede generar PDF: la ficha no tiene fotos asociadas. Por favor, carga al menos una foto antes de generar el PDF.',
            duration: 5000,
          });
          return;
        }

        try {
          // Llamar a la API para generar PDF
          const response = await fetch('/api/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ficha: syncedState,
              pozo,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            addToast({
              type: 'error',
              message: error.error || 'Error al generar PDF',
              duration: 5000,
            });
            return;
          }

          // Descargar PDF
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ficha-${pozo.idPozo?.value || 'tecnica'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          addToast({
            type: 'success',
            message: 'PDF generado y descargado exitosamente',
          });
        } catch (error) {
          console.error('Error generando PDF:', error);
          addToast({
            type: 'error',
            message: 'Error al generar PDF. Por favor, intenta de nuevo.',
            duration: 5000,
          });
        }
      }}
      showCustomization={showCustomization}
      isPending={isPending}
      version={version}
      isGlobalScope={customizations.isGlobal}
      onScopeChange={handleScopeChange}
      showWorkflowIndicators={true}
    />
  ) : null;
  
  return (
    <AppShell>
      <div className="h-[calc(100vh-8rem)] -m-6">
        <EditorLayout
          editorContent={editorContent}
          previewContent={previewContent}
          toolbar={toolbar}
          mode={viewMode}
          onModeChange={setViewMode}
        />
      </div>
    </AppShell>
  );
}
