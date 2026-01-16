/**
 * Página de prueba para generación de PDFs
 * Ruta: /pdf-test
 */

'use client';

import { PdfTestButton } from '@/components/pdf';

export default function PdfTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">
          Test de PDFs con pdfmake + Inter
        </h1>
        <PdfTestButton />
      </div>
    </main>
  );
}
