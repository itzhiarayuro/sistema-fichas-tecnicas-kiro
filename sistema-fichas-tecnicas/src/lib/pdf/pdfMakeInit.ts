/**
 * pdfMakeInit.ts - Inicializador de pdfmake con Promise Caching
 * 
 * Garantiza:
 * - UNA sola inicialización aunque se llame N veces simultáneamente
 * - Todas las llamadas concurrentes reutilizan la misma Promise
 * - Carga lazy (on-demand)
 * - Soporte UTF-8 completo con fuente Inter
 */

'use client';

// Tipo para pdfmake
interface PdfMakeInstance {
  createPdf: (docDefinition: any) => {
    getBlob: (callback: (blob: Blob) => void) => void;
    getBase64: (callback: (base64: string) => void) => void;
    download: (filename?: string) => void;
  };
  vfs: Record<string, string>;
  fonts: Record<string, any>;
}

// Promise cacheada - compartida entre todas las llamadas
let pdfMakePromise: Promise<PdfMakeInstance> | null = null;

/**
 * Obtiene instancia de pdfmake con Promise Caching
 * 
 * Múltiples llamadas simultáneas comparten la misma Promise,
 * garantizando una única inicialización.
 * 
 * @example
 * // Llamadas concurrentes - solo UNA inicialización
 * const [pdf1, pdf2, pdf3] = await Promise.all([
 *   getPdfMake(),
 *   getPdfMake(),
 *   getPdfMake()
 * ]);
 * // pdf1 === pdf2 === pdf3
 */
export async function getPdfMake(): Promise<PdfMakeInstance> {
  // Si ya existe una Promise (en progreso o resuelta), reutilizarla
  if (pdfMakePromise) {
    return pdfMakePromise;
  }

  // Crear nueva Promise y cachearla ANTES de await
  pdfMakePromise = initializePdfMake();
  
  return pdfMakePromise;
}

/**
 * Inicialización interna de pdfmake
 * Solo se ejecuta una vez gracias al Promise Caching
 */
async function initializePdfMake(): Promise<PdfMakeInstance> {
  try {
    // Import dinámico de pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;

    // Cargar VFS personalizado con Inter
    let vfsLoaded = false;
    
    try {
      const { vfs } = await import('./fonts/vfs_fonts');
      
      if (vfs && Object.keys(vfs).length > 0) {
        pdfMake.vfs = vfs;
        vfsLoaded = true;
        console.log('[pdfMake] ✅ VFS Inter cargado:', Object.keys(vfs).length, 'fuentes');
      }
    } catch (vfsError) {
      console.warn('[pdfMake] ⚠️ VFS personalizado no disponible:', vfsError);
    }

    // Fallback: cargar fuentes por defecto de pdfmake
    if (!vfsLoaded) {
      try {
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
        
        // Manejar diferentes estructuras de export
        if (pdfFontsModule?.default) {
          pdfMake.vfs = pdfFontsModule.default;
        } else if (pdfFontsModule?.pdfMake?.vfs) {
          pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
        } else if (pdfFontsModule?.vfs) {
          pdfMake.vfs = pdfFontsModule.vfs;
        }
        
        console.warn('[pdfMake] ⚠️ Usando fuentes por defecto (Roboto). UTF-8 limitado.');
      } catch (fallbackError) {
        console.error('[pdfMake] ❌ No se pudieron cargar fuentes:', fallbackError);
      }
    }

    // Configurar fuentes Inter si VFS personalizado está disponible
    if (vfsLoaded) {
      const { fonts } = await import('./fonts/fontConfig');
      pdfMake.fonts = fonts;
    }

    return pdfMake as PdfMakeInstance;
  } catch (error) {
    // Limpiar cache en caso de error para permitir reintento
    pdfMakePromise = null;
    throw new Error(`Error inicializando pdfmake: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

/**
 * Verifica si pdfmake está inicializado
 */
export function isPdfMakeReady(): boolean {
  return pdfMakePromise !== null;
}

/**
 * Fuerza reinicialización (útil para testing)
 * ⚠️ No usar en producción
 */
export function resetPdfMake(): void {
  pdfMakePromise = null;
}

export default getPdfMake;
