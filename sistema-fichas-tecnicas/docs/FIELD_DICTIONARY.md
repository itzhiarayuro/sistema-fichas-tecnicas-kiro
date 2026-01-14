# Diccionario de Campos - Sistema de Fichas Técnicas

## Descripción General

Este documento define todos los campos disponibles en el sistema, sus tipos, restricciones y comportamientos esperados.

---

## Campos de Identificación

### ID_POZO
- **Tipo**: Texto (String)
- **Requerido**: Sí
- **Longitud**: 1-20 caracteres
- **Patrón**: Alfanumérico (letras, números, guiones)
- **Ejemplo**: `PZ1666`, `POZO-001`, `P001`
- **Descripción**: Identificador único del pozo
- **Notas**: Debe ser único en toda la base de datos. No se puede cambiar después de crear el pozo.

### NOMBRE
- **Tipo**: Texto (String)
- **Requerido**: Sí
- **Longitud**: 1-100 caracteres
- **Ejemplo**: `Pozo Principal`, `Pozo de Extracción A`
- **Descripción**: Nombre descriptivo del pozo
- **Notas**: Puede contener espacios y caracteres especiales

---

## Campos de Ubicación

### UBICACION
- **Tipo**: Texto (String)
- **Requerido**: Sí
- **Longitud**: 1-100 caracteres
- **Ejemplo**: `Sector A`, `Zona Norte`, `Coordenadas: 10.5, 20.3`
- **Descripción**: Ubicación geográfica del pozo
- **Notas**: Puede ser descripción textual o coordenadas

### LATITUD
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: -90 a 90
- **Ejemplo**: `10.5234`
- **Descripción**: Coordenada de latitud
- **Notas**: Formato decimal, 4-6 decimales recomendado

### LONGITUD
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: -180 a 180
- **Ejemplo**: `-75.2156`
- **Descripción**: Coordenada de longitud
- **Notas**: Formato decimal, 4-6 decimales recomendado

---

## Campos Técnicos

### PROFUNDIDAD
- **Tipo**: Número (Decimal)
- **Requerido**: Sí
- **Rango**: 0.1 a 9999.99
- **Unidad**: Metros
- **Ejemplo**: `150.5`, `120.0`, `95.3`
- **Descripción**: Profundidad del pozo
- **Notas**: Debe ser positivo. Se almacena con 2 decimales

### DIAMETRO
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: 0.1 a 500
- **Unidad**: Milímetros
- **Ejemplo**: `150`, `200.5`
- **Descripción**: Diámetro del pozo
- **Notas**: Debe ser positivo

### CAUDAL
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: 0 a 99999.99
- **Unidad**: Litros por minuto (L/min)
- **Ejemplo**: `50.5`, `100.0`
- **Descripción**: Caudal de extracción o inyección
- **Notas**: Puede ser 0 si el pozo está inactivo

### PRESION
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: 0 a 9999.99
- **Unidad**: Bar
- **Ejemplo**: `2.5`, `10.0`
- **Descripción**: Presión del pozo
- **Notas**: Puede variar según el tipo de pozo

### TEMPERATURA
- **Tipo**: Número (Decimal)
- **Requerido**: No
- **Rango**: -50 a 150
- **Unidad**: Grados Celsius
- **Ejemplo**: `25.5`, `18.0`
- **Descripción**: Temperatura del agua
- **Notas**: Puede ser negativa en climas fríos

---

## Campos de Estado

### ESTADO
- **Tipo**: Texto (Enumeración)
- **Requerido**: Sí
- **Valores válidos**: 
  - `Activo` - Pozo en funcionamiento
  - `Inactivo` - Pozo no operativo
  - `Mantenimiento` - Pozo en mantenimiento
  - `Parado` - Pozo detenido temporalmente
  - `Fuera de Servicio` - Pozo descontinuado
- **Ejemplo**: `Activo`
- **Descripción**: Estado operativo del pozo
- **Notas**: Afecta la visualización y disponibilidad

### TIPO
- **Tipo**: Texto (Enumeración)
- **Requerido**: No
- **Valores válidos**:
  - `Extracción` - Pozo de extracción de agua
  - `Inyección` - Pozo de inyección
  - `Monitoreo` - Pozo de monitoreo
  - `Prueba` - Pozo experimental
  - `Observación` - Pozo de observación
- **Ejemplo**: `Extracción`
- **Descripción**: Tipo funcional del pozo
- **Notas**: Determina el comportamiento esperado

---

## Campos de Descripción

### OBSERVACIONES
- **Tipo**: Texto (String)
- **Requerido**: No
- **Longitud**: 0-500 caracteres
- **Ejemplo**: `Funcionando correctamente`, `Requiere mantenimiento`
- **Descripción**: Notas adicionales sobre el pozo
- **Notas**: Puede contener cualquier información relevante

### DESCRIPCION
- **Tipo**: Texto (String)
- **Requerido**: No
- **Longitud**: 0-1000 caracteres
- **Ejemplo**: `Pozo principal de extracción para riego agrícola`
- **Descripción**: Descripción detallada del pozo
- **Notas**: Más extenso que observaciones

### HISTORIAL
- **Tipo**: Texto (String)
- **Requerido**: No
- **Longitud**: 0-2000 caracteres
- **Ejemplo**: `Instalado en 2020. Mantenimiento en 2023.`
- **Descripción**: Historial de eventos del pozo
- **Notas**: Registro cronológico de cambios importantes

---

## Campos de Fechas

### FECHA_INSTALACION
- **Tipo**: Fecha (YYYY-MM-DD)
- **Requerido**: No
- **Ejemplo**: `2020-01-15`
- **Descripción**: Fecha de instalación del pozo
- **Notas**: Formato ISO 8601

