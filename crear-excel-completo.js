const fs = require('fs');
const path = require('path');

// Instalar xlsx si no está disponible
try {
  require('xlsx');
} catch (e) {
  console.log('Instalando xlsx...');
  require('child_process').execSync('npm install xlsx', { stdio: 'inherit' });
}

const XLSX = require('xlsx');

// Crear directorio de pruebas si no existe
const testDir = path.join(__dirname, 'archivos-prueba');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// ============================================
// LOS 33 CAMPOS EXACTOS DEL SISTEMA
// ============================================
const CAMPOS_33 = [
  // IDENTIFICACIÓN (6 campos)
  'ID_POZO',
  'Coordenada X',
  'Coordenada Y',
  'Fecha',
  'Levantó',
  'Estado',
  
  // UBICACIÓN (4 campos)
  'Dirección',
  'Barrio',
  'Elevación',
  'Profundidad',
  
  // COMPONENTES (23 campos)
  'Existe tapa',
  'Estado tapa',
  'Existe cilindro',
  'Diametro Cilindro (m)',
  'Sistema',
  'Año de instalación',
  'Tipo Cámara',
  'Estructura de pavimento',
  'Material tapa',
  'Existe cono',
  'Tipo Cono',
  'Materia Cono',
  'Estado Cono',
  'Material Cilindro',
  'Estado Cilindro',
  'Existe Cañuela',
  'Material Cañuela',
  'Estado Cañuela',
  'Existe Peldaños',
  'Material Peldaños',
  'Número Peldaños',
  'Estado Peldaños',
  
  // OBSERVACIONES (1 campo)
  'Observaciones'
];

console.log(`\n📋 Creando Excel con ${CAMPOS_33.length} campos exactos del sistema...\n`);

// ============================================
// DATOS COMPLETOS PARA 5 POZOS
// ============================================

const datos = [
  CAMPOS_33, // Encabezados
  
  // PZ1666 - Completo y en buen estado
  [
    'PZ1666',                           // ID_POZO
    '1024567.45',                       // Coordenada X
    '987654.32',                        // Coordenada Y
    '2024-01-10',                       // Fecha
    'Michelle García',                  // Levantó
    'Bueno',                            // Estado
    'Cl 7 # 10-44',                     // Dirección
    'Centro',                           // Barrio
    '1250.5',                           // Elevación
    '2.5',                              // Profundidad
    'Si',                               // Existe tapa
    'Bueno',                            // Estado tapa
    'Si',                               // Existe cilindro
    '1.20',                             // Diametro Cilindro (m)
    'Combinado',                        // Sistema
    '2015',                             // Año de instalación
    'Circular',                         // Tipo Cámara
    'Típica de fondo',                  // Estructura de pavimento
    'Ferroconcreto',                    // Material tapa
    'Si',                               // Existe cono
    'Concéntrico',                      // Tipo Cono
    'Mampostería',                      // Materia Cono
    'Bueno',                            // Estado Cono
    'Concreto',                         // Material Cilindro
    'Bueno',                            // Estado Cilindro
    'Si',                               // Existe Cañuela
    'Concreto',                         // Material Cañuela
    'Bueno',                            // Estado Cañuela
    'Si',                               // Existe Peldaños
    'Hierro',                           // Material Peldaños
    '6',                                // Número Peldaños
    'Bueno',                            // Estado Peldaños
    'Pozo en excelente estado, mantenimiento realizado en 2023'  // Observaciones
  ],
  
  // PZ1667 - Con problemas menores
  [
    'PZ1667',
    '1024580.12',
    '987670.45',
    '2024-01-09',
    'Juan Pérez',
    'Regular',
    'Av. Caracas # 45-67',
    'Norte',
    '1248.3',
    '3.2',
    'Si',
    'Regular',
    'Si',
    '1.10',
    'Combinado',
    '2012',
    'Rectangular',
    'Pav. Rígido',
    'Ferroconcreto',
    'Si',
    'Concéntrico',
    'Mampostería',
    'Regular',
    'Concreto',
    'Regular',
    'Si',
    'PVC',
    'Regular',
    'Si',
    'Hierro',
    '5',
    'Regular',
    'Requiere limpieza y mantenimiento preventivo'
  ],
  
  // PZ1668 - Deteriorado
  [
    'PZ1668',
    '1024545.78',
    '987620.89',
    '2024-01-08',
    'Carlos López',
    'Malo',
    'Cra 15 # 32-10',
    'Sur',
    '1252.1',
    '2.8',
    'Si',
    'Malo',
    'Si',
    '1.15',
    'Combinado',
    '2008',
    'Cuadrada',
    'Típica de fondo',
    'Ferroconcreto',
    'No',
    '',
    '',
    '',
    'Concreto',
    'Malo',
    'No',
    '',
    '',
    'No',
    '',
    '',
    '',
    'Requiere reparación urgente. Cono deteriorado, cilindro con grietas'
  ],
  
  // PZ1669 - Sin coordenadas (demuestra flexibilidad)
  [
    'PZ1669',
    '',                                 // Sin Coordenada X
    '',                                 // Sin Coordenada Y
    '2024-01-07',
    'Ana Martínez',
    'Bueno',
    'Calle 50 # 8-25',
    'Occidente',
    '1246.8',
    '2.2',
    'Si',
    'Bueno',
    'Si',
    '1.25',
    'Combinado',
    '2018',
    'Circular',
    'Típica de fondo',
    'Ferroconcreto',
    'Si',
    'Concéntrico',
    'Mampostería',
    'Bueno',
    'Concreto',
    'Bueno',
    'Si',
    'Concreto',
    'Bueno',
    'Si',
    'Hierro',
    '7',
    'Bueno',
    'Pozo funcional sin coordenadas GPS'
  ],
  
  // PZ1670 - Datos parciales
  [
    'PZ1670',
    '1024600.34',
    '987700.12',
    '2024-01-06',
    'Roberto Silva',
    'Regular',
    'Cra 8 # 15-30',
    'Este',
    '1251.2',
    '2.9',
    'Si',
    'Regular',
    'Si',
    '1.18',
    'Combinado',
    '2010',
    'Rectangular',
    'Pav. Rígido',
    'Ferroconcreto',
    'Si',
    'Concéntrico',
    'Mampostería',
    'Regular',
    'Concreto',
    'Regular',
    'No',
    '',
    '',
    'Si',
    'Hierro',
    '5',
    'Regular',
    'Sin cañuela. Peldaños en regular estado'
  ]
];

