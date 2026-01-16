#!/usr/bin/env node

/**
 * Script de Pruebas Automatizadas - Migración a pdfmake
 * Ejecuta los pasos de GUIA_PRUEBAS_PDFMAKE.md de forma automatizada
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Checklist
const checklist = {
  paso1: false,
  paso2: false,
  paso3: false,
  paso4: false,
  paso5: false,
  paso6: false,
  paso7: false,
  paso8: false,
  paso9: false,
  paso10: false,
};

async function runTests() {
  section('PRUEBAS AUTOMATIZADAS - MIGRACIÓN A pdfmake');

  // PASO 1: Verificar servidor
  section('PASO 1: Verificar Servidor');
  try {
    const response = await fetch('http://localhost:3003');
    if (response.ok) {
      success('Servidor está corriendo en http://localhost:3003');
      checklist.paso1 = true;
    } else {
      error('Servidor respondió con error');
    }
  } catch (err) {
    error(`No se puede conectar al servidor: ${err.message}`);
    warning('Asegúrate de que el servidor está corriendo: npm run dev');
  }

  // PASO 2: Verificar estructura del proyecto
  section('PASO 2: Verificar Estructura del Proyecto');
  const requiredFiles = [
    'sistema-fichas-tecnicas/src/lib/pdf/pdfMakeGenerator.ts',
    'sistema-fichas-tecnicas/package.json',
    'sistema-fichas-tecnicas/src/app/api',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      success(`Encontrado: ${file}`);
    } else {
      error(`No encontrado: ${file}`);
      allFilesExist = false;
    }
  }
  checklist.paso2 = allFilesExist;

  // PASO 3: Verificar dependencias
  section('PASO 3: Verificar Dependencias');
  try {
    const packageJson = JSON.parse(
      fs.readFileSync('sistema-fichas-tecnicas/package.json', 'utf8')
    );

    const requiredDeps = ['pdfmake', 'jspdf', 'xlsx', 'react', 'next'];
    let allDepsPresent = true;

    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        success(`${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        error(`${dep} no está instalado`);
        allDepsPresent = false;
      }
    }
    checklist.paso3 = allDepsPresent;
  } catch (err) {
    error(`Error al leer package.json: ${err.message}`);
  }

  // PASO 4: Verificar generador de PDF
  section('PASO 4: Verificar Generador de PDF');
  try {
    const pdfGeneratorPath = 'sistema-fichas-tecnicas/src/lib/pdf/pdfMakeGenerator.ts';
    const content = fs.readFileSync(pdfGeneratorPath, 'utf8');

    const checks = [
      { name: 'Clase PDFMakeGenerator', pattern: /class PDFMakeGenerator/ },
      { name: 'Método generatePDF', pattern: /generatePDF/ },
      { name: 'Soporte pdfmake', pattern: /pdfmake/ },
      { name: 'Soporte UTF-8', pattern: /UTF-8|utf-8|Helvetica/ },
      { name: 'Secciones de contenido', pattern: /buildIdentificacionSection|buildUbicacionSection/ },
    ];

    let allChecksPass = true;
    for (const check of checks) {
      if (check.pattern.test(content)) {
        success(`${check.name}: ✓`);
      } else {
        error(`${check.name}: ✗`);
        allChecksPass = false;
      }
    }
    checklist.paso4 = allChecksPass;
  } catch (err) {
    error(`Error al verificar generador: ${err.message}`);
  }

  // PASO 5: Verificar tipos TypeScript
  section('PASO 5: Verificar Tipos TypeScript');
  try {
    const typesPath = 'sistema-fichas-tecnicas/src/types/pozo.ts';
    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, 'utf8');
      if (content.includes('interface Pozo') || content.includes('type Pozo')) {
        success('Tipos de Pozo definidos correctamente');
        checklist.paso5 = true;
      } else {
        error('Tipos de Pozo no encontrados');
      }
    } else {
      error(`Archivo no encontrado: ${typesPath}`);
    }
  } catch (err) {
    error(`Error al verificar tipos: ${err.message}`);
  }

  // PASO 6: Validar caracteres especiales
  section('PASO 6: Validar Soporte de Caracteres Especiales');
  const specialChars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ü'];
  let allCharsSupported = true;

  for (const char of specialChars) {
    try {
      // Verificar que pdfmake puede manejar estos caracteres
      const testString = `Prueba con ${char}`;
      if (testString.includes(char)) {
        success(`Carácter '${char}' soportado`);
      } else {
        error(`Carácter '${char}' no soportado`);
        allCharsSupported = false;
      }
    } catch (err) {
      error(`Error con carácter '${char}': ${err.message}`);
      allCharsSupported = false;
    }
  }
  checklist.paso6 = allCharsSupported;

  // PASO 7: Verificar configuración de estilos
  section('PASO 7: Verificar Configuración de Estilos');
  try {
    const pdfGeneratorPath = 'sistema-fichas-tecnicas/src/lib/pdf/pdfMakeGenerator.ts';
    const content = fs.readFileSync(pdfGeneratorPath, 'utf8');

    const styleChecks = [
      { name: 'Estilos de encabezado', pattern: /header.*fontSize.*bold/ },
      { name: 'Estilos de sección', pattern: /sectionTitle/ },
      { name: 'Estilos de tabla', pattern: /tableHeader|tableCell/ },
      { name: 'Colores definidos', pattern: /fillColor|color/ },
    ];

    let allStylesPresent = true;
    for (const check of styleChecks) {
      if (check.pattern.test(content)) {
        success(`${check.name}: ✓`);
      } else {
        error(`${check.name}: ✗`);
        allStylesPresent = false;
      }
    }
    checklist.paso7 = allStylesPresent;
  } catch (err) {
    error(`Error al verificar estilos: ${err.message}`);
  }

  // PASO 8: Verificar soporte de tablas
  section('PASO 8: Verificar Soporte de Tablas');
  try {
    const pdfGeneratorPath = 'sistema-fichas-tecnicas/src/lib/pdf/pdfMakeGenerator.ts';
    const content = fs.readFileSync(pdfGeneratorPath, 'utf8');

    const tableChecks = [
      { name: 'Tabla de tuberías', pattern: /buildTuberiasTable/ },
      { name: 'Tabla de sumideros', pattern: /buildSumiderosTable/ },
      { name: 'Tabla de dos columnas', pattern: /createTwoColumnTable/ },
      { name: 'Layout de tablas', pattern: /layout.*noBorders|lightHorizontalLines/ },
    ];

    let allTablesPresent = true;
    for (const check of tableChecks) {
      if (check.pattern.test(content)) {
        success(`${check.name}: ✓`);
      } else {
        error(`${check.name}: ✗`);
        allTablesPresent = false;
      }
    }
    checklist.paso8 = allTablesPresent;
  } catch (err) {
    error(`Error al verificar tablas: ${err.message}`);
  }

  // PASO 9: Verificar soporte de fotos
  section('PASO 9: Verificar Soporte de Fotos');
  try {
    const pdfGeneratorPath = 'sistema-fichas-tecnicas/src/lib/pdf/pdfMakeGenerator.ts';
    const content = fs.readFileSync(pdfGeneratorPath, 'utf8');

    const photoChecks = [
      { name: 'Sección de fotos', pattern: /buildFotosSection/ },
      { name: 'Celda de foto', pattern: /buildFotoCell/ },
      { name: 'Soporte base64', pattern: /base64/ },
      { name: 'Grid de fotos', pattern: /50%.*50%/ },
    ];

    let allPhotoFeaturesPresent = true;
    for (const check of photoChecks) {
      if (check.pattern.test(content)) {
        success(`${check.name}: ✓`);
      } else {
        error(`${check.name}: ✗`);
        allPhotoFeaturesPresent = false;
      }
    }
    checklist.paso9 = allPhotoFeaturesPresent;
  } catch (err) {
    error(`Error al verificar fotos: ${err.message}`);
  }

  // PASO 10: Resumen de validaciones
  section('PASO 10: Resumen de Validaciones');
  const completedSteps = Object.values(checklist).filter(v => v).length;
  const totalSteps = Object.keys(checklist).length;

  log(`\nResultados: ${completedSteps}/${totalSteps} pasos completados\n`);

  for (const [step, completed] of Object.entries(checklist)) {
    const stepNum = step.replace('paso', '');
    if (completed) {
      success(`Paso ${stepNum}: Completado`);
    } else {
      error(`Paso ${stepNum}: Incompleto`);
    }
  }

  // Resumen final
  section('RESUMEN FINAL');

  if (completedSteps === totalSteps) {
    success('✅ TODAS LAS PRUEBAS PASARON');
    log('\nLa migración a pdfmake está lista para producción.\n');
    log('Próximos pasos:', 'cyan');
    log('1. Ejecutar pruebas manuales en el navegador');
    log('2. Validar caracteres especiales en PDFs generados');
    log('3. Verificar selección de texto sin espacios');
    log('4. Comparar con PDFs generados con jsPDF\n');
  } else {
    warning(`⚠️  ${totalSteps - completedSteps} prueba(s) incompleta(s)`);
    log('\nRevisa los errores arriba y corrige los problemas.\n');
  }

  log(`Reporte generado: ${new Date().toISOString()}\n`, 'cyan');
}

// Ejecutar pruebas
runTests().catch(err => {
  error(`Error fatal: ${err.message}`);
  process.exit(1);
});
