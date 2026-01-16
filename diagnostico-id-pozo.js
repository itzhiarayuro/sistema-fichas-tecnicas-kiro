/**
 * Diagnóstico específico para el problema del ID de pozo "M"
 * Este script ayuda a identificar por qué aparece "M" en lugar de "PZ"
 */

const fs = require('fs');
const path = require('path');

// Simular el mapeo de columnas del parser
const COLUMN_MAPPING = {
  'codigo': 'idPozo',
  'código': 'idPozo',
  'cod': 'idPozo',
  'id': 'idPozo',
  'pozo': 'idPozo',
  'id_pozo': 'idPozo',
  'id pozo': 'idPozo',
  'numero': 'idPozo',
  'número': 'idPozo',
  'num': 'idPozo',
  'nro': 'idPozo',
  'n°': 'idPozo',
  'no.': 'idPozo',
  'idpozo': 'idPozo',
  'nombre': 'idPozo',
  'id_pozo': 'idPozo',
};

function normalizeColumnName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function diagnosticarIdPozo() {
  console.log('🔍 DIAGNÓSTICO: ID de Pozo aparece como "M" en lugar de "PZ"\n');

  // Simular datos de ejemplo que podrían causar el problema
  const ejemplosProblematicos = [
    // Caso 1: Columna "M" siendo interpretada como ID
    { 'M': 'M', 'Codigo': 'PZ1666', 'Direccion': 'Calle 123' },
    
    // Caso 2: Columna vacía o mal nombrada
    { '': 'M', 'ID_POZO': 'PZ1666', 'Direccion': 'Calle 123' },
    
    // Caso 3: Orden de columnas problemático
    { 'A': 'M', 'B': 'PZ1666', 'C': 'Calle 123' },
    
    // Caso 4: Columna con nombre extraño
    { 'Col1': 'M', 'Id_pozo': 'PZ1666', 'Ubicacion': 'Calle 123' },
    
    // Caso 5: Múltiples columnas que podrían ser ID
    { 'codigo': 'M', 'id': 'PZ1666', 'numero': 'ABC123' },
  ];

  ejemplosProblematicos.forEach((ejemplo, index) => {
    console.log(`\n📋 EJEMPLO ${index + 1}:`);
    console.log('Datos de entrada:', JSON.stringify(ejemplo, null, 2));
    
    // Simular el proceso de detección de columnas
    const columnasDisponibles = Object.keys(ejemplo);
    console.log('Columnas disponibles:', columnasDisponibles);
    
    // Simular el mapeo
    const columnMapping = {};
    const mappedFields = new Set();
    
    columnasDisponibles.forEach((col) => {
      const normalized = normalizeColumnName(col);
      const mapped = COLUMN_MAPPING[normalized];
      
      console.log(`  "${col}" -> normalizado: "${normalized}" -> mapeado: "${mapped || 'NO MAPEADO'}"`);
      
      if (mapped && !mappedFields.has(mapped)) {
        columnMapping[col] = mapped;
        mappedFields.add(mapped);
        console.log(`    ✅ MAPEADO: "${col}" -> "${mapped}"`);
      } else if (mapped) {
        console.log(`    ⚠️ YA MAPEADO: "${mapped}" ya está asignado`);
      }
    });
    
    // Simular getValue para idPozo
    console.log('\n🎯 Proceso de obtención del ID del pozo:');
    let idPozoEncontrado = '';
    
    // Buscar en el mapeo
    for (const [col, mapped] of Object.entries(columnMapping)) {
      if (mapped === 'idPozo') {
        const valor = ejemplo[col];
        console.log(`  Buscando en columna mapeada "${col}": "${valor}"`);
        if (valor && valor.trim() !== '') {
          idPozoEncontrado = valor;
          console.log(`    ✅ ENCONTRADO: "${idPozoEncontrado}"`);
          break;
        }
      }
    }
    
    // Si no se encontró en el mapeo, buscar directamente
    if (!idPozoEncontrado) {
      console.log('  No encontrado en mapeo, buscando directamente...');
      const variaciones = ['Id_pozo', 'ID_POZO', 'Codigo', 'Código', 'codigo', 'CODIGO', 'Id', 'ID', 'Pozo', 'POZO'];
      
      for (const variacion of variaciones) {
        if (ejemplo[variacion] !== undefined) {
          const valor = ejemplo[variacion];
          console.log(`    Probando "${variacion}": "${valor}"`);
          if (valor && valor.trim() !== '') {
            idPozoEncontrado = valor;
            console.log(`    ✅ ENCONTRADO DIRECTAMENTE: "${idPozoEncontrado}"`);
            break;
          }
        }
      }
    }
    
    // Si aún no se encontró, tomar la primera columna con valor
    if (!idPozoEncontrado) {
      console.log('  No encontrado con variaciones, tomando primera columna con valor...');
      for (const [col, valor] of Object.entries(ejemplo)) {
        if (valor && valor.trim() !== '') {
          idPozoEncontrado = valor;
          console.log(`    ⚠️ FALLBACK: Usando "${col}" = "${idPozoEncontrado}"`);
          break;
        }
      }
    }
    
    console.log(`\n🏁 RESULTADO FINAL: ID del pozo = "${idPozoEncontrado}"`);
    
    if (idPozoEncontrado === 'M') {
      console.log('❌ PROBLEMA DETECTADO: El ID es "M"');
      console.log('💡 POSIBLES CAUSAS:');
      console.log('   - Columna "M" está siendo interpretada como ID del pozo');
      console.log('   - El mapeo de columnas está tomando la columna incorrecta');
      console.log('   - Los datos están en un formato inesperado');
    } else if (idPozoEncontrado.startsWith('PZ')) {
      console.log('✅ CORRECTO: El ID tiene el formato esperado');
    } else {
      console.log('⚠️ FORMATO INESPERADO: El ID no sigue el patrón PZ');
    }
    
    console.log('\n' + '='.repeat(80));
  });

  console.log('\n🔧 RECOMENDACIONES PARA SOLUCIONAR EL PROBLEMA:');
  console.log('1. Verificar que el archivo Excel tenga una columna clara para el ID del pozo');
  console.log('2. Asegurarse de que la columna del ID tenga un nombre reconocible (Codigo, ID_POZO, etc.)');
  console.log('3. Revisar que no haya columnas con nombres ambiguos como "M", "A", "B", etc.');
  console.log('4. Verificar el orden de las columnas en el Excel');
  console.log('5. Considerar agregar validación adicional en el parser');

  console.log('\n📝 MEJORAS SUGERIDAS PARA EL PARSER:');
  console.log('- Agregar logging detallado del proceso de mapeo de columnas');
  console.log('- Validar que el ID del pozo tenga un formato esperado (ej: PZ seguido de números)');
  console.log('- Rechazar IDs que sean solo una letra');
  console.log('- Mostrar advertencias cuando se detecten columnas ambiguas');
}

// Ejecutar el diagnóstico
diagnosticarIdPozo();