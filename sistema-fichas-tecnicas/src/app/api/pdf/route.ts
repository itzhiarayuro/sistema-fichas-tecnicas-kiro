/**
 * API Route para generación de PDF individual
 * Requirements: 7.1
 * 
 * POST /api/pdf
 * Body: { ficha: FichaState, pozo: Pozo, options?: PDFGeneratorOptions }
 * Response: PDF blob o error
 * 
 * Mejoras:
 * - Validación robusta de fotos (detecta blob: URLs)
 * - Logs detallados para debugging
 * - Manejo de errores específicos
 * - Información de recursos
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFMakeGenerator, type PDFGeneratorOptions } from '@/lib/pdf';
import { validatePozoPhotos, logValidationDetails } from '@/lib/helpers/photoValidator';
import type { FichaState } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';

interface PDFRequestBody {
  ficha: FichaState;
  pozo: Pozo;
  options?: PDFGeneratorOptions;
}

/**
 * Obtiene información de memoria disponible
 */
function getMemoryInfo(): { usedMB: number; totalMB: number } {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      usedMB: Math.round(usage.heapUsed / 1024 / 1024),
      totalMB: Math.round(usage.heapTotal / 1024 / 1024),
    };
  }
  return { usedMB: 0, totalMB: 0 };
}

/**
 * Registra información de inicio de generación
 */
function logGenerationStart(pozoId: string, fotosCount: number): void {
  const memory = getMemoryInfo();
  console.log('═'.repeat(60));
  console.log('🚀 INICIANDO GENERACIÓN DE PDF');
  console.log('═'.repeat(60));
  console.log(`📍 Pozo ID: ${pozoId}`);
  console.log(`📸 Fotos: ${fotosCount}`);
  console.log(`💾 Memoria: ${memory.usedMB}MB / ${memory.totalMB}MB`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('─'.repeat(60));
}

/**
 * Registra información de finalización
 */
function logGenerationEnd(
  pozoId: string,
  success: boolean,
  duration: number,
  error?: string
): void {
  const memory = getMemoryInfo();
  console.log('─'.repeat(60));
  if (success) {
    console.log(`✅ PDF GENERADO EXITOSAMENTE`);
  } else {
    console.log(`❌ ERROR EN GENERACIÓN: ${error}`);
  }
  console.log(`⏱️ Duración: ${duration}ms`);
  console.log(`💾 Memoria final: ${memory.usedMB}MB / ${memory.totalMB}MB`);
  console.log('═'.repeat(60));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let pozoId = 'unknown';

  try {
    // 1. Parsear JSON
    let body: PDFRequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'JSON inválido en el body de la solicitud',
          details: parseError instanceof Error ? parseError.message : 'Error desconocido',
        },
        { status: 400 }
      );
    }

    // 2. Validar datos requeridos
    if (!body.ficha || !body.pozo) {
      console.error('❌ Datos incompletos:', { hasFicha: !!body.ficha, hasPozo: !!body.pozo });
      return NextResponse.json(
        {
          success: false,
          error: 'Datos incompletos: se requiere ficha y pozo',
        },
        { status: 400 }
      );
    }

    const { ficha, pozo, options = {} } = body;
    pozoId = (pozo.idPozo?.value || pozo.idPozo || 'unknown') as string;

    logGenerationStart(pozoId, 0);

    // 3. Contar fotos
    const fotosCount = (
      (pozo.fotos?.principal?.length || 0) +
      (pozo.fotos?.entradas?.length || 0) +
      (pozo.fotos?.salidas?.length || 0) +
      (pozo.fotos?.sumideros?.length || 0) +
      (pozo.fotos?.otras?.length || 0)
    );

    console.log(`📸 Total de fotos encontradas: ${fotosCount}`);

    // Contar fotos con dataUrl
    const fotosConDataUrl = (
      (pozo.fotos?.principal?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.entradas?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.salidas?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.sumideros?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.otras?.filter((f: any) => f.dataUrl)?.length || 0)
    );

    console.log(`📸 Fotos con dataUrl: ${fotosConDataUrl}`);

    if (fotosCount === 0) {
      console.warn('⚠️ No hay fotos asociadas al pozo');
      return NextResponse.json(
        {
          success: false,
          error: 'No se puede generar PDF: la ficha no tiene fotos asociadas. Por favor, carga al menos una foto antes de generar el PDF.',
        },
        { status: 400 }
      );
    }

    if (fotosConDataUrl === 0) {
      console.warn('⚠️ Hay fotos pero sin dataUrl (no procesadas)');
      return NextResponse.json(
        {
          success: false,
          error: 'Las fotos no están procesadas. Por favor, recarga las fotos.',
        },
        { status: 400 }
      );
    }

    // 4. Validar fotos
    console.log('🔍 Validando fotos...');
    const validationResult = validatePozoPhotos(pozo);
    logValidationDetails(pozoId, validationResult);

    if (!validationResult.isValid) {
      console.error('❌ Validación de fotos fallida');
      logGenerationEnd(pozoId, false, Date.now() - startTime, 'Validación de fotos fallida');
      return NextResponse.json(
        {
          success: false,
          error: 'Validación de fotos fallida',
          details: validationResult.errors,
          hasBlobUrls: validationResult.hasBlobUrls,
          invalidPhotos: validationResult.invalidPhotos,
        },
        { status: 400 }
      );
    }

    if (validationResult.hasBlobUrls) {
      console.error('❌ Se detectaron URLs blob: (no soportadas en servidor)');
      logGenerationEnd(
        pozoId,
        false,
        Date.now() - startTime,
        'URLs blob: detectadas'
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Se detectaron URLs blob: en las fotos. Estas no son soportadas en el servidor. Por favor, recarga las fotos.',
          hasBlobUrls: true,
          invalidPhotos: validationResult.invalidPhotos,
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación de fotos exitosa');
    console.log(`📊 Tamaño total de fotos: ${validationResult.totalSizeMB.toFixed(2)}MB`);

    // 5. Generar PDF
    console.log('🔨 Generando PDF con PDFMakeGenerator...');
    const generator = new PDFMakeGenerator();
    const result = await generator.generatePDF(ficha, pozo, options);

    if (!result.success || !result.blob) {
      console.error('❌ Error en generación de PDF:', result.error);
      logGenerationEnd(
        pozoId,
        false,
        Date.now() - startTime,
        result.error || 'Error desconocido'
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al generar PDF',
        },
        { status: 500 }
      );
    }

    // 6. Convertir blob a ArrayBuffer
    console.log('📦 Convirtiendo blob a ArrayBuffer...');
    const arrayBuffer = await result.blob.arrayBuffer();
    const fileSizeMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2);
    console.log(`✅ PDF generado: ${fileSizeMB}MB`);

    // 7. Retornar PDF
    logGenerationEnd(pozoId, true, Date.now() - startTime);
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('❌ EXCEPCIÓN EN /api/pdf:');
    console.error('Mensaje:', errorMessage);
    console.error('Stack:', errorStack);

    logGenerationEnd(pozoId, false, duration, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pdf - Información del endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/pdf',
    method: 'POST',
    description: 'Genera un PDF para una ficha técnica individual',
    body: {
      ficha: 'FichaState - Estado de la ficha',
      pozo: 'Pozo - Datos del pozo',
      options: 'PDFGeneratorOptions (opcional) - Opciones de generación',
    },
    response: 'application/pdf - Archivo PDF descargable',
  });
}
