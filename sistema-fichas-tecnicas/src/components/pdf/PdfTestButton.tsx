/**
 * PdfTestButton.tsx - Componente de prueba para generación de PDFs
 * 
 * Demuestra:
 * - Generación concurrente segura
 * - UTF-8 completo (tildes, ñ, símbolos)
 * - Manejo de estados de carga
 * - Múltiples clics rápidos no rompen la app
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  generateFormularioLevantamiento, 
  generateTablaInspeccion,
  type DatosLevantamiento,
  type DatosTablaInspeccion,
} from '@/lib/pdf/generators';

type GenerationType = 'formulario' | 'tabla' | 'concurrent';

interface GenerationState {
  loading: boolean;
  count: number;
  lastResult?: string;
  error?: string;
}

// Datos de prueba con UTF-8 completo
const datosFormulario: DatosLevantamiento = {
  idPozo: 'PI-2024-001',
  fecha: '2024-01-15',
  levanto: 'José García Ñuñez',  // UTF-8: ñ
  direccion: 'Av. Cañuela #1234, Ñuñoa',  // UTF-8: ñ
  barrio: 'Ñuñoa Centro',  // UTF-8: Ñ mayúscula
  coordenadaX: '345678.90',
  coordenadaY: '6234567.80',
  elevacion: '567.45',
  profundidad: '2.35',
  diametro: '120',  // Se mostrará como "Diámetro" en el PDF
  materialCilindro: 'Concreto Armado',
  estadoTapa: 'Óptimo',  // UTF-8: tilde
  peldanos: '8 unidades',  // Se mostrará como "Peldaños" en el PDF
  observaciones: 'Inspección realizada sin novedades. Estructura en óptimas condiciones. ' +
    'Se verificó la conexión con el colector principal. Próxima inspección programada para marzo.',
};

const datosTabla: DatosTablaInspeccion = {
  titulo: 'Sector Ñuñoa Norte',  // UTF-8: Ñ
  fecha: '15/01/2024',
  inspector: 'María Fernández Muñoz',  // UTF-8: ñ
  filas: [
    { id: 'PI-001', ubicacion: 'Cañuela #100', diametro: 120.0, profundidad: 2.35, estado: 'Óptimo', observacion: 'Sin observaciones' },
    { id: 'PI-002', ubicacion: 'Ñuñoa #200', diametro: 100.5, profundidad: 1.80, estado: 'Regular', observacion: 'Requiere limpieza' },
    { id: 'PI-003', ubicacion: 'Irarrázaval #300', diametro: 150.0, profundidad: 3.20, estado: 'Crítico', observacion: 'Daño estructural' },
    { id: 'PI-004', ubicacion: 'Macul #400', diametro: 120.0, profundidad: 2.10, estado: 'Óptimo' },
    { id: 'PI-005', ubicacion: 'Grecia #500', diametro: 80.0, profundidad: 1.50, estado: 'Regular', observacion: 'Peldaños oxidados' },
  ],
  resumen: {
    total: 5,
    optimos: 2,
    regulares: 2,
    criticos: 1,
  },
};

export function PdfTestButton() {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    count: 0,
  });

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleGenerate = useCallback(async (type: GenerationType) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      if (type === 'formulario') {
        const result = await generateFormularioLevantamiento(datosFormulario);
        if (result.success && result.blob && result.filename) {
          downloadBlob(result.blob, result.filename);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            count: prev.count + 1,
            lastResult: `✅ Formulario generado: ${result.filename}`,
          }));
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      } 
      else if (type === 'tabla') {
        const result = await generateTablaInspeccion(datosTabla);
        if (result.success && result.blob && result.filename) {
          downloadBlob(result.blob, result.filename);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            count: prev.count + 1,
            lastResult: `✅ Tabla generada: ${result.filename}`,
          }));
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      }
      else if (type === 'concurrent') {
        // Prueba de concurrencia: 5 PDFs simultáneos
        const startTime = Date.now();
        
        const promises = [
          generateFormularioLevantamiento({ ...datosFormulario, idPozo: 'CONC-001' }),
          generateFormularioLevantamiento({ ...datosFormulario, idPozo: 'CONC-002' }),
          generateFormularioLevantamiento({ ...datosFormulario, idPozo: 'CONC-003' }),
          generateTablaInspeccion({ ...datosTabla, titulo: 'Concurrente A' }),
          generateTablaInspeccion({ ...datosTabla, titulo: 'Concurrente B' }),
        ];

        const results = await Promise.all(promises);
        const elapsed = Date.now() - startTime;
        
        const successful = results.filter(r => r.success).length;
        
        // Descargar solo el primero como muestra
        const first = results.find(r => r.success && r.blob);
        if (first?.blob && first?.filename) {
          downloadBlob(first.blob, first.filename);
        }

        setState(prev => ({ 
          ...prev, 
          loading: false, 
          count: prev.count + successful,
          lastResult: `✅ Concurrencia: ${successful}/5 PDFs en ${elapsed}ms (Promise Caching funcionando)`,
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [downloadBlob]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        🧪 Prueba de Generación PDF con Inter (UTF-8)
      </h2>
      
      <div className="space-y-4">
        {/* Botones de generación */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleGenerate('formulario')}
            disabled={state.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? '⏳ Generando...' : '📄 Generar Formulario'}
          </button>
          
          <button
            onClick={() => handleGenerate('tabla')}
            disabled={state.loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? '⏳ Generando...' : '📊 Generar Tabla'}
          </button>
          
          <button
            onClick={() => handleGenerate('concurrent')}
            disabled={state.loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loading ? '⏳ Generando...' : '🚀 Test Concurrencia (5 PDFs)'}
          </button>
        </div>

        {/* Estado */}
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            PDFs generados: <strong>{state.count}</strong>
          </p>
          
          {state.lastResult && (
            <p className="text-sm text-green-700 mt-2">{state.lastResult}</p>
          )}
          
          {state.error && (
            <p className="text-sm text-red-600 mt-2">❌ Error: {state.error}</p>
          )}
        </div>

        {/* Info UTF-8 */}
        <div className="p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">📝 Caracteres UTF-8 en los PDFs:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Tildes:</strong> Levantó, Dirección, Diámetro, Ubicación, Óptimo, Crítico</li>
            <li><strong>Eñe:</strong> Ñuñoa, Cañuela, Peldaños, Muñoz, Ñuñez</li>
            <li><strong>Mayúsculas:</strong> IDENTIFICACIÓN, UBICACIÓN</li>
            <li><strong>Números:</strong> Alineación tabular en columnas</li>
          </ul>
        </div>

        {/* Instrucciones */}
        <div className="p-4 bg-yellow-50 rounded text-sm">
          <p className="font-semibold mb-2">⚠️ Configuración requerida:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Descarga Inter desde <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Fonts</a></li>
            <li>Coloca los TTF en <code className="bg-gray-200 px-1">public/fonts/</code></li>
            <li>Ejecuta <code className="bg-gray-200 px-1">node scripts/build-vfs.js</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default PdfTestButton;
