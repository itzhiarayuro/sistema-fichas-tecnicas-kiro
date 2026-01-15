# Archivos de Prueba - Sistema de Fichas Técnicas

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
