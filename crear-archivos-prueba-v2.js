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

// Crear directorios
const testDir = path.join(__dirname, 'archivos-prueba');
const fotosDir = path.join(testDir, 'fotos');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
if (!fs.existsSync(fotosDir)) {
  fs.mkdirSync(fotosDir, { recursive: true });
}

// ============================================
// DEFINICIÓN DE LOS 33 CAMPOS DEL SISTEMA
// ============================================
const CAMPOS = [
  'Dirección',
  'Barrio',
  'Fecha',
  'Levantó',
  'Estado',
  'Sistema',
  'Coordenada X',
  'Coordenada Y',
  'Elevación',
  'Profundidad',
  'Año de instalación',
  'Tipo Cámara',
  'Estructura de pavimento',
  'Existe tapa',
  'Material tapa',
  'Estado tapa',
  'Existe cono',
  'Tipo Cono',
  'Materia Cono',
  'Estado Cono',
  'Existe Cilindro',
  'Diametro Cilindro (m)',
  'Material Cilindro',
  'Estado Cilindro',
  'Existe Cañuela',
  'Material Cañuela',
  'Estado Cañuela',
  'Existe Peldaños',
  'Material Peldaños',
  'Número Peldaños',
  'Estado Peldaños',
  'Observaciones',
  'ID_POZO' // Campo adicional para identificación
];

// ============================================
// DATOS DE EJEMPLO REALISTAS
// ============================================

// Pozo 1: Completo y en buen estado
const pozo1 = [
  'Cl 7 # 10-44',           // Dirección
  'Centro',                 // Barrio
  '2024-01-10',             // Fecha
  'Michelle García',        // Levantó
  'Bueno',                  // Estado
  'Combinado',              // Sistema
  '1024567.45',             // Coordenada X
  '987654.32',              // Coordenada Y
  '1250.5',                 // Elevación
  '2.5',                    // Profundidad
  '2015',                   // Año de instalación
  'Combinado',              // Tipo Cámara
  'Típica de fondo',        // Estructura de pavimento
  'Si',                     // Existe tapa
  'Ferroconcreto',          // Material tapa
  'Bueno',                  // Estado tapa
  'Si',                     // Existe cono
  'Concéntrico',            // Tipo Cono
  'Mampostería',            // Materia Cono
  'Bueno',                  // Estado Cono
  'Si',                     // Existe Cilindro
  '1.20',                   // Diametro Cilindro (m)
  'Concreto',               // Material Cilindro
  'Bueno',                  // Estado Cilindro
  'Si',                     // Existe Cañuela
  'Concreto',               // Material Cañuela
  'Bueno',                  // Estado Cañuela
  'Si',                     // Existe Peldaños
  'Hierro',                 // Material Peldaños
  '6',                      // Número Peldaños
  'Bueno',                  // Estado Peldaños
  'Pozo en excelente estado, mantenimiento realizado en 2023',  // Observaciones
  'PZ1666'                  // ID_POZO
];

// Pozo 2: Con problemas menores
const pozo2 = [
  'Av. Caracas # 45-67',
  'Norte',
  '2024-01-09',
  'Juan Pérez',
  'Regular',
  'Combinado',
  '1024580.12',
  '987670.45',
  '1248.3',
  '3.2',
  '2012',
  'Combinado',
  'Pav. Rígido',
  'Si',
  'Ferroconcreto',
  'Regular',
  'Si',
  'Concéntrico',
  'Mampostería',
  'Regular',
  'Si',
  '1.10',
  'Concreto',
  'Regular',
  'Si',
  'PVC',
  'Regular',
  'Si',
  'Hierro',
  '5',
  'Regular',
  'Requiere limpieza y mantenimiento preventivo',
  'PZ1667'
];

// Pozo 3: Deteriorado
const pozo3 = [
  'Cra 15 # 32-10',
  'Sur',
  '2024-01-08',
  'Carlos López',
  'Malo',
  'Combinado',
  '1024545.78',
  '987620.89',
  '1252.1',
  '2.8',
  '2008',
  'Combinado',
  'Típica de fondo',
  'Si',
  'Ferroconcreto',
  'Malo',
  'No',
  '',
  '',
  '',
  'Si',
  '1.15',
  'Concreto',
  'Malo',
  'No',
  '',
  '',
  'No',
  '',
  '',
  '',
  'Requiere reparación urgente. Cono deteriorado, cilindro con grietas',
  'PZ1668'
];