// ============================================
// CREAR ARCHIVO EXCEL
// ============================================

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(datos);

// Ajustar ancho de columnas
ws['!cols'] = CAMPOS_33.map(() => ({ wch: 20 }));

// Congelar la primera fila (encabezados)
ws['!freeze'] = { xSplit: 0, ySplit: 1 };

XLSX.utils.book_append_sheet(wb, ws, 'Pozos');

const excelPath = path.join(testDir, 'ejemplo_completo_33campos.xlsx');
XLSX.writeFile(wb, excelPath);

console.log('✅ EXCEL CREADO EXITOSAMENTE');
console.log(`\n📊 Archivo: ejemplo_completo_33campos.xlsx`);
console.log(`📋 Campos: ${CAMPOS_33.length} (todos los del sistema)`);
console.log(`📍 Pozos: 5 (PZ1666, PZ1667, PZ1668, PZ1669, PZ1670)`);
console.log(`📁 Ubicación: archivos-prueba/`);

console.log('\n📋 Campos incluidos:');
console.log('\n  IDENTIFICACIÓN (6):');
CAMPOS_33.slice(0, 6).forEach((c, i) => console.log(`    ${i+1}. ${c}`));

console.log('\n  UBICACIÓN (4):');
CAMPOS_33.slice(6, 10).forEach((c, i) => console.log(`    ${i+7}. ${c}`));

console.log('\n  COMPONENTES (23):');
CAMPOS_33.slice(10, 33).forEach((c, i) => console.log(`    ${i+11}. ${c}`));

console.log('\n  OBSERVACIONES (1):');
console.log(`    33. ${CAMPOS_33[32]}`);

console.log('\n✨ El Excel está listo para descargar desde /upload');
console.log('\n🎯 Próximo paso:');
console.log('  1. Copia el archivo a sistema-fichas-tecnicas/public/ejemplos/');
console.log('  2. Carga el Excel en http://localhost:3003/upload');
console.log('  3. Verifica que todos los 33 campos se cargan correctamente');
