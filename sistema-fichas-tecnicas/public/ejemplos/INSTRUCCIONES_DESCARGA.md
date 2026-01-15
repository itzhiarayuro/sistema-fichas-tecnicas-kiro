# Instrucciones de Descarga - Archivos de Ejemplo

## ¿Qué descargar?

Desde la página de carga (`/upload`), encontrarás tres botones para descargar los archivos de ejemplo:

### 1. **Excel Completo (33 campos)** 
- **Archivo**: `ejemplo_completo_33campos.xlsx`
- **Contenido**: 5 pozos con todos los 33 campos del sistema
- **Pozos incluidos**:
  - PZ1666: Completo y en buen estado
  - PZ1667: Con problemas menores
  - PZ1668: Deteriorado
  - PZ1669: Sin coordenadas GPS
  - PZ1670: Datos parciales
- **Uso**: Carga este archivo en el sistema para importar los pozos

### 2. **Fotos de Ejemplo (18 imágenes ZIP)**
- **Archivo**: `fotos-ejemplo.zip`
- **Contenido**: 18 imágenes PNG válidas con nomenclatura correcta
- **Imágenes por pozo**:
  - PZ1666: 4 fotos (P, T, I, A)
  - PZ1667: 4 fotos (P, T, E1-T, E1-Z)
  - PZ1668: 2 fotos (P, F)
  - PZ1669: 5 fotos (P, T, I, S-T, SUM1)
  - PZ1670: 3 fotos (P, T, C)
- **Uso**: Extrae el ZIP y carga todas las imágenes en el sistema

### 3. **Guía de Uso**
- **Archivo**: `README.md`
- **Contenido**: Instrucciones paso a paso para completar el flujo
- **Uso**: Lectura para entender cómo usar el sistema

---

## Flujo Completo de Prueba

### Paso 1: Descargar Archivos
1. Ve a http://localhost:3003/upload
2. Descarga los 3 archivos:
   - Excel Completo (33 campos)
   - Fotos de Ejemplo (ZIP)
   - Guía de Uso (opcional)

### Paso 2: Preparar Archivos
1. Guarda el Excel en una carpeta
2. Extrae el ZIP de fotos en la misma carpeta
3. Ahora tienes:
   ```
   carpeta/
   ├── ejemplo_completo_33campos.xlsx
   └── fotos/
       ├── PZ1666-P.jpg
       ├── PZ1666-T.jpg
       ├── PZ1666-I.jpg
       ├── PZ1666-A.jpg
       ├── PZ1667-P.jpg
       ├── ... (18 imágenes total)
   ```

### Paso 3: Cargar en el Sistema
1. Ve a http://localhost:3003/upload
2. Arrastra o selecciona el Excel: `ejemplo_completo_33campos.xlsx`
3. Espera a que se procese (debe detectar 5 pozos)
4. Arrastra o selecciona todas las imágenes de la carpeta `fotos/`
5. Espera a que se procesen (debe detectar 18 imágenes)

### Paso 4: Revisar Pozos
1. Haz clic en "Continuar"
2. Ve a http://localhost:3003/pozos
3. Verifica que aparecen los 5 pozos
4. Verifica que las fotos están asociadas correctamente

### Paso 5: Editar Ficha
1. Haz clic en cualquier pozo (ej: PZ1666)
2. Ve a http://localhost:3003/editor/PZ1666
3. Verifica que todos los 33 campos se cargan
4. Edita algunos campos
5. Verifica que se guardan automáticamente

### Paso 6: Generar PDF
1. En el editor, haz clic en "Generar PDF"
2. Descarga el PDF
3. Verifica que contiene todos los datos y fotos

### Paso 7: Exportar Todos
1. Vuelve a http://localhost:3003/pozos
2. Haz clic en "Generar PDF" (botón de exportación)
3. Descarga el ZIP con todos los PDFs

---

## Validación del Flujo Completo

Checklist para verificar que todo funciona:

- [ ] Excel se descarga correctamente
- [ ] ZIP de fotos se descarga correctamente
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

---

## Notas Importantes

1. **Imágenes**: Son placeholders PNG válidos. Puedes reemplazarlas con imágenes reales.
2. **Datos**: Son realistas pero ficticios. Puedes modificarlos según tus necesidades.
3. **Campos**: Los 33 campos corresponden exactamente al diccionario de datos del sistema.
4. **Nomenclatura**: Las imágenes siguen la nomenclatura `{CODIGO}-{TIPO}.jpg`

---

## Próximos Pasos

1. Reemplazar imágenes placeholder con fotos reales
2. Agregar más pozos según sea necesario
3. Personalizar datos según tu caso de uso
4. Exportar PDFs finales

---

**Creado**: 14 de Enero de 2026
**Versión**: 1.0
**Estado**: Listo para usar