### FECHA_ULTIMO_MANTENIMIENTO
- **Tipo**: Fecha (YYYY-MM-DD)
- **Requerido**: No
- **Ejemplo**: `2023-06-20`
- **Descripción**: Fecha del último mantenimiento
- **Notas**: Se actualiza automáticamente

### FECHA_PROXIMO_MANTENIMIENTO
- **Tipo**: Fecha (YYYY-MM-DD)
- **Requerido**: No
- **Ejemplo**: `2024-06-20`
- **Descripción**: Fecha programada para próximo mantenimiento
- **Notas**: Puede usarse para alertas

---

## Campos de Contacto

### RESPONSABLE
- **Tipo**: Texto (String)
- **Requerido**: No
- **Longitud**: 1-100 caracteres
- **Ejemplo**: `Juan Pérez`, `Equipo de Mantenimiento`
- **Descripción**: Persona responsable del pozo
- **Notas**: Puede ser nombre o departamento

### TELEFONO
- **Tipo**: Texto (String)
- **Requerido**: No
- **Longitud**: 1-20 caracteres
- **Ejemplo**: `+34 912 345 678`, `555-1234`
- **Descripción**: Teléfono de contacto
- **Notas**: Formato flexible

### EMAIL
- **Tipo**: Texto (Email)
- **Requerido**: No
- **Ejemplo**: `contacto@empresa.com`
- **Descripción**: Email de contacto
- **Notas**: Debe ser formato válido de email

---

## Campos de Medios

### FOTOS
- **Tipo**: Array de URLs
- **Requerido**: No
- **Formato**: URLs de imágenes
- **Tipos soportados**: JPG, PNG, WebP
- **Tamaño máximo**: 5MB por imagen
- **Ejemplo**: `["https://..../foto1.jpg", "https://..../foto2.png"]`
- **Descripción**: Galería de fotos del pozo
- **Notas**: Se almacenan como referencias, no como datos binarios

### DOCUMENTOS
- **Tipo**: Array de URLs
- **Requerido**: No
- **Formato**: URLs de documentos
- **Tipos soportados**: PDF, DOC, DOCX, XLS, XLSX
- **Tamaño máximo**: 10MB por documento
- **Ejemplo**: `["https://..../plano.pdf", "https://..../especificaciones.docx"]`
- **Descripción**: Documentos técnicos asociados
- **Notas**: Se almacenan como referencias

---

## Campos de Auditoría

### FECHA_CREACION
- **Tipo**: Fecha-Hora (ISO 8601)
- **Requerido**: Automático
- **Ejemplo**: `2024-01-15T10:30:00Z`
- **Descripción**: Fecha de creación del registro
- **Notas**: Se establece automáticamente

### FECHA_MODIFICACION
- **Tipo**: Fecha-Hora (ISO 8601)
- **Requerido**: Automático
- **Ejemplo**: `2024-01-20T14:45:00Z`
- **Descripción**: Fecha de última modificación
- **Notas**: Se actualiza automáticamente

### USUARIO_CREACION
- **Tipo**: Texto (String)
- **Requerido**: Automático
- **Ejemplo**: `usuario@empresa.com`
- **Descripción**: Usuario que creó el registro
- **Notas**: Se establece automáticamente

### USUARIO_MODIFICACION
- **Tipo**: Texto (String)
- **Requerido**: Automático
- **Ejemplo**: `usuario@empresa.com`
- **Descripción**: Usuario que modificó el registro
- **Notas**: Se actualiza automáticamente

---

## Validaciones Globales

### Reglas de Validación

1. **Campos Requeridos**: ID_POZO, NOMBRE, UBICACION, PROFUNDIDAD, ESTADO
2. **Unicidad**: ID_POZO debe ser único
3. **Tipos de Datos**: Cada campo debe cumplir su tipo especificado
4. **Rangos**: Los números deben estar dentro de sus rangos permitidos
5. **Enumeraciones**: Los campos de enumeración solo aceptan valores predefinidos

### Comportamiento ante Errores

- Campos inválidos se marcan con advertencia
- El sistema no permite guardar con campos requeridos vacíos
- Los datos parcialmente válidos se guardan con indicadores de error
- El usuario recibe mensajes claros sobre qué corregir

---

## Mapeo Excel a Sistema

| Columna Excel | Campo Sistema | Transformación |
|---------------|---------------|-----------------|
| ID_POZO | ID_POZO | Directo |
| NOMBRE | NOMBRE | Directo |
| UBICACION | UBICACION | Directo |
| PROFUNDIDAD | PROFUNDIDAD | Convertir a número |
| ESTADO | ESTADO | Validar contra enumeración |
| TIPO | TIPO | Validar contra enumeración |
| OBSERVACIONES | OBSERVACIONES | Directo |
| (otros) | (ignorados) | Se descartan sin error |

---

## Ejemplos de Uso

### Pozo Completo
```json
{
  "ID_POZO": "PZ1666",
  "NOMBRE": "Pozo Principal",
  "UBICACION": "Sector A",
  "PROFUNDIDAD": 150.5,
  "ESTADO": "Activo",
  "TIPO": "Extracción",
  "OBSERVACIONES": "Funcionando correctamente",
  "CAUDAL": 50.5,
  "PRESION": 2.5,
  "TEMPERATURA": 25.5,
  "RESPONSABLE": "Juan Pérez",
  "FECHA_INSTALACION": "2020-01-15"
}
```

### Pozo Mínimo
```json
{
  "ID_POZO": "PZ1667",
  "NOMBRE": "Pozo Secundario",
  "UBICACION": "Sector B",
  "PROFUNDIDAD": 120.0,
  "ESTADO": "Activo"
}
```

---

**Última actualización**: Enero 2026
**Versión**: 1.0
