# Checklist de Caos - Demostrabilidad del Sistema

**Objetivo:** Verificar que el sistema es robusto ante fallos reales y caóticos.

Este checklist NO es QA formal. Es confianza: "Puedo romper esto de 10 formas y sigue funcionando".

---

## 1. Cierre Brusco del Navegador

**Escenario:** Usuario está editando una ficha, cierra el navegador sin guardar.

### Pasos:
1. Cargar archivo Excel con 5 pozos
2. Abrir editor de un pozo
3. Hacer 3-4 cambios en diferentes campos
4. **Cerrar navegador completamente** (no solo pestaña)
5. Reabrir navegador y volver a la aplicación

### Resultado esperado:
- ✅ La ficha se recupera automáticamente
- ✅ Los cambios están presentes (último estado válido)
- ✅ Se muestra mensaje: "Tu ficha fue recuperada"
- ✅ No hay error en consola
- ✅ Puedo seguir editando normalmente

### Evidencia:
- [ ] Captura de pantalla del mensaje de recuperación
- [ ] Verificar que los cambios están presentes
- [ ] Verificar que no hay errores en DevTools

---

## 2. Archivo Excel Corrupto

**Escenario:** Usuario carga un archivo Excel con datos malformados.

### Pasos:
1. Crear archivo Excel con:
   - Columnas faltantes (ej: sin "idPozo")
   - Datos vacíos en campos obligatorios
   - Valores con formato incorrecto (ej: "abc" en campo de número)
   - Caracteres especiales/emojis
2. Cargar archivo en la aplicación
3. Revisar tabla de pozos
4. Intentar generar PDF

### Resultado esperado:
- ✅ Archivo se carga sin error
- ✅ Se muestra advertencia: "Algunos datos están incompletos"
- ✅ Tabla muestra los datos disponibles
- ✅ Campos faltantes tienen valores por defecto
- ✅ PDF se genera con datos disponibles
- ✅ No hay crash

### Evidencia:
- [ ] Captura de tabla con datos incompletos
- [ ] Captura de advertencia
- [ ] PDF generado exitosamente

---

## 3. Fotografía Corrupta

**Escenario:** Usuario carga una imagen que no es válida.

### Pasos:
1. Crear archivo de "imagen" que no es válido:
   - Archivo de texto renombrado a .jpg
   - Archivo corrupto
   - Archivo muy grande (>50MB)
2. Cargar junto con archivo Excel válido
3. Revisar si se asoció a pozo
4. Intentar generar PDF

### Resultado esperado:
- ✅ Imagen corrupta se rechaza silenciosamente
- ✅ Se muestra advertencia: "1 imagen no pudo cargarse"
- ✅ Otras imágenes se cargan normalmente
- ✅ PDF se genera sin la imagen corrupta
- ✅ No hay crash

### Evidencia:
- [ ] Captura de advertencia
- [ ] PDF generado sin imagen corrupta

---

## 4. Recarga a Mitad de Edición

**Escenario:** Usuario recarga la página (F5) mientras está editando.

### Pasos:
1. Cargar archivo Excel
2. Abrir editor de un pozo
3. Hacer cambios en 5+ campos
4. **Presionar F5 para recargar**
5. Esperar a que cargue

### Resultado esperado:
- ✅ Página recarga sin error
- ✅ Ficha se recupera automáticamente
- ✅ Todos los cambios están presentes
- ✅ Se muestra mensaje: "Tu ficha fue recuperada"
- ✅ Puedo continuar editando

### Evidencia:
- [ ] Captura de ficha recuperada
- [ ] Verificar que los cambios están presentes

---

## 5. Cambio Rápido entre Fichas

**Escenario:** Usuario cambia rápidamente entre fichas sin esperar a que guarden.

### Pasos:
1. Cargar archivo Excel con 10+ pozos
2. Abrir editor de pozo #1
3. Hacer cambios
4. **Inmediatamente** abrir editor de pozo #2
5. Hacer cambios
6. Volver a pozo #1

### Resultado esperado:
- ✅ Cambios de pozo #1 están presentes
- ✅ Cambios de pozo #2 están presentes
- ✅ No hay mezcla de datos entre fichas
- ✅ No hay error de sincronización

### Evidencia:
- [ ] Captura de pozo #1 con cambios
- [ ] Captura de pozo #2 con cambios

---

## 6. Generación de PDF Interrumpida

**Escenario:** Usuario cancela generación de PDF a mitad.

### Pasos:
1. Cargar archivo Excel con 20+ pozos
2. Iniciar generación de PDF en lote
3. **Esperar 2-3 segundos y cerrar navegador**
4. Reabrir navegador

