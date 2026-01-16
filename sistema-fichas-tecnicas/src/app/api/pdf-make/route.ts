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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let pozoId = 'unknown';

  try {
    let body: PDFRequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'JSON inválido en el body de la solicitud',
          details: parseError instanceof Error ? parseError.message : 'Error desconocido',
        },
        { status: 400 }
      );
    }

    if (!body.ficha || !body.pozo) {
      console.error('Datos incompletos:', { hasFicha: !!body.ficha, hasPozo: !!body.pozo });
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

    const fotosCount = (
      (pozo.fotos?.principal?.length || 0) +
      (pozo.fotos?.entradas?.length || 0) +
      (pozo.fotos?.salidas?.length || 0) +
      (pozo.fotos?.sumideros?.length || 0) +
      (pozo.fotos?.otras?.length || 0)
    );

    const fotosConDataUrl = (
      (pozo.fotos?.principal?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.entradas?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.salidas?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.sumideros?.filter((f: any) => f.dataUrl)?.length || 0) +
      (pozo.fotos?.otras?.filter((f: any) => f.dataUrl)?.length || 0)
    );

    if (fotosCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se puede generar PDF: la ficha no tiene fotos asociadas. Por favor, carga al menos una foto antes de generar el PDF.',
        },
        { status: 400 }
      );
    }

    if (fotosConDataUrl === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Las fotos no están procesadas. Por favor, recarga las fotos.',
        },
        { status: 400 }
      );
    }

    const validationResult = validatePozoPhotos(pozo);
    logValidationDetails(pozoId, validationResult);

    if (!validationResult.isValid) {
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

    const generator = new PDFMakeGenerator();
    const result = await generator.generatePDF(ficha, pozo, options);

    if (!result.success || !result.blob) {
      console.error('Error en generación de PDF:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al generar PDF',
        },
        { status: 500 }
      );
    }

    const buffer = await result.blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Excepción en /api/pdf-make:', errorMessage);

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
