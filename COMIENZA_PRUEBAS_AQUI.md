# Guía de Pruebas - 7 Pasos

## Paso 1: Preparar el Ambiente

```bash
cd sistema-fichas-tecnicas
npm install
npm run dev
```

Acceder a `http://localhost:3000`

---

## Paso 2: Preparar Datos de Prueba

1. Abrir `EJEMPLOS_EXCEL_PARA_PRUEBAS.md`
2. Descargar o crear archivo Excel con estructura válida
3. Asegurar que incluye columnas requeridas:
   - ID_POZO
   - NOMBRE
   - UBICACION
   - PROFUNDIDAD
   - ESTADO

---

## Paso 3: Cargar Archivo Excel

1. Ir a sección "Upload" en la aplicación
2. Hacer clic en "Seleccionar archivo" o arrastrar archivo
3. Esperar mensaje de validación
4. Confirmar que no hay errores

**Resultado esperado**: Lista de pozos importados visible

---

## Paso 4: Verificar Importación

1. Ir a sección "Pozos"
2. Revisar tabla de pozos importados
3. Verificar que:
   - Todos los pozos aparecen
   - Los datos coinciden con Excel
   - No hay valores faltantes críticos

**Resultado esperado**: Datos correctos en tabla

---

## Paso 5: Editar una Ficha

1. Seleccionar un pozo de la tabla
2. Ir a sección "Editor"
3. Modificar al menos 3 campos:
   - Cambiar nombre
   - Actualizar ubicación
   - Modificar observaciones
4. Verificar que cambios se guardan automáticamente

**Resultado esperado**: Cambios guardados sin errores

---

## Paso 6: Generar PDF

1. Con ficha abierta en editor
2. Hacer clic en botón "Exportar PDF"
3. Esperar generación
4. Descargar archivo

**Resultado esperado**: PDF descargado con cambios aplicados

---

## Paso 7: Validar Sincronización

1. Abrir DevTools (F12)
2. Ir a "Application" → "IndexedDB"
3. Expandir base de datos del proyecto
4. Verificar que:
   - Datos están persistidos
   - Cambios se reflejan en IndexedDB
   - Timestamps están actualizados

**Resultado esperado**: Datos sincronizados correctamente

---

## Checklist de Validación

- [ ] Paso 1: Ambiente funcionando
- [ ] Paso 2: Datos de prueba preparados
- [ ] Paso 3: Archivo cargado sin errores
- [ ] Paso 4: Datos importados correctamente
- [ ] Paso 5: Ediciones guardadas
- [ ] Paso 6: PDF generado
- [ ] Paso 7: Sincronización verificada

---

## Troubleshooting

### Error al cargar archivo
- Verificar formato Excel (.xlsx)
- Confirmar que tiene columnas requeridas
- Ver `EJEMPLOS_EXCEL_PARA_PRUEBAS.md`

### Cambios no se guardan
- Verificar que IndexedDB está habilitado
- Revisar consola para errores
- Intentar recargar página

### PDF no se genera
- Verificar que ficha tiene datos válidos
- Revisar permisos de descarga
- Intentar con otro navegador

---

**Tiempo estimado**: 15-20 minutos
**Requisitos**: Node.js 18+, navegador moderno
