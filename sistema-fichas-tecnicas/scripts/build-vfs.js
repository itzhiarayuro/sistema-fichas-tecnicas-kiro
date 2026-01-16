/**
 * build-vfs.js - Genera vfs_fonts.ts desde archivos TTF de Inter
 * 
 * Uso: node scripts/build-vfs.js
 * 
 * Requisitos:
 * - Archivos TTF de Inter en public/fonts/
 *   - Inter-Regular.ttf
 *   - Inter-Italic.ttf  
 *   - Inter-Medium.ttf (usado como Bold)
 *   - Inter-Bold.ttf
 *   - Inter-BoldItalic.ttf (opcional)
 */

const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '../public/fonts');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/pdf/fonts/vfs_fonts.ts');

// Variable Fonts de Google Fonts (nombres reales)
const FONT_FILES = {
  // Variable font normal (incluye todos los pesos)
  'Inter-VariableFont_opsz,wght.ttf': 'Inter-Regular.ttf',
  // Variable font italic
  'Inter-Italic-VariableFont_opsz,wght.ttf': 'Inter-Italic.ttf',
};

// Alternativa: Si tienes los archivos estáticos individuales
const STATIC_FONT_FILES = {
  'Inter-Regular.ttf': 'Inter-Regular.ttf',
  'Inter-Italic.ttf': 'Inter-Italic.ttf',
  'Inter-Medium.ttf': 'Inter-Medium.ttf',
  'Inter-Bold.ttf': 'Inter-Bold.ttf',
  'Inter-BoldItalic.ttf': 'Inter-BoldItalic.ttf',
};

function fileToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

function buildVfs() {
  console.log('🔧 Generando vfs_fonts.ts con fuente Inter...\n');

  const vfs = {};
  const includedFonts = [];

  // Primero intentar Variable Fonts
  let usingVariableFonts = false;
  
  for (const [fileName, vfsName] of Object.entries(FONT_FILES)) {
    const filePath = path.join(FONTS_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`✅ Variable Font: ${fileName}`);
      vfs[vfsName] = fileToBase64(filePath);
      includedFonts.push(fileName);
      usingVariableFonts = true;
    }
  }

  // Si no hay Variable Fonts, intentar estáticos
  if (!usingVariableFonts) {
    console.log('⚠️  Variable Fonts no encontradas, buscando estáticas...\n');
    
    for (const [fileName, vfsName] of Object.entries(STATIC_FONT_FILES)) {
      const filePath = path.join(FONTS_DIR, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`✅ Static Font: ${fileName}`);
        vfs[vfsName] = fileToBase64(filePath);
        includedFonts.push(fileName);
      }
    }
  }

  // Verificar mínimo requerido
  const hasRegular = vfs['Inter-Regular.ttf'];
  
  if (!hasRegular) {
    console.error('\n❌ Error: No se encontró Inter-Regular (o Variable Font)');
    console.log(`\n📥 Descarga Inter desde: https://fonts.google.com/specimen/Inter`);
    console.log(`📁 Coloca los archivos en: ${FONTS_DIR}`);
    console.log(`\n   Archivos esperados:`);
    console.log(`   - Inter-VariableFont_opsz,wght.ttf (Variable Font)`);
    console.log(`   - Inter-Italic-VariableFont_opsz,wght.ttf (Variable Font Italic)`);
    process.exit(1);
  }

  // Para Variable Fonts, usar el mismo archivo para bold
  // (pdfmake simulará bold con faux-bold si es necesario)
  if (usingVariableFonts && !vfs['Inter-Bold.ttf']) {
    // Usar la misma variable font para bold
    vfs['Inter-Bold.ttf'] = vfs['Inter-Regular.ttf'];
    console.log('ℹ️  Usando Variable Font para bold (weight 700 embebido)');
  }
  
  if (usingVariableFonts && vfs['Inter-Italic.ttf'] && !vfs['Inter-BoldItalic.ttf']) {
    vfs['Inter-BoldItalic.ttf'] = vfs['Inter-Italic.ttf'];
    console.log('ℹ️  Usando Variable Font Italic para bolditalics');
  }

  // Crear directorio si no existe
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generar archivo TypeScript
  const tsContent = `/**
 * vfs_fonts.ts - Virtual File System para pdfmake con fuente Inter
 * 
 * ⚠️ ARCHIVO AUTO-GENERADO - NO EDITAR MANUALMENTE
 * Generado por: scripts/build-vfs.js
 * Fecha: ${new Date().toISOString()}
 * 
 * Fuente: Inter (Google Fonts)
 * Características:
 * - Números tabulares para alineación en tablas
 * - Soporte UTF-8 completo (tildes, ñ, €, °, µ)
 * - Legibilidad técnica optimizada
 */

export const vfs: Record<string, string> = ${JSON.stringify(vfs, null, 2)};

export default vfs;
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');

  console.log(`\n✅ Generado: ${OUTPUT_FILE}`);
  console.log(`📦 Fuentes en VFS: ${Object.keys(vfs).length}`);
  console.log(`   ${Object.keys(vfs).join(', ')}`);

  console.log('\n🎉 VFS generado correctamente. UTF-8 listo para producción.');
}

buildVfs();
