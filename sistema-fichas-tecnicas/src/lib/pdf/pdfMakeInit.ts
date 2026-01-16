/**
 * pdfMakeInit.ts - Inicializador de pdfmake con Promise Caching
 * 
 * Garantiza:
 * - UNA sola inicialización aunque se llame N veces simultáneamente
 * - Todas las llamadas concurrentes reutilizan la misma Promise
 * - Carga lazy (on-demand)
 * - Usa Helvetica como fuente estándar (incluida en PDF)
 * - VFS configurado globalmente para evitar errores de AFM
 */

// Importar inicialización global para asegurar que VFS se configura temprano
import './pdfMakeGlobalInit';

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
 * Minimal AFM (Adobe Font Metrics) data for standard fonts
 * These are required by pdfmake when using bold/italic variants
 */
const MINIMAL_AFM_DATA = {
  'data/Helvetica.afm': 'StartFontMetrics 4.1\nFontName Helvetica\nFullName Helvetica\nFamilyName Helvetica\nWeight Medium\nItalicAngle 0\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -951 -481 1446 1122\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Helvetica-Bold.afm': 'StartFontMetrics 4.1\nFontName Helvetica-Bold\nFullName Helvetica Bold\nFamilyName Helvetica\nWeight Bold\nItalicAngle 0\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -951 -481 1446 1122\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Helvetica-Oblique.afm': 'StartFontMetrics 4.1\nFontName Helvetica-Oblique\nFullName Helvetica Oblique\nFamilyName Helvetica\nWeight Medium\nItalicAngle -12\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -951 -481 1446 1122\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Helvetica-BoldOblique.afm': 'StartFontMetrics 4.1\nFontName Helvetica-BoldOblique\nFullName Helvetica Bold Oblique\nFamilyName Helvetica\nWeight Bold\nItalicAngle -12\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -951 -481 1446 1122\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Times-Roman.afm': 'StartFontMetrics 4.1\nFontName Times-Roman\nFullName Times Roman\nFamilyName Times\nWeight Medium\nItalicAngle 0\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -168 -218 1000 898\nUnderlinePosition -75\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Times-Bold.afm': 'StartFontMetrics 4.1\nFontName Times-Bold\nFullName Times Bold\nFamilyName Times\nWeight Bold\nItalicAngle 0\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -168 -218 1000 898\nUnderlinePosition -75\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Times-Italic.afm': 'StartFontMetrics 4.1\nFontName Times-Italic\nFullName Times Italic\nFamilyName Times\nWeight Medium\nItalicAngle -12\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -168 -218 1000 898\nUnderlinePosition -75\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Times-BoldItalic.afm': 'StartFontMetrics 4.1\nFontName Times-BoldItalic\nFullName Times Bold Italic\nFamilyName Times\nWeight Bold\nItalicAngle -12\nIsFixedPitch false\nCharacterSet StandardRoman\nFontBBox -168 -218 1000 898\nUnderlinePosition -75\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Courier.afm': 'StartFontMetrics 4.1\nFontName Courier\nFullName Courier\nFamilyName Courier\nWeight Medium\nItalicAngle 0\nIsFixedPitch true\nCharacterSet StandardRoman\nFontBBox -27 -250 628 805\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Courier-Bold.afm': 'StartFontMetrics 4.1\nFontName Courier-Bold\nFullName Courier Bold\nFamilyName Courier\nWeight Bold\nItalicAngle 0\nIsFixedPitch true\nCharacterSet StandardRoman\nFontBBox -27 -250 628 805\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Courier-Oblique.afm': 'StartFontMetrics 4.1\nFontName Courier-Oblique\nFullName Courier Oblique\nFamilyName Courier\nWeight Medium\nItalicAngle -12\nIsFixedPitch true\nCharacterSet StandardRoman\nFontBBox -27 -250 628 805\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
  'data/Courier-BoldOblique.afm': 'StartFontMetrics 4.1\nFontName Courier-BoldOblique\nFullName Courier Bold Oblique\nFamilyName Courier\nWeight Bold\nItalicAngle -12\nIsFixedPitch true\nCharacterSet StandardRoman\nFontBBox -27 -250 628 805\nUnderlinePosition -100\nUnderlineThickness 50\nVersion 2.0\nNotice Copyright\nEncodingScheme FontSpecific\nEndFontMetrics',
};

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

    // Configurar VFS con métricas de fuentes mínimas ANTES de cualquier otra operación
    // Esto previene errores "File not found in virtual file system"
    // IMPORTANTE: Esto debe hacerse ANTES de que se intente crear cualquier PDF
    pdfMake.vfs = { ...MINIMAL_AFM_DATA };
    
    // Configurar fuentes estándar de PDF (no requieren archivos TTF)
    // Helvetica, Times, Courier son fuentes built-in de PDF
    pdfMake.fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      },
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      }
    };
    
    // Configurar también globalmente en window para asegurar que está disponible
    if (typeof window !== 'undefined') {
      (window as any).pdfMake = pdfMake;
    }
    
    console.log('[pdfMake] ✅ Inicializado con fuentes estándar de PDF (Helvetica)');
    console.log('[pdfMake] ✅ VFS configurado con métricas de fuentes');

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
