# 🧪 GUÍA DE PRUEBAS - MIGRACIÓN A pdfmake

**Objetivo**: Validar que la migración de jsPDF a pdfmake funciona correctamente

**Tiempo estimado**: 30-45 minutos

---

## 📋 REQUISITOS PREVIOS

### Software
- Node.js 18+
- npm o yarn
- Navegador moderno

### Datos
- Archivo Excel con datos de pozos
- Fotos de pozos (con caracteres especiales en nombres si es posible)

---

## 🚀 PASO 1: INICIAR EL SERVIDOR

```bash
cd sistema-fichas-tecnicas
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
```

### 2.2 Cargar en aplicación

1. Ir a `/upload`
2. Cargar Excel
3. Esperar confirmación

**Resultado esperado**:
- ✅ Archivo se procesa sin errores
- ✅ Datos se importan correctamente

---

## 📸 PASO 3: CARGAR FOTOS

### 3.1 Preparar fotos

Crear fotos con nomenclatura:
```
M680-P.jpg
M680-T.jpg
M681-P.jpg
```

### 3.2 Cargar en aplicación

1. En `/upload`, cargar fotos
2. Esperar confirmación

**Resultado esperado**:
- ✅ Fotos se procesan sin errores
- ✅ Se asocian correctamente

---

## 📄 PASO 4: GENERAR PDF CON pdfmake

### 4.1 Abrir editor

1. Ir a `/pozos`
2. Seleccionar un pozo
3. Hacer clic en "Editar"

### 4.2 Generar PDF

1. Hacer clic en "Exportar PDF"
2. Esperar generación
3. Descargar archivo

**Resultado esperado**:
- ✅ PDF se genera sin errores
- ✅ Archivo se descarga
- ✅ Tamaño > 50 KB

---

## 🔍 PASO 5: VALIDAR CONTENIDO DEL PDF

Abrir PDF descargado y verificar:

### 5.1 Estructura
- ✅ Encabezado con título
- ✅ Secciones claramente separadas
- ✅ Tablas bien formateadas
- ✅ Fotos incluidas

### 5.2 Datos
- ✅ Identificación completa
- ✅ Ubicación correcta
- ✅ Estructura visible
- ✅ Tuberías listadas
- ✅ Sumideros listados
- ✅ Observaciones incluidas

### 5.3 Formato
- ✅ Página A4
- ✅ Márgenes correctos
- ✅ Texto legible
- ✅ Tablas alineadas
- ✅ Fotos visibles

---

## 🔤 PASO 6: VALIDAR CARACTERES ESPECIALES

### 6.1 Editar con caracteres especiales

1. Abrir editor
2. Cambiar dirección a: "Avenida Pérez García - Mañana"
3. Cambiar barrio a: "Barrio Español"
4. Cambiar observaciones a: "Tubería dañada. Ñoño está aquí."
5. Guardar

### 6.2 Generar PDF

1. Hacer clic en "Exportar PDF"
2. Descargar archivo
3. Abrir en lector PDF

**Resultado esperado**:
- ✅ Caracteres especiales se renderizan correctamente
- ✅ Tildes visibles: á, é, í, ó, ú
- ✅ Ñ visible: ñ
- ✅ Texto legible

**Comparación con jsPDF**:
- jsPDF: Caracteres pueden no renderizar correctamente
- pdfmake: ✅ Caracteres se renderizan perfectamente

---

## ✂️ PASO 7: VALIDAR SELECCIÓN DE TEXTO

### 7.1 Abrir PDF

1. Abrir PDF generado en lector
2. Seleccionar texto (ej: "IDENTIFICACION")

### 7.2 Verificar espacios

**Resultado esperado**:
- ✅ Texto seleccionado: "IDENTIFICACION" (sin espacios)
- ✅ Copia correctamente sin espacios

**Comparación con jsPDF**:
- jsPDF: "I D E N T I F I C A C I O N" (con espacios)
- pdfmake: ✅ "IDENTIFICACION" (sin espacios)

