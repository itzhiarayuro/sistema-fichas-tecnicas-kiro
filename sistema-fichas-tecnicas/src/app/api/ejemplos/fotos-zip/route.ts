/**
 * API Route: GET /api/ejemplos/fotos-zip
 * Genera un ZIP con todas las imágenes de ejemplo
 */

import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Importar JSZip dinámicamente
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Ruta a la carpeta de ejemplos
    const examplesDir = join(process.cwd(), 'public', 'ejemplos');

    // Leer todas las imágenes
    const files = readdirSync(examplesDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    // Agregar cada imagen al ZIP
    for (const file of imageFiles) {
      const filePath = join(examplesDir, file);
      const fileContent = readFileSync(filePath);
      zip.file(file, fileContent);
    }

    // Generar el ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Retornar como descarga
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="fotos-ejemplo.zip"',
      },
    });
  } catch (error) {
    console.error('Error generando ZIP:', error);
    return NextResponse.json(
      { error: 'Error al generar ZIP' },
      { status: 500 }
    );
  }
}
