# 🧪 INSTRUCCIONES PARA PRUEBAS MANUALES - pdfmake

**Estado del Servidor**: ⏳ Iniciando en http://localhost:3003

---

## 📋 CHECKLIST DE PRUEBAS MANUALES

### ✅ Paso 1: Acceder a la Aplicación

1. Abre tu navegador
2. Ve a: **http://localhost:3003**
3. Deberías ver la página principal de la aplicación

**Resultado esperado**:
- ✅ Página carga sin errores
- ✅ No hay errores en consola (F12)
- ✅ Interfaz es responsiva

---

### ✅ Paso 2: Cargar Datos de Prueba

#### 2.1 Crear archivo Excel de prueba

Crea un archivo `prueba.xlsx` con esta estructura:

| Código | Dirección | Barrio | Fecha | Levantó | Estado |
|--------|-----------|--------|-------|---------|--------|
| M680 | Calle Principal 123 | Centro | 2026-01-15 | Juan Pérez | Bueno |
| M681 | Avenida Secundaria 456 | Norte | 2026-01-15 | María García | Regular |
| M682 | Carrera Tercera 789 | Sur | 2026-01-15 | Carlos López | Malo |

#### 2.2 Cargar en la aplicación

1. Haz clic en "Cargar Datos" o "Upload"
2. Selecciona el archivo `prueba.xlsx`
3. Espera confirmación

**Resultado esperado**:
- ✅ Archivo se procesa sin errores
- ✅ Datos se importan correctamente
- ✅ Ves los pozos en la lista

---

### ✅ Paso 3: Cargar Fotos de Prueba

#### 3.1 Preparar fotos

Crea o descarga fotos con estos nombres:
```
M680-P.jpg  (Foto principal del pozo M680)
M680-T.jpg  (Foto de tuberías del pozo M680)
M681-P.jpg  (Foto principal del pozo M681)
M681-T.jpg  (Foto de tuberías del pozo M681)
```

#### 3.2 Cargar en la aplicación

1. En la sección de "Cargar Fotos"
2. Selecciona las fotos
3. Espera confirmación

**Resultado esperado**:
- ✅ Fotos se procesan sin errores
- ✅ Se asocian correctamente a los pozos
- ✅ Ves las fotos en la vista previa

---

### ✅ Paso 4: Generar PDF con pdfmake

#### 4.1 Abrir editor

1. Ve a la sección "Pozos"
2. Selecciona un pozo (ej: M680)
3. Haz clic en "Editar"

#### 4.2 Generar PDF

1. Haz clic en "Exportar PDF" o "Descargar PDF"
2. Espera a que se genere
3. El PDF se descargará automáticamente

**Resultado esperado**:
- ✅ PDF se genera sin errores
- ✅ Archivo se descarga
- ✅ Tamaño > 50 KB

---

### ✅ Paso 5: Validar Contenido del PDF

Abre el PDF descargado y verifica:

#### 5.1 Estructura
- ✅ Encabezado con título "FICHA TÉCNICA DE POZO DE INSPECCIÓN"
- ✅ ID del pozo visible
- ✅ Secciones claramente separadas
- ✅ Tablas bien formateadas
- ✅ Fotos incluidas

#### 5.2 Datos
- ✅ Identificación completa (ID, Coordenadas, Fecha, etc.)
- ✅ Ubicación correcta (Dirección, Barrio)
- ✅ Estructura visible (Tapa, Cilindro, Cono, etc.)
- ✅ Tuberías listadas (si existen)
- ✅ Sumideros listados (si existen)
- ✅ Observaciones incluidas

#### 5.3 Formato
- ✅ Página A4
- ✅ Márgenes correctos
- ✅ Texto legible
- ✅ Tablas alineadas
- ✅ Fotos visibles y bien posicionadas

---

### ✅ Paso 6: Validar Caracteres Especiales

#### 6.1 Editar con caracteres especiales

1. Abre el editor del pozo M680
2. Cambia los datos a:
   - **Dirección**: "Avenida Pérez García - Mañana"
   - **Barrio**: "Barrio Español"
   - **Observaciones**: "Tubería dañada. Ñoño está aquí. Revisión: 2026-01-15"
3. Guarda los cambios

#### 6.2 Generar PDF

1. Haz clic en "Exportar PDF"
2. Descarga el archivo
3. Abre en lector PDF

**Resultado esperado**:
- ✅ Caracteres especiales se renderizan correctamente
- ✅ Tildes visibles: á, é, í, ó, ú
- ✅ Ñ visible: ñ
- ✅ Texto legible y bien formateado

**Comparación con jsPDF**:
- jsPDF: Caracteres pueden no renderizar correctamente
- **pdfmake**: ✅ Caracteres se renderizan perfectamente

---

### ✅ Paso 7: Validar Selección de Texto

