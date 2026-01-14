# Guía de Inicio Rápido

## 5 Minutos para Empezar

### 1. Instalar Dependencias

```bash
cd sistema-fichas-tecnicas
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Acceder a `http://localhost:3000`

### 3. Descargar Datos de Ejemplo

Descarga el archivo Excel de ejemplo:
- **Ubicación**: `public/ejemplos/ejemplo_pozos.xlsx`
- **Contiene**: 10 pozos de ejemplo listos para usar

### 4. Cargar Archivo Excel

1. Ir a la sección "Upload"
2. Hacer clic en "Seleccionar archivo" o arrastrar el Excel
3. Esperar confirmación de carga

### 5. Ver Datos Importados

1. Ir a la sección "Pozos"
2. Revisar tabla con todos los pozos importados
3. Hacer clic en un pozo para ver detalles

---

## Tareas Comunes

### Editar un Pozo

1. Seleccionar pozo de la tabla
2. Ir a "Editor"
3. Modificar campos necesarios
4. Los cambios se guardan automáticamente

### Generar PDF

1. Abrir pozo en editor
2. Hacer clic en "Exportar PDF"
3. Descargar archivo generado

### Buscar Pozo

1. Usar barra de búsqueda en tabla
2. Filtrar por estado, tipo, etc.
3. Hacer clic en resultado

### Agregar Fotos

1. En editor, ir a sección "Fotos"
2. Hacer clic en "Agregar foto"
3. Seleccionar imagen
4. Se guarda automáticamente

---

## Estructura de Datos

### Campos Requeridos

- **ID_POZO**: Identificador único (ej: PZ1666)
- **NOMBRE**: Nombre descriptivo (ej: Pozo Principal)
- **UBICACION**: Ubicación geográfica (ej: Sector A)
- **PROFUNDIDAD**: Profundidad en metros (ej: 150.5)
- **ESTADO**: Estado del pozo (Activo/Inactivo/Mantenimiento)

### Campos Opcionales

- TIPO: Tipo de pozo (Extracción/Inyección/Monitoreo)
- OBSERVACIONES: Notas adicionales
- CAUDAL: Caudal en L/min
- PRESION: Presión en Bar
- TEMPERATURA: Temperatura en °C
- RESPONSABLE: Persona responsable
- FOTOS: Galería de imágenes

---

## Formato Excel Requerido

### Encabezados (Primera Fila)

```
ID_POZO | NOMBRE | UBICACION | PROFUNDIDAD | ESTADO | TIPO | OBSERVACIONES
```

### Ejemplo de Datos

```
PZ1666 | Pozo Principal | Sector A | 150.5 | Activo | Extracción | Funcionando
PZ1667 | Pozo Secundario | Sector B | 120.0 | Activo | Inyección | Mantenimiento
```

### Validaciones

✓ Archivo debe ser .xlsx
✓ Encabezados en primera fila
✓ ID_POZO debe ser único
✓ PROFUNDIDAD debe ser número
✓ ESTADO debe ser válido

---

## Troubleshooting Rápido

### "Archivo no válido"
- Verificar que es .xlsx (no .xls ni .csv)
- Guardar desde Excel como "Excel Workbook"

### "Columnas faltantes"
- Verificar que tiene: ID_POZO, NOMBRE, UBICACION, PROFUNDIDAD, ESTADO
- Agregar columnas faltantes

### "Datos no se guardan"
- Verificar que IndexedDB está habilitado
- Recargar página
- Intentar en navegador diferente

### "PDF no se descarga"
- Verificar permisos de descarga
- Desactivar bloqueador de pop-ups
- Intentar con otro navegador

---

## Documentación Completa

Para más detalles, consulta:

- **Diccionario de Campos**: `docs/FIELD_DICTIONARY.md`
- **Referencia Técnica**: `docs/TECHNICAL_REFERENCE.md`
- **Guía de Pruebas**: `../COMIENZA_PRUEBAS_AQUI.md`
- **Ejemplos de Excel**: `../EJEMPLOS_EXCEL_PARA_PRUEBAS.md`

---

## Soporte

Si encuentras problemas:

1. Revisar logs en consola (F12)
2. Verificar IndexedDB en DevTools
3. Consultar documentación relevante
4. Intentar recargar página
5. Limpiar caché del navegador

---

**Última actualización**: Enero 2026
**Versión**: 1.0
