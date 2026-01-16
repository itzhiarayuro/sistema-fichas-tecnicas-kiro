/**
 * API Route para generación de PDF con pdfmake
 * Requirements: 7.1
 * 
 * POST /api/pdf-make
 * Body: { ficha: FichaState, pozo: Pozo, options?: PDFGeneratorOptions }
 * Response: PDF blob o error
 * 
 * Mejoras sobre jsPDF:
 * - Cero espacios en selección de texto
 * - Soporte UTF-8 nativo
 * - Layout profesional
 * - Mejor rendimiento
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFMakeGenerator, type PDFGeneratorOptions } from '@/lib/pdf';
import type { FichaState } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';

interface PDFRequestBody {
  ficha: FichaState;
  pozo: Pozo;
  options?: PDFGeneratorOptions;
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequestBody = await request.json();
    
    // Validar datos requeridos
    if (!body.ficha || !body.pozo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos: se requiere ficha y pozo' 
        },
        { status: 400 }
      );
    }

    const { ficha, pozo, options = {} } = body;

    // Validar que haya fotos asociadas
    const fotosCount = (
      (pozo.fotos?.principal?.length || 0) +
      (pozo.fotos?.entradas?.length || 0) +
      (pozo.fotos?.salidas?.length || 0) +
      (pozo.fotos?.sumideros?.length || 0) +
      (pozo.fotos?.otras?.length || 0)
    );

    if (fotosCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede generar PDF: la ficha no tiene fotos asociadas. Por favor, carga al menos una foto antes de generar el PDF.' 
        },
        { status: 400 }
      );
    }

    // Generar PDF con pdfmake
    const generator = new PDFMakeGenerator();
    const result = await generator.generatePDF(ficha, pozo, options);

    if (!result.success || !result.blob) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Error al generar PDF' 
        },
        { status: 500 }
      );
    }

    // Convertir blob a buffer
    const buffer = await result.blob.arrayBuffer();
    
    // Retornar PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