#### 7.1 Abrir PDF

1. Abre el PDF generado en lector
2. Selecciona texto (ej: "IDENTIFICACION")

#### 7.2 Verificar espacios

**Resultado esperado**:
- ✅ Texto seleccionado: "IDENTIFICACION" (sin espacios)
- ✅ Copia correctamente sin espacios

**Comparación con jsPDF**:
- jsPDF: "I D E N T I F I C A C I O N" (con espacios)
- **pdfmake**: ✅ "IDENTIFICACION" (sin espacios)

---

### ✅ Paso 8: Validar Tablas

#### 8.1 Verificar tablas de tuberías

1. Abre el PDF
2. Busca la sección "TUBERÍAS"
3. Verifica la tabla

**Resultado esperado**:
- ✅ Tabla bien formateada
- ✅ Encabezados claros: Diámetro, Material, Elevación, Estado, Longitud
- ✅ Datos alineados correctamente
- ✅ Bordes visibles

#### 8.2 Verificar tablas de sumideros

1. Busca la sección "SUMIDEROS"
2. Verifica la tabla

**Resultado esperado**:
- ✅ Tabla bien formateada
- ✅ Encabezados claros: ID, Tipo, Material, Diámetro, Profundidad, Estado
- ✅ Todos los campos visibles
- ✅ Datos completos

---

### ✅ Paso 9: Validar Fotos

#### 9.1 Verificar sección de fotos

1. Abre el PDF
2. Busca la sección "FOTOS"
3. Verifica las fotos

**Resultado esperado**:
- ✅ Fotos se muestran
- ✅ Están organizadas en grid (2 por fila)
- ✅ Descripciones visibles debajo de cada foto
- ✅ Calidad aceptable
- ✅ Tamaño proporcional

---

### ✅ Paso 10: Comparar con jsPDF (Opcional)

Si tienes acceso a la versión anterior con jsPDF:

#### 10.1 Generar PDF con jsPDF

1. Usa el endpoint antiguo (si está disponible)
2. Descarga el PDF

#### 10.2 Comparar PDFs

| Aspecto | jsPDF | pdfmake |
|---------|-------|---------|
| Espacios en selección | ❌ Sí | ✅ No |
| Caracteres especiales | ⚠️ Limitado | ✅ Perfecto |
| Tablas | ⚠️ Básicas | ✅ Profesionales |
| Fotos | ✅ Sí | ✅ Sí |
| Tamaño | Similar | Similar |
| Rendimiento | ⚠️ Medio | ✅ Mejor |

---

## 📊 CHECKLIST FINAL

- [ ] Paso 1: Acceder a la aplicación
- [ ] Paso 2: Cargar datos de prueba
- [ ] Paso 3: Cargar fotos de prueba
- [ ] Paso 4: Generar PDF con pdfmake
- [ ] Paso 5: Validar contenido del PDF
- [ ] Paso 6: Validar caracteres especiales
- [ ] Paso 7: Validar selección de texto
- [ ] Paso 8: Validar tablas
- [ ] Paso 9: Validar fotos
- [ ] Paso 10: Comparar con jsPDF (opcional)

---

## 🎯 RESULTADOS ESPERADOS

### ✅ Éxito Total
- Todos los pasos completados sin errores
- PDFs se generan correctamente con pdfmake
- Caracteres especiales se renderizan perfectamente
- Selección de texto sin espacios
- Tablas profesionales
- Fotos bien posicionadas

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
1. Verifica que el pozo tenga datos
2. Abre consola (F12) para ver error exacto
3. Verifica que los datos sean válidos
4. Intenta con otro pozo

### Error: "Caracteres especiales no se ven"
**Solución**:
1. Esto no debería ocurrir con pdfmake
2. Si ocurre, abre consola (F12)
3. Verifica que pdfmake está instalado correctamente
4. Intenta recargar la página

### Error: "Fotos no se muestran"
**Solución**:
1. Verifica que las fotos están en base64
2. Verifica que el tamaño no es muy grande
3. Abre consola (F12) para errores
4. Intenta con fotos más pequeñas

### Error: "Servidor no responde"
**Solución**:
1. Verifica que el servidor está corriendo: `npm run dev`
2. Verifica el puerto: http://localhost:3003
3. Abre consola del navegador (F12)
4. Intenta recargar la página

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

Una vez completadas todas las pruebas manuales:

1. ✅ Migración a pdfmake funciona correctamente
2. ✅ Caracteres especiales se renderizan perfectamente
3. ✅ Selección de texto sin espacios
4. ✅ Tablas profesionales
5. ✅ Listo para producción

---

**Última actualización**: 15 de Enero de 2026  
**Estado**: Listo para ejecutar pruebas manuales  
**Próximo paso**: Acceder a http://localhost:3003
