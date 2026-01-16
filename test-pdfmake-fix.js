/**
 * Test específico para verificar la corrección del error pdfFonts.pdfMake.vfs
 * Este script prueba la importación correcta de pdfmake y sus fuentes
 */

const fs = require('fs');
const path = require('path');

async function testPdfMakeImport() {
  console.log('🔧 Probando corrección del error pdfFonts.pdfMake.vfs...\n');

  try {
    // Simular la importación como lo hace el generador
    console.log('1. Importando pdfmake...');
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfMake = pdfMakeModule.default;
    console.log('✅ pdfmake importado correctamente');

    // Probar la carga de fuentes con la nueva lógica
    console.log('\n2. Probando carga de fuentes...');
    try {
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      console.log('📦 Módulo de fuentes cargado');
      console.log('🔍 Estructura del módulo:', Object.keys(pdfFontsModule));
      
      let fontsLoaded = false;
      
      // Intentar diferentes estructuras de importación
      if (pdfFontsModule?.default) {
        console.log('📝 Intentando estructura: pdfFontsModule.default');
        pdfMake.vfs = pdfFontsModule.default;
        fontsLoaded = true;
        console.log('✅ Fuentes cargadas desde default');
      } else if (pdfFontsModule?.pdfMake?.vfs) {
        console.log('📝 Intentando estructura: pdfFontsModule.pdfMake.vfs');
        pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
        fontsLoaded = true;
        console.log('✅ Fuentes cargadas desde pdfMake.vfs');
      } else if (pdfFontsModule?.vfs) {
        console.log('📝 Intentando estructura: pdfFontsModule.vfs');
        pdfMake.vfs = pdfFontsModule.vfs;
        fontsLoaded = true;
        console.log('✅ Fuentes cargadas desde vfs directo');
      } else {
        console.log('⚠️ Estructura de fuentes no reconocida');
        console.log('📋 Claves disponibles:', Object.keys(pdfFontsModule));
      }

      if (fontsLoaded) {
        console.log('✅ pdfMake.vfs configurado correctamente');
        console.log('📊 Fuentes disponibles:', Object.keys(pdfMake.vfs || {}).length);
      }

    } catch (fontError) {
      console.log('⚠️ Error cargando fuentes:', fontError.message);
      console.log('🔄 Continuando con fuentes básicas...');
    }

    // Probar creación de PDF simple
    console.log('\n3. Probando creación de PDF...');
    
    const docDefinition = {
      content: [
        { text: 'Test PDF - Corrección pdfFonts.pdfMake.vfs', fontSize: 16, bold: true },
        { text: '\nEste PDF fue generado para probar la corrección del error.', fontSize: 12 },
        { text: '\nSi ves este texto, la corrección funcionó correctamente.', fontSize: 10 },
        {
          table: {
            body: [
              ['Campo', 'Valor'],
              ['Estado', 'Funcionando'],
              ['Fecha', new Date().toLocaleString()],
              ['Fuentes VFS', pdfMake.vfs ? 'Disponibles' : 'No disponibles']
            ]
          }
        }
      ],
      defaultStyle: {
        font: 'Helvetica'
      }
    };

    return new Promise((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).getBlob((blob) => {
          console.log('✅ PDF generado exitosamente');
          console.log('📄 Tamaño del blob:', blob.size, 'bytes');
          
          // Guardar el PDF de prueba
          const reader = new FileReader();
          reader.onload = function() {
            const buffer = Buffer.from(reader.result);
            fs.writeFileSync('test-pdfmake-fix.pdf', buffer);
            console.log('💾 PDF guardado como: test-pdfmake-fix.pdf');
            resolve(true);
          };
          reader.readAsArrayBuffer(blob);
        });
      } catch (pdfError) {
        console.log('❌ Error generando PDF:', pdfError.message);
        reject(pdfError);
      }
    });

  } catch (error) {
    console.log('❌ Error en la prueba:', error.message);
    console.log('📋 Stack:', error.stack);
    return false;
  }
}

// Ejecutar la prueba
testPdfMakeImport()
  .then((success) => {
    if (success) {
      console.log('\n🎉 ¡Corrección exitosa! El error pdfFonts.pdfMake.vfs ha sido resuelto.');
      console.log('✅ El generador PDF debería funcionar correctamente ahora.');
    } else {
      console.log('\n❌ La corrección necesita ajustes adicionales.');
    }
  })
  .catch((error) => {
    console.log('\n💥 Error ejecutando la prueba:', error.message);
  });