# 🧪 GUÍA DE PRUEBAS MANUALES - GENERACIÓN DE PDFs

**Objetivo**: Validar que el sistema genera PDFs correctamente con datos reales

**Tiempo estimado**: 20-30 minutos

---

## 📋 REQUISITOS PREVIOS

### Software
- Node.js 18+
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Datos
- Archivo Excel con datos de pozos
- Fotos de pozos (opcional pero recomendado)

---

## 🚀 PASO 1: INICIAR EL SERVIDOR

```bash
cd sistema-fichas-tecnicas
npm install
npm run dev
```

Acceder a: `http://localhost:3000`

**Resultado esperado**:
- ✅ Servidor inicia sin errores
- ✅ Página carga correctamente
- ✅ No hay errores en consola (F12)

---

## 📤 PASO 2: CARGAR DATOS

### 2.1 Preparar archivo Excel

Crear archivo `prueba.xlsx` con estructura:

```
| Código | Dirección | Barrio | Fecha | Levantó | Estado |
|--------|-----------|--------|-------|---------|--------|
| M680   | Calle 1   | Centro | 2026-01-15 | Juan | Bueno |
| M681   | Calle 2   | Norte  | 2026-01-15 | Juan | Regular |
| M682   | Calle 3   | Sur    | 2026-01-15 | Juan | Malo |
```

### 2.2 Cargar en aplicación

1. Ir a `/upload`
2. Hacer clic en "Seleccionar archivo"
3. Seleccionar `prueba.xlsx`
4. Esperar confirmación

**Resultado esperado**:
- ✅ Archivo se procesa sin errores
- ✅ Mensaje: "3 pozos importados"
- ✅ No hay errores en consola

---

## 📸 PASO 3: CARGAR FOTOS (OPCIONAL)

### 3.1 Preparar fotos

Crear fotos con nomenclatura:
```
M680-P.jpg      (Panorámica)
M680-T.jpg      (Tubería)
M681-P.jpg      (Panorámica)
M681-I.jpg      (Interior)
M682-P.jpg      (Panorámica)
```

### 3.2 Cargar en aplicación

1. En `/upload`, hacer clic en "Seleccionar fotos"
2. Seleccionar todas las fotos
3. Esperar confirmación

**Resultado esperado**:
- ✅ Fotos se procesan sin errores
- ✅ Mensaje: "5 fotos asociadas"
- ✅ No hay errores en consola

---

## 📋 PASO 4: VERIFICAR LISTA DE POZOS

1. Ir a `/pozos`
2. Revisar tabla de pozos

**Resultado esperado**:
- ✅ Se muestran 3 pozos (M680, M681, M682)
- ✅ Se muestra contador de fotos (ej: "2 fotos")
- ✅ Se muestra estado (Bueno, Regular, Malo)
- ✅ No hay errores en consola

---

## ✏️ PASO 5: ABRIR EDITOR

1. Hacer clic en un pozo (ej: M680)
2. Hacer clic en "Editar"
3. Esperar a que cargue

**Resultado esperado**:
- ✅ Editor carga sin errores
- ✅ Se muestran todos los datos
- ✅ Se muestran las fotos
- ✅ No hay error "Editor no se pudo cargar"

---

## 📝 PASO 6: EDITAR DATOS

1. Cambiar al menos 3 campos:
   - Dirección
   - Barrio
   - Observaciones

2. Verificar que se guardan automáticamente

**Resultado esperado**:
- ✅ Cambios se guardan sin errores
- ✅ No hay mensajes de error
- ✅ Datos persisten al recargar

---

## 📄 PASO 7: GENERAR PDF

### 7.1 PDF Individual

1. Con editor abierto, hacer clic en "Exportar PDF"
2. Esperar generación
3. Descargar archivo

**Resultado esperado**:
- ✅ PDF se genera sin errores
- ✅ Archivo se descarga
- ✅ Tamaño > 50 KB
- ✅ Se puede abrir en lector PDF

### 7.2 Validar contenido del PDF

Abrir PDF descargado y verificar:

- ✅ **Identificación**
  - ID Pozo: M680
  - Coordenadas: -74.123456, 4.678901
  - Fecha: 2026-01-15
  - Inspector: Juan Pérez
  - Estado: Bueno

- ✅ **Ubicación**
  - Dirección: Calle 1
  - Barrio: Centro
  - Elevación: 2600
  - Profundidad: 2.5

- ✅ **Estructura**
  - Tapa: Concreto
  - Cilindro: Concreto
  - Cono: Concreto
  - Peldaños: Hierro

- ✅ **Tuberías**
  - Entrada: 150mm PVC
  - Salida: 200mm PVC

- ✅ **Sumideros**
  - Sumidero 1: Rejilla

- ✅ **Fotos**
  - Se muestran las fotos cargadas
  - Están organizadas por categoría

- ✅ **Observaciones**
  - Se muestra el texto ingresado

### 7.3 Validar formato

- ✅ Página A4 (210x297mm)
- ✅ Márgenes correctos
- ✅ Texto legible
- ✅ Fotos visibles
- ✅ Tablas alineadas
- ✅ Números de página (si está habilitado)

---

## 🔤 PASO 8: VALIDAR CARACTERES ESPECIALES

### 8.1 Editar con caracteres especiales

1. Abrir editor
2. Cambiar dirección a: "Avenida Pérez García - Mañana"
3. Cambiar barrio a: "Barrio Español"
4. Cambiar observaciones a: "Tubería dañada. Requiere reparación inmediata. Ñoño está aquí."
5. Guardar

### 8.2 Generar PDF

1. Hacer clic en "Exportar PDF"
2. Descargar archivo
3. Abrir en lector PDF