// Pozo 4: Sin coordenadas (demuestra flexibilidad)
const pozo4 = [
  'Calle 50 # 8-25',
  'Occidente',
  '2024-01-07',
  'Ana Martínez',
  'Bueno',
  'Combinado',
  '',                       // Sin Coordenada X
  '',                       // Sin Coordenada Y
  '1246.8',
  '2.2',
  '2018',
  'Combinado',
  'Típica de fondo',
  'Si',
  'Ferroconcreto',
  'Bueno',
  'Si',
  'Concéntrico',
  'Mampostería',
  'Bueno',
  'Si',
  '1.25',
  'Concreto',
  'Bueno',
  'Si',
  'Concreto',
  'Bueno',
  'Si',
  'Hierro',
  '7',
  'Bueno',
  'Pozo funcional sin coordenadas GPS',
  'PZ1669'
];

// Pozo 5: Datos parciales
const pozo5 = [
  'Cra 8 # 15-30',
  'Este',
  '2024-01-06',
  'Roberto Silva',
  'Regular',
  'Combinado',
  '1024600.34',
  '987700.12',
  '1251.2',
  '2.9',
  '2010',
  'Combinado',
  'Pav. Rígido',
  'Si',
  'Ferroconcreto',
  'Regular',
  'Si',
  'Concéntrico',
  'Mampostería',
  'Regular',
  'Si',
  '1.18',
  'Concreto',
  'Regular',
  'No',
  '',
  '',
  'Si',
  'Hierro',
  '5',
  'Regular',
  'Sin cañuela. Peldaños en regular estado',
  'PZ1670'
];

// ============================================
// CREAR ARCHIVO EXCEL CON LOS 33 CAMPOS
// ============================================

