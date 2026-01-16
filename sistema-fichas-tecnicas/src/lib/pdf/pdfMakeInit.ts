/**
 * pdfMakeInit.ts - Inicializador de pdfmake con Promise Caching
 * 
 * Garantiza:
 * - UNA sola inicialización aunque se llame N veces simultáneamente
 * - Todas las llamadas concurrentes reutilizan la misma Promise
 * - Carga lazy (on-demand)
 * - Soporte UTF-8 con Roboto (fuente por defecto de pdfmake)
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

    // Cargar fuentes por defecto de pdfmake (Roboto)
    let vfsLoaded = false;
    
    try {
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      
      // Manejar diferentes estructuras de export
      if (pdfFontsModule?.pdfMake?.vfs) {
        pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
        vfsLoaded = true;
      } else if (pdfFontsModule?.default?.pdfMake?.vfs) {
        pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
        vfsLoaded = true;
      } else if (pdfFontsModule?.default) {
        pdfMake.vfs = pdfFontsModule.default;
        vfsLoaded = true;
      } else if (pdfFontsModule?.vfs) {
        pdfMake.vfs = pdfFontsModule.vfs;
        vfsLoaded = true;
      } else {
        // Buscar vfs en cualquier propiedad del módulo
        const keys = Object.keys(pdfFontsModule);
        for (const key of keys) {
          const obj = (pdfFontsModule as Record<string, any>)[key];
          if (obj && typeof obj === 'object' && 'vfs' in obj) {
            pdfMake.vfs = obj.vfs;
            vfsLoaded = true;
            break;
          }
        }
      }
      
      if (vfsLoaded) {
        console.log('[pdfMake] ✅ VFS Roboto cargado correctamente');
      }
    } catch (fallbackError) {
      console.error('[pdfMake] ❌ No se pudieron cargar fuentes:', fallbackError);
    }

    if (!vfsLoaded) {
      throw new Error('No se pudo cargar el VFS de fuentes para pdfmake');
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