**Resultado esperado**:
- ✅ Caracteres especiales se renderizan
- ⚠️ Tildes y ñ pueden no ser perfectas (limitación de jsPDF)
- ✅ Texto es legible

**Nota**: Si los caracteres especiales no se ven bien, esto es una limitación conocida de jsPDF que se solucionaría con pdfmake.

---

## 📦 PASO 9: GENERAR LOTE DE PDFs

### 9.1 Seleccionar múltiples pozos

1. Ir a `/pozos`
2. Seleccionar 3 pozos (M680, M681, M682)
3. Hacer clic en "Exportar Lote"

**Resultado esperado**:
- ✅ Se muestra progreso
- ✅ Se generan 3 PDFs
- ✅ Se empaquetan en ZIP
- ✅ Se descarga archivo ZIP

### 9.2 Validar ZIP

1. Descargar archivo ZIP
2. Extraer contenido
3. Verificar que contiene 3 PDFs

**Resultado esperado**:
- ✅ ZIP contiene 3 archivos
- ✅ Cada archivo es un PDF válido
- ✅ Nombres: ficha_M680_*.pdf, ficha_M681_*.pdf, ficha_M682_*.pdf

---

## 🔍 PASO 10: VALIDAR SELECCIÓN DE TEXTO

### 10.1 Abrir PDF

1. Abrir PDF generado en lector
2. Seleccionar texto (ej: "IDENTIFICACION")

### 10.2 Verificar espacios

**Resultado esperado**:
- ⚠️ Texto seleccionado: "I D E N T I F I C A C I O N" (con espacios)
- ⚠️ Esto es una limitación conocida de jsPDF
- ✅ Será solucionado con pdfmake

---

## 📊 PASO 11: VALIDAR PAGINACIÓN

### 11.1 Crear pozo con muchos datos

1. Abrir editor
2. Agregar 10+ tuberías
3. Agregar 10+ sumideros
4. Agregar 10+ fotos
5. Guardar

### 11.2 Generar PDF

1. Hacer clic en "Exportar PDF"
2. Descargar archivo

**Resultado esperado**:
- ✅ PDF se genera sin errores
- ✅ PDF tiene múltiples páginas
- ✅ Encabezados se repiten en cada página
- ✅ Números de página son correctos

---

## 🐛 PASO 12: VALIDAR MANEJO DE ERRORES

### 12.1 Intentar generar PDF sin fotos

1. Crear pozo sin fotos
2. Intentar generar PDF

**Resultado esperado**:
- ✅ Se muestra error: "No se puede generar PDF: la ficha no tiene fotos"
- ✅ Error es claro y útil

### 12.2 Intentar generar PDF con datos incompletos

1. Crear pozo sin dirección
2. Intentar generar PDF

**Resultado esperado**:
- ✅ PDF se genera de todas formas
- ✅ Campos vacíos se muestran en blanco
- ✅ No hay errores

---

## 📋 CHECKLIST FINAL

- [ ] Paso 1: Servidor inicia correctamente
- [ ] Paso 2: Datos se cargan sin errores
- [ ] Paso 3: Fotos se cargan sin errores
- [ ] Paso 4: Lista de pozos se muestra correctamente
- [ ] Paso 5: Editor abre sin errores
- [ ] Paso 6: Datos se editan y guardan
- [ ] Paso 7: PDF individual se genera correctamente
- [ ] Paso 8: Caracteres especiales se renderizan
- [ ] Paso 9: Lote de PDFs se genera correctamente
- [ ] Paso 10: Selección de texto funciona (con espacios)
- [ ] Paso 11: Paginación funciona correctamente
- [ ] Paso 12: Manejo de errores funciona

---

## 📊 RESULTADOS ESPERADOS

### ✅ Éxito Total
- Todos los pasos completados sin errores
- PDFs se generan correctamente
- Datos se muestran correctamente
- Fotos se incluyen correctamente

### ⚠️ Éxito Parcial
- Algunos pasos tienen advertencias
- PDFs se generan pero con limitaciones
- Caracteres especiales no se renderizan perfectamente

### ❌ Fallo
- Errores en generación de PDF
- Datos no se muestran correctamente
- Fotos no se incluyen

---

## 🐛 TROUBLESHOOTING

### Error: "Editor no se pudo cargar"
**Solución**:
1. Abrir consola (F12)
2. Buscar error exacto
3. Verificar que el pozo tenga datos
4. Recargar página

### Error: "No se puede generar PDF"
**Solución**:
1. Verificar que el pozo tenga fotos
2. Verificar que los datos sean válidos
3. Revisar consola para error exacto

### PDF se genera pero está vacío
**Solución**:
1. Verificar que los datos se guardaron
2. Verificar que el pozo tenga datos
3. Intentar generar de nuevo

### Caracteres especiales no se ven
**Solución**:
1. Esto es una limitación conocida de jsPDF
2. Se solucionará con migración a pdfmake
3. Por ahora, usar transliteración manual

---

## 📞 INFORMACIÓN DE DEBUGGING

Si algo no funciona, proporciona:

1. **Navegador**: Chrome, Firefox, Safari, Edge
2. **Sistema operativo**: Windows, macOS, Linux
3. **Error exacto**: Copiar de consola (F12)
4. **Pasos para reproducir**: Descripción detallada
5. **Datos de prueba**: Archivo Excel y fotos

---

## 🎯 CONCLUSIÓN

Una vez completadas todas las pruebas:

1. ✅ Sistema funciona correctamente
2. ✅ PDFs se generan sin errores
3. ✅ Datos se muestran correctamente
4. ✅ Fotos se incluyen correctamente
5. ✅ Listo para migración a pdfmake

---

**Última actualización**: 15 de Enero de 2026  
**Próxima revisión**: Después de completar pruebas  
**Estado**: Listo para ejecutar