const datos = [
  CAMPOS,  // Encabezados
  pozo1,
  pozo2,
  pozo3,
  pozo4,
  pozo5
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(datos);

// Ajustar ancho de columnas
ws['!cols'] = CAMPOS.map(() => ({ wch: 18 }));

XLSX.utils.book_append_sheet(wb, ws, 'Pozos');
const excelPath = path.join(testDir, 'ejemplo_completo_33campos.xlsx');
XLSX.writeFile(wb, excelPath);
console.log('✓ Creado: ejemplo_completo_33campos.xlsx');

// ============================================
// CREAR IMÁGENES PLACEHOLDER
// ============================================

// Función para crear imagen PNG simple
function crearImagenPlaceholder(nombre, ancho = 400, alto = 300) {
  // PNG mínimo válido (1x1 pixel blanco)
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, etc
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF,
    0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // data
    0x49, 0xB4, 0xE8, 0xB7, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(path.join(fotosDir, nombre), buffer);
}

// Crear imágenes para cada pozo
// Nomenclatura: {CODIGO}-{TIPO}.jpg
const fotos = [
  // PZ1666 - 4 fotos
  'PZ1666-P.jpg',      // Principal
  'PZ1666-T.jpg',      // Tapa
  'PZ1666-I.jpg',      // Interior
  'PZ1666-A.jpg',      // Acceso
  
  // PZ1667 - 4 fotos
  'PZ1667-P.jpg',
  'PZ1667-T.jpg',
  'PZ1667-E1-T.jpg',   // Entrada 1 - Tubería
  'PZ1667-E1-Z.jpg',   // Entrada 1 - Zona
  
  // PZ1668 - 2 fotos
  'PZ1668-P.jpg',
  'PZ1668-F.jpg',      // Fachada
  
  // PZ1669 - 5 fotos
  'PZ1669-P.jpg',
  'PZ1669-T.jpg',
  'PZ1669-I.jpg',
  'PZ1669-S-T.jpg',    // Salida - Tubería
  'PZ1669-SUM1.jpg',   // Sumidero 1
  
  // PZ1670 - 3 fotos
  'PZ1670-P.jpg',
  'PZ1670-T.jpg',
  'PZ1670-C.jpg'       // Cilindro
];

fotos.forEach(foto => {
  crearImagenPlaceholder(foto);
});

console.log(`✓ Creadas ${fotos.length} imágenes placeholder en fotos/`);

// ============================================
// CREAR ARCHIVO DE INSTRUCCIONES
// ============================================

const instrucciones = `# Archivos de Prueba - Sistema de Fichas Técnicas

## Contenido

### 1. Excel: ejemplo_completo_33campos.xlsx
- **Descripción**: Archivo Excel con los 33 campos del sistema
- **Pozos incluidos**: 5 pozos de ejemplo
- **Campos**: Todos los 33 campos del diccionario de datos
- **Datos**: Realistas y completos

#### Pozos incluidos:
- **PZ1666**: Pozo completo en buen estado (4 fotos)
- **PZ1667**: Pozo con problemas menores (4 fotos)
- **PZ1668**: Pozo deteriorado (2 fotos)
- **PZ1669**: Pozo sin coordenadas GPS (5 fotos)
- **PZ1670**: Pozo con datos parciales (3 fotos)

### 2. Carpeta: fotos/
- **Descripción**: Imágenes placeholder para los pozos
- **Total**: 18 imágenes
- **Nomenclatura**: {CODIGO}-{TIPO}.jpg
- **Formatos**: PNG válido (placeholder)

#### Imágenes por pozo:
- PZ1666: P, T, I, A (4 fotos)
- PZ1667: P, T, E1-T, E1-Z (4 fotos)
- PZ1668: P, F (2 fotos)
- PZ1669: P, T, I, S-T, SUM1 (5 fotos)
- PZ1670: P, T, C (3 fotos)

## Cómo Usar

### Paso 1: Cargar Excel
1. Ir a http://localhost:3003/upload
2. Seleccionar: ejemplo_completo_33campos.xlsx
3. Esperar a que se cargue (debe detectar 5 pozos)

### Paso 2: Cargar Imágenes
1. En la misma página de upload
2. Seleccionar todas las imágenes de la carpeta fotos/
3. Esperar a que se asocien correctamente

### Paso 3: Revisar Pozos
1. Ir a http://localhost:3003/pozos
2. Verificar que aparecen los 5 pozos
3. Verificar que las fotos están asociadas

### Paso 4: Editar Ficha
1. Hacer clic en cualquier pozo
2. Ir a http://localhost:3003/editor/{id}
3. Verificar que todos los 33 campos se cargan
4. Editar algunos campos
5. Verificar que se guardan automáticamente

### Paso 5: Generar PDF
1. En el editor, hacer clic en "Generar PDF"
2. Descargar el PDF
3. Verificar que contiene todos los datos y fotos

### Paso 6: Exportar Todos
1. Volver a http://localhost:3003/pozos
2. Hacer clic en "Generar PDF" (botón de exportación)
3. Descargar ZIP con todos los PDFs

## Validación del Flujo Completo

Checklist para verificar que todo funciona:

- [ ] Excel se carga sin errores
- [ ] Se detectan 5 pozos correctamente
- [ ] Todos los 33 campos se muestran en la tabla
- [ ] Las 18 imágenes se cargan sin errores
- [ ] Las fotos se asocian correctamente a cada pozo
- [ ] Puedes hacer clic en un pozo para editarlo
- [ ] El editor muestra todos los 33 campos
- [ ] La vista previa se actualiza en tiempo real
- [ ] Las fotos se muestran en el editor
- [ ] Puedes editar campos y se guardan automáticamente
- [ ] Puedes generar PDF sin errores
- [ ] El PDF contiene todos los datos y fotos
- [ ] Puedes generar PDF de todos los pozos como ZIP

## Notas Importantes

1. **Imágenes**: Son placeholders PNG válidos. Puedes reemplazarlas con imágenes reales.
2. **Datos**: Son realistas pero ficticios. Puedes modificarlos según tus necesidades.
3. **Campos**: Los 33 campos corresponden exactamente al diccionario de datos del sistema.
4. **Nomenclatura**: Las imágenes siguen la nomenclatura {CODIGO}-{TIPO}.jpg

## Próximos Pasos

1. Reemplazar imágenes placeholder con fotos reales
2. Agregar más pozos según sea necesario
3. Personalizar datos según tu caso de uso
4. Exportar PDFs finales

---

**Creado**: 14 de Enero de 2026
**Versión**: 1.0
**Estado**: Listo para usar
`;

fs.writeFileSync(path.join(testDir, 'README.md'), instrucciones);
console.log('✓ Creado: README.md con instrucciones');

// ============================================
// RESUMEN FINAL
// ============================================

console.log('\n' + '='.repeat(60));
console.log('✅ ARCHIVOS DE PRUEBA CREADOS EXITOSAMENTE');
console.log('='.repeat(60));
console.log('\n📁 Ubicación: archivos-prueba/');
console.log('\n📊 Archivos generados:');
console.log('  ✓ ejemplo_completo_33campos.xlsx (5 pozos, 33 campos)');
console.log('  ✓ fotos/ (18 imágenes placeholder)');
console.log('  ✓ README.md (instrucciones de uso)');
console.log('\n📋 Pozos incluidos:');
console.log('  • PZ1666 - Completo y en buen estado (4 fotos)');
console.log('  • PZ1667 - Con problemas menores (4 fotos)');
console.log('  • PZ1668 - Deteriorado (2 fotos)');
console.log('  • PZ1669 - Sin coordenadas GPS (5 fotos)');
console.log('  • PZ1670 - Datos parciales (3 fotos)');
console.log('\n🎯 Próximo paso:');
console.log('  1. Cargar ejemplo_completo_33campos.xlsx en http://localhost:3003/upload');
console.log('  2. Cargar todas las imágenes de fotos/');
console.log('  3. Completar el flujo de trabajo completo');
console.log('\n' + '='.repeat(60));