---

## 📊 PASO 8: VALIDAR TABLAS

### 8.1 Verificar tablas de tuberías

1. Abrir PDF
2. Buscar sección "TUBERÍAS"
3. Verificar tabla

**Resultado esperado**:
- ✅ Tabla bien formateada
- ✅ Encabezados claros
- ✅ Datos alineados
- ✅ Bordes visibles

### 8.2 Verificar tablas de sumideros

1. Buscar sección "SUMIDEROS"
2. Verificar tabla

**Resultado esperado**:
- ✅ Tabla bien formateada
- ✅ Todos los campos visibles
- ✅ Datos completos

---

## 📸 PASO 9: VALIDAR FOTOS

### 9.1 Verificar sección de fotos

1. Abrir PDF
2. Buscar sección "FOTOS"
3. Verificar fotos

**Resultado esperado**:
- ✅ Fotos se muestran
- ✅ Están organizadas en grid (2 por fila)
- ✅ Descripciones visibles
- ✅ Calidad aceptable

---

## 🔄 PASO 10: COMPARAR CON jsPDF

### 10.1 Generar PDF con jsPDF (antiguo)

1. Usar endpoint `/api/pdf` (si aún está disponible)
2. Descargar PDF

### 10.2 Comparar PDFs

| Aspecto | jsPDF | pdfmake |
|---------|-------|---------|
| Espacios en selección | ❌ Sí | ✅ No |
| Caracteres especiales | ⚠️ Limitado | ✅ Perfecto |
| Tablas | ⚠️ Básicas | ✅ Profesionales |
| Fotos | ✅ Sí | ✅ Sí |
| Tamaño | Similar | Similar |
| Rendimiento | ⚠️ Medio | ✅ Mejor |

---

## 📋 CHECKLIST FINAL

- [ ] Paso 1: Servidor inicia correctamente
- [ ] Paso 2: Datos se cargan sin errores
- [ ] Paso 3: Fotos se cargan sin errores
- [ ] Paso 4: PDF se genera con pdfmake
- [ ] Paso 5: Contenido es correcto
- [ ] Paso 6: Caracteres especiales se renderizan
- [ ] Paso 7: Selección de texto sin espacios
- [ ] Paso 8: Tablas bien formateadas
- [ ] Paso 9: Fotos se muestran correctamente
- [ ] Paso 10: Comparación con jsPDF

---

## 📊 RESULTADOS ESPERADOS

### ✅ Éxito Total
- Todos los pasos completados sin errores
- PDFs se generan correctamente con pdfmake
- Caracteres especiales se renderizan perfectamente
- Selección de texto sin espacios
- Tablas profesionales

### ⚠️ Éxito Parcial
- Algunos pasos tienen advertencias
- PDFs se generan pero con limitaciones menores
- Algunos caracteres especiales pueden no ser perfectos

### ❌ Fallo
- Errores en generación de PDF
- Datos no se muestran correctamente
- Caracteres especiales no se renderizan

---

## 🐛 TROUBLESHOOTING

### Error: "PDF no se genera"
**Solución**:
1. Verificar que el pozo tenga fotos
2. Revisar consola (F12) para error exacto
3. Verificar que los datos sean válidos

### Error: "Caracteres especiales no se ven"
**Solución**:
1. Esto no debería ocurrir con pdfmake
2. Si ocurre, revisar consola
3. Verificar que pdfmake está instalado correctamente

### Error: "Fotos no se muestran"
**Solución**:
1. Verificar que las fotos están en base64
2. Verificar que el tamaño no es muy grande
3. Revisar consola para errores

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

1. ✅ Migración a pdfmake funciona correctamente
2. ✅ Caracteres especiales se renderizan perfectamente
3. ✅ Selección de texto sin espacios
4. ✅ Tablas profesionales
5. ✅ Listo para producción

---

**Última actualización**: 15 de Enero de 2026  
**Próxima revisión**: Después de completar pruebas  
**Estado**: Listo para ejecutar