### Resultado esperado:
- ✅ Aplicación se recupera sin error
- ✅ Fichas están intactas
- ✅ Puedo intentar generar PDF de nuevo
- ✅ No hay archivos corruptos

### Evidencia:
- [ ] Captura de aplicación recuperada
- [ ] PDF generado exitosamente en segundo intento

---

## 7. Edición Simultánea de Múltiples Campos

**Escenario:** Usuario edita múltiples campos muy rápidamente.

### Pasos:
1. Abrir editor de un pozo
2. Hacer clic en campo #1, escribir, Enter
3. Inmediatamente clic en campo #2, escribir, Enter
4. Repetir 10+ veces rápidamente
5. Esperar a que guarde

### Resultado esperado:
- ✅ Todos los cambios se guardan
- ✅ No hay pérdida de datos
- ✅ No hay conflictos de sincronización
- ✅ Orden de cambios es correcto

### Evidencia:
- [ ] Captura de todos los campos con cambios
- [ ] Verificar en DevTools que se guardó correctamente

---

## 8. Falta de Espacio en Almacenamiento

**Escenario:** IndexedDB está lleno (simular con DevTools).

### Pasos:
1. Abrir DevTools (F12)
2. Ir a Application → Storage → IndexedDB
3. Simular almacenamiento lleno (o usar herramienta de límite)
4. Intentar guardar cambios en ficha
5. Intentar generar PDF

### Resultado esperado:
- ✅ Se muestra advertencia clara
- ✅ Cambios se mantienen en memoria
- ✅ Puedo seguir trabajando
- ✅ Se sugiere limpiar almacenamiento

### Evidencia:
- [ ] Captura de advertencia
- [ ] Verificar que la aplicación sigue funcionando

---

## 9. Datos Incompletos en Todos los Campos

**Escenario:** Usuario intenta generar PDF con ficha casi vacía.

### Pasos:
1. Crear nuevo pozo manualmente (sin Excel)
2. Dejar la mayoría de campos vacíos
3. Llenar solo ID del pozo
4. Intentar generar PDF

### Resultado esperado:
- ✅ PDF se genera con campos vacíos
- ✅ Se muestra advertencia: "Ficha incompleta"
- ✅ PDF es válido y abre correctamente
- ✅ No hay error

### Evidencia:
- [ ] Captura de advertencia
- [ ] PDF generado y abierto exitosamente

---

## 10. Recuperación Múltiple

**Escenario:** Sistema necesita recuperarse varias veces seguidas.

### Pasos:
1. Cargar archivo Excel
2. Abrir editor
3. Hacer cambios
4. Cerrar navegador
5. Reabrir y verificar recuperación
6. Hacer más cambios
7. Recargar página (F5)
8. Verificar recuperación de nuevo
9. Repetir 3-4 veces

### Resultado esperado:
- ✅ Cada recuperación funciona correctamente
- ✅ No hay degradación de datos
- ✅ No hay acumulación de errores
- ✅ Sistema sigue siendo estable

### Evidencia:
- [ ] Captura de cada recuperación exitosa
- [ ] Verificar que los datos son consistentes

---

## Resumen de Evidencia

Después de completar todos los checks, crear un documento con:

1. **Tabla de resultados:**
   | Check | Resultado | Evidencia |
   |-------|-----------|-----------|
   | 1. Cierre brusco | ✅ Pasó | [captura] |
   | 2. Excel corrupto | ✅ Pasó | [captura] |
   | ... | ... | ... |

2. **Conclusión:**
   - ✅ Sistema es robusto ante caos
   - ✅ Nunca pierde datos
   - ✅ Siempre se recupera
   - ✅ Listo para producción

---

## Notas Importantes

- **No es QA formal:** Este checklist es para confianza, no para cobertura de casos.
- **Enfoque en caos real:** Los escenarios son cosas que realmente pasan en producción.
- **Demostrabilidad:** Cada check tiene evidencia visual (capturas).
- **Iterativo:** Si algo falla, arreglarlo y repetir el check.

---

## Cómo Ejecutar

```bash
# 1. Abrir aplicación en navegador
npm run dev

# 2. Seguir cada check en orden
# 3. Tomar capturas de pantalla
# 4. Documentar resultados
# 5. Crear resumen final
```

---

## Criterio de Éxito

✅ **Sistema es demostrablemente seguro cuando:**
- Todos los 10 checks pasan
- No hay errores en consola
- No hay pérdida de datos
- Recuperación es automática y transparente
- Usuario puede confiar en que su trabajo está seguro
