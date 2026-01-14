# Ejemplos de Excel para Pruebas

## Estructura de Columnas Requeridas

```
| ID_POZO | NOMBRE | UBICACION | PROFUNDIDAD | ESTADO | TIPO | OBSERVACIONES |
|---------|--------|-----------|-------------|--------|------|---------------|
```

### Descripción de Campos

| Campo | Tipo | Requerido | Ejemplo | Notas |
|-------|------|-----------|---------|-------|
| ID_POZO | Texto | Sí | PZ1666 | Identificador único |
| NOMBRE | Texto | Sí | Pozo Principal | Nombre descriptivo |
| UBICACION | Texto | Sí | Sector A | Ubicación geográfica |
| PROFUNDIDAD | Número | Sí | 150.5 | En metros |
| ESTADO | Texto | Sí | Activo | Activo/Inactivo/Mantenimiento |
| TIPO | Texto | No | Extracción | Tipo de pozo |
| OBSERVACIONES | Texto | No | Requiere limpieza | Notas adicionales |

---

## Ejemplo 1: Datos Mínimos

```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO
PZ1666,Pozo Principal,Sector A,150.5,Activo
PZ1667,Pozo Secundario,Sector B,120.0,Activo
PZ1668,Pozo Emergencia,Sector C,180.0,Inactivo
```

---

## Ejemplo 2: Datos Completos

```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO,TIPO,OBSERVACIONES
PZ1666,Pozo Principal,Sector A,150.5,Activo,Extracción,Funcionando correctamente
PZ1667,Pozo Secundario,Sector B,120.0,Activo,Inyección,Requiere mantenimiento
PZ1668,Pozo Emergencia,Sector C,180.0,Inactivo,Extracción,En espera de reparación
PZ1669,Pozo Experimental,Sector D,95.3,Mantenimiento,Prueba,Bajo evaluación
```

---

## Ejemplo 3: Datos con Caracteres Especiales

```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO,OBSERVACIONES
PZ1670,Pozo "A",Sector Ñ,165.8,Activo,Datos: 2024-01-14
PZ1671,Pozo-B,Sector (Este),142.0,Activo,Profundidad: 142m
PZ1672,Pozo_C,Sector [Oeste],175.5,Inactivo,Estado: Parado
```

---

## Ejemplo 4: Casos de Prueba Especiales

### Valores Límite
```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO
PZ9999,Pozo Profundo,Sector Extremo,9999.99,Activo
PZ0001,Pozo Superficial,Sector Cercano,0.1,Activo
```

### Valores Nulos (Campos Opcionales)
```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO,TIPO,OBSERVACIONES
PZ1673,Pozo Sin Tipo,Sector E,130.0,Activo,,
PZ1674,Pozo Sin Obs,Sector F,145.0,Activo,Extracción,
```

### Duplicados (Para Validación)
```
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO
PZ1675,Pozo Dup,Sector G,155.0,Activo
PZ1675,Pozo Duplicado,Sector H,160.0,Activo
```

---

## Cómo Crear Archivo de Prueba

### Opción 1: Excel Manual
1. Abrir Excel
2. Crear columnas con encabezados
3. Llenar datos según ejemplos
4. Guardar como `.xlsx`

### Opción 2: CSV a Excel
1. Copiar datos de ejemplo
2. Guardar como `.csv`
3. Abrir en Excel
4. Guardar como `.xlsx`

### Opción 3: Usar Archivo Existente
- Ubicación: `sistema-fichas-tecnicas/public/ejemplos/ejemplo_pozos.xlsx`
- Contiene datos de prueba listos para usar

---

## Validación de Datos

### Antes de Cargar

✓ Verificar que archivo es `.xlsx`
✓ Confirmar que tiene encabezados en primera fila
✓ Validar que ID_POZO es único
✓ Asegurar que PROFUNDIDAD es número
✓ Revisar que ESTADO es valor válido

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Formato no válido" | Archivo no es .xlsx | Guardar como Excel |
| "Columnas faltantes" | Faltan encabezados | Agregar ID_POZO, NOMBRE, etc |
| "Datos inválidos" | Profundidad no es número | Convertir a número |
| "IDs duplicados" | ID_POZO repetido | Hacer IDs únicos |

---

## Datos de Prueba Recomendados

Para pruebas completas, usar:
- **Mínimo**: 3 pozos
- **Estándar**: 10 pozos
- **Estrés**: 100+ pozos

---

## Archivo de Ejemplo Completo

```csv
ID_POZO,NOMBRE,UBICACION,PROFUNDIDAD,ESTADO,TIPO,OBSERVACIONES
PZ1666,Pozo Principal,Sector A,150.5,Activo,Extracción,Funcionando correctamente
PZ1667,Pozo Secundario,Sector B,120.0,Activo,Inyección,Requiere mantenimiento
PZ1668,Pozo Emergencia,Sector C,180.0,Inactivo,Extracción,En espera de reparación
PZ1669,Pozo Experimental,Sector D,95.3,Mantenimiento,Prueba,Bajo evaluación
PZ1670,Pozo Profundo,Sector E,200.0,Activo,Extracción,Profundidad máxima
PZ1671,Pozo Superficial,Sector F,50.0,Activo,Inyección,Profundidad mínima
PZ1672,Pozo Reserva,Sector G,165.0,Inactivo,Extracción,En reserva
PZ1673,Pozo Prueba,Sector H,130.0,Mantenimiento,Prueba,Bajo evaluación
PZ1674,Pozo Backup,Sector I,145.0,Activo,Extracción,Sistema de respaldo
PZ1675,Pozo Monitor,Sector J,155.0,Activo,Monitoreo,Seguimiento continuo
```

---

**Última actualización**: Enero 2026
**Versión**: 1.0
