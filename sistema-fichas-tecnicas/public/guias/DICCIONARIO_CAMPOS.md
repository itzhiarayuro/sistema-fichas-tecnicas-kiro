# Diccionario de Campos - Sistema de Fichas Técnicas de Pozos

**Versión:** 1.0  
**Última actualización:** 2024  
**Requisitos:** 5.1-5.5

## Introducción

Este documento describe todos los campos disponibles en el Sistema de Fichas Técnicas de Pozos. Cada campo está clasificado por:

- **🔴 Obligatorio**: Campo que debe completarse siempre
- **🟠 Importante**: Campo recomendado para completar
- **🟢 Opcional**: Campo que puede dejarse en blanco

### Nota Importante sobre Coordenadas

**Las coordenadas (X, Y) son OPCIONALES en el sistema.** Aunque aparecen como campos en la ficha, no es obligatorio completarlas. El sistema funcionará correctamente sin coordenadas geográficas. Si deseas agregar coordenadas, deben estar en formato decimal (ej: -74.123456 para longitud, 4.678901 para latitud).

## Sección 1: Identificación del Pozo

Información básica de identificación del pozo de inspección.

### 1.1 ID del Pozo 🔴 Obligatorio

**Campo:** `idPozo`  
**Tipo:** Texto  
**Longitud máxima:** 20 caracteres  
**Ejemplos válidos:** `PZ1666`, `M680`, `P-001`, `POZO-2024-001`  
**Reglas de validación:**
- No puede estar vacío
- Debe ser único dentro del proyecto
- Puede contener letras, números y guiones

**Descripción:** Identificador único que distingue este pozo de todos los demás en el proyecto. Se utiliza para asociar tuberías, sumideros y fotografías.

---

### 1.2 Coordenada X (Longitud) 🟢 Opcional

**Campo:** `coordenadaX`  
**Tipo:** Número decimal  
**Formato:** Longitud geográfica (ej: -74.123456)  
**Rango válido:** -180 a 180  
**Ejemplos válidos:** `-74.0721`, `-74.123456`, `-73.9`  
**Reglas de validación:**
- Debe ser un número decimal válido
- Debe estar entre -180 y 180
- Si se proporciona, coordenadaY también debe proporcionarse

**Descripción:** Coordenada de longitud geográfica del pozo. Utilizada para ubicación en mapas. **No es obligatoria.**

---

### 1.3 Coordenada Y (Latitud) 🟢 Opcional

**Campo:** `coordenadaY`  
**Tipo:** Número decimal  
**Formato:** Latitud geográfica (ej: 4.678901)  
**Rango válido:** -90 a 90  
**Ejemplos válidos:** `4.6789`, `4.678901`, `5.2`  
**Reglas de validación:**
- Debe ser un número decimal válido
- Debe estar entre -90 y 90
- Si se proporciona, coordenadaX también debe proporcionarse

**Descripción:** Coordenada de latitud geográfica del pozo. Utilizada para ubicación en mapas. **No es obligatoria.**

---

### 1.4 Fecha de Inspección 🔴 Obligatorio

**Campo:** `fecha`  
**Tipo:** Fecha  
**Formato:** YYYY-MM-DD (ej: 2024-01-15)  
**Ejemplos válidos:** `2024-01-15`, `2023-12-31`, `2024-06-01`  
**Reglas de validación:**
- Debe estar en formato YYYY-MM-DD
- No puede ser una fecha futura
- No puede estar vacío

**Descripción:** Fecha en la que se realizó la inspección del pozo. Importante para auditoría y seguimiento.

---

### 1.5 Inspector (Levantó) 🔴 Obligatorio

**Campo:** `levanto`  
**Tipo:** Texto  
**Longitud máxima:** 100 caracteres  
**Ejemplos válidos:** `Juan Pérez`, `María García López`, `Técnico 001`  
**Reglas de validación:**
- No puede estar vacío
- Debe contener al menos un carácter

**Descripción:** Nombre del inspector o técnico que realizó el levantamiento de información del pozo.

---

### 1.6 Estado General 🔴 Obligatorio

**Campo:** `estado`  
**Tipo:** Selección (Enum)  
**Valores permitidos:**
- `Bueno` - El pozo está en buen estado
- `Regular` - El pozo tiene algunos problemas menores
- `Malo` - El pozo tiene problemas significativos
- `Muy Malo` - El pozo está en mal estado y requiere intervención urgente
- `No Aplica` - No aplica evaluación de estado

**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`  
**Reglas de validación:**
- Debe ser uno de los valores permitidos
- No puede estar vacío

**Descripción:** Evaluación general del estado del pozo basada en la inspección visual.



## Sección 2: Ubicación del Pozo

Información sobre la localización física del pozo.

### 2.1 Dirección 🟠 Importante

**Campo:** `direccion`  
**Tipo:** Texto  
**Longitud máxima:** 200 caracteres  
**Ejemplos válidos:** `Calle 5 #123-45`, `Carrera 10 entre calles 20 y 21`, `Avenida Principal 500`  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Máximo 200 caracteres

**Descripción:** Dirección física donde se ubica el pozo. Facilita la localización en campo.

---

### 2.2 Barrio 🟠 Importante

**Campo:** `barrio`  
**Tipo:** Texto  
**Longitud máxima:** 100 caracteres  
**Ejemplos válidos:** `Centro`, `Zona Industrial`, `Barrio Nuevo`  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Máximo 100 caracteres

**Descripción:** Nombre del barrio o sector donde se ubica el pozo.

---

### 2.3 Elevación 🟠 Importante

**Campo:** `elevacion`  
**Tipo:** Número decimal  
**Unidad:** Metros sobre nivel del mar (m)  
**Ejemplos válidos:** `2600.5`, `1200`, `3000.25`  
**Reglas de validación:**
- Debe ser un número decimal válido
- Puede estar vacío (opcional)

**Descripción:** Elevación o altura del pozo sobre el nivel del mar. Importante para análisis de drenaje.

---

### 2.4 Profundidad 🟠 Importante

**Campo:** `profundidad`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `2.5`, `3.0`, `1.8`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Debe ser un número decimal válido
- Si se proporciona, debe ser mayor a 0
- Puede estar vacío (opcional)

**Descripción:** Profundidad total del pozo desde la rasante hasta el fondo. Debe ser positiva si se proporciona.



## Sección 3: Componentes del Pozo

Información sobre los componentes estructurales del pozo.

### 3.1 ¿Existe Tapa? 🟠 Importante

**Campo:** `existeTapa`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Ejemplos válidos:** `Sí`, `No`  
**Reglas de validación:**
- Debe ser "Sí" o "No"
- Si es "Sí", el campo `estadoTapa` es obligatorio

**Descripción:** Indica si el pozo tiene tapa de acceso.

---

### 3.2 Estado de la Tapa 🟠 Importante (si existe tapa)

**Campo:** `estadoTapa`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Oxidado`, `Roto`, `Faltante`  
**Reglas de validación:**
- Obligatorio si `existeTapa = Sí`
- Puede estar vacío si `existeTapa = No`

**Descripción:** Estado de conservación de la tapa del pozo.

---

### 3.3 ¿Existe Cilindro? 🟠 Importante

**Campo:** `existeCilindro`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Reglas de validación:**
- Debe ser "Sí" o "No"
- Si es "Sí", el campo `diametroCilindro` es obligatorio

**Descripción:** Indica si el pozo tiene cilindro (cuerpo principal).

---

### 3.4 Diámetro del Cilindro 🟠 Importante (si existe cilindro)

**Campo:** `diametroCilindro`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `1.2`, `1.5`, `2.0`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Obligatorio si `existeCilindro = Sí`
- Debe ser mayor a 0
- Puede estar vacío si `existeCilindro = No`

**Descripción:** Diámetro interno del cilindro del pozo.

---

### 3.5 Sistema 🟢 Opcional

**Campo:** `sistema`  
**Tipo:** Texto  
**Ejemplos válidos:** `Alcantarillado Combinado`, `Alcantarillado Sanitario`, `Drenaje Pluvial`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Sistema de alcantarillado al que pertenece el pozo.

---

### 3.6 Año de Instalación 🟢 Opcional

**Campo:** `anoInstalacion`  
**Tipo:** Número (año)  
**Ejemplos válidos:** `2020`, `1995`, `2024`  
**Reglas de validación:**
- Debe ser un año válido
- Puede estar vacío (opcional)

**Descripción:** Año en que se instaló el pozo.

---

### 3.7 Tipo de Cámara 🟢 Opcional

**Campo:** `tipoCamara`  
**Tipo:** Selección  
**Valores permitidos:** `Circular`, `Rectangular`, `Cuadrada`  
**Reglas de validación:**
- Debe ser uno de los valores permitidos o estar vacío

**Descripción:** Forma geométrica de la cámara del pozo.

---

### 3.8 Material de la Tapa 🟢 Opcional

**Campo:** `materialTapa`  
**Tipo:** Texto  
**Ejemplos válidos:** `Hierro Fundido`, `Concreto`, `Acero`, `Plástico`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material del que está hecha la tapa.

---

### 3.9 ¿Existe Cono? 🟢 Opcional

**Campo:** `existeCono`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Reglas de validación:**
- Debe ser "Sí" o "No" o estar vacío

**Descripción:** Indica si el pozo tiene cono de acceso.

---

### 3.10 Tipo de Cono 🟢 Opcional

**Campo:** `tipoCono`  
**Tipo:** Texto  
**Ejemplos válidos:** `Cónico`, `Troncocónico`, `Cilíndrico`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Tipo de cono si existe.

---

### 3.11 Material del Cono 🟢 Opcional

**Campo:** `materialCono`  
**Tipo:** Texto  
**Ejemplos válidos:** `Concreto`, `Hierro`, `Ladrillo`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material del cono.

---

### 3.12 Estado del Cono 🟢 Opcional

**Campo:** `estadoCono`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Estado de conservación del cono.

---

### 3.13 Material del Cilindro 🟢 Opcional

**Campo:** `materialCilindro`  
**Tipo:** Texto  
**Ejemplos válidos:** `Concreto`, `Hierro Fundido`, `Ladrillo`, `Mixto`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material del cilindro.

---

### 3.14 Estado del Cilindro 🟢 Opcional

**Campo:** `estadoCilindro`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`, `Muy Malo`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Estado de conservación del cilindro.

---

### 3.15 ¿Existe Cañuela? 🟢 Opcional

**Campo:** `existeCanuela`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Reglas de validación:**
- Debe ser "Sí" o "No" o estar vacío

**Descripción:** Indica si el pozo tiene cañuela (conducto de transición).

---

### 3.16 Material de la Cañuela 🟢 Opcional

**Campo:** `materialCanuela`  
**Tipo:** Texto  
**Ejemplos válidos:** `Concreto`, `Hierro`, `PVC`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material de la cañuela.

---

### 3.17 Estado de la Cañuela 🟢 Opcional

**Campo:** `estadoCanuela`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Estado de conservación de la cañuela.

---

### 3.18 ¿Existen Peldaños? 🟢 Opcional

**Campo:** `existePeldanos`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Reglas de validación:**
- Debe ser "Sí" o "No" o estar vacío
- Si es "Sí", el campo `numeroPeldanos` es obligatorio

**Descripción:** Indica si el pozo tiene peldaños para acceso.

---

### 3.19 Material de los Peldaños 🟢 Opcional

**Campo:** `materialPeldanos`  
**Tipo:** Texto  
**Ejemplos válidos:** `Hierro`, `Acero`, `Concreto`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material de los peldaños.

---

### 3.20 Número de Peldaños 🟢 Opcional

**Campo:** `numeroPeldanos`  
**Tipo:** Número entero  
**Ejemplos válidos:** `5`, `10`, `15`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Obligatorio si `existePeldanos = Sí`
- Debe ser mayor a 0
- Puede estar vacío si `existePeldanos = No`

**Descripción:** Cantidad de peldaños en el pozo.

---

### 3.21 Estado de los Peldaños 🟢 Opcional

**Campo:** `estadoPeldanos`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`, `Faltantes`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Estado de conservación de los peldaños.

---

### 3.22 Estructura del Pavimento 🟢 Opcional

**Campo:** `estructuraPavimento`  
**Tipo:** Texto  
**Ejemplos válidos:** `Asfalto`, `Concreto`, `Adoquín`, `Tierra`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Tipo de pavimento superficial alrededor del pozo.



## Sección 4: Observaciones

### 4.1 Observaciones 🟢 Opcional

**Campo:** `observaciones`  
**Tipo:** Texto multilínea  
**Longitud máxima:** 1000 caracteres  
**Ejemplos válidos:**
- `Pozo en buen estado, requiere limpieza anual`
- `Tapa oxidada, reemplazar en próxima intervención`
- `Acceso difícil, requiere equipo especial`

**Reglas de validación:**
- Puede estar vacío (opcional)
- Máximo 1000 caracteres

**Descripción:** Observaciones adicionales sobre el pozo que no encajan en otros campos.

---

## Sección 5: Tuberías

Las tuberías conectan el pozo con otros pozos o sistemas. Cada tubería tiene 9 campos.

### 5.1 ID de la Tubería 🔴 Obligatorio

**Campo:** `idTuberia`  
**Tipo:** Texto  
**Ejemplos válidos:** `TUB-001`, `E1-PZ1666`, `S-PZ1666`  
**Reglas de validación:**
- No puede estar vacío
- Debe ser único

**Descripción:** Identificador único de la tubería.

---

### 5.2 ID del Pozo 🔴 Obligatorio

**Campo:** `idPozo`  
**Tipo:** Texto  
**Ejemplos válidos:** `PZ1666`, `M680`  
**Reglas de validación:**
- No puede estar vacío
- Debe existir un pozo con este ID

**Descripción:** Identificador del pozo al que conecta esta tubería.

---

### 5.3 Tipo de Tubería 🔴 Obligatorio

**Campo:** `tipoTuberia`  
**Tipo:** Selección  
**Valores permitidos:** `entrada`, `salida`  
**Reglas de validación:**
- Debe ser "entrada" o "salida"

**Descripción:** Indica si es una tubería de entrada o salida del pozo.

---

### 5.4 Diámetro 🔴 Obligatorio

**Campo:** `diametro`  
**Tipo:** Número entero  
**Unidad:** Milímetros (mm)  
**Ejemplos válidos:** `100`, `150`, `200`, `300`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Debe ser mayor a 0
- No puede estar vacío

**Descripción:** Diámetro interno de la tubería en milímetros.

---

### 5.5 Material 🔴 Obligatorio

**Campo:** `material`  
**Tipo:** Selección  
**Valores permitidos:** `PVC`, `GRES`, `Concreto`, `Hierro Fundido`, `Polietileno`  
**Reglas de validación:**
- Debe ser uno de los valores permitidos

**Descripción:** Material de la tubería.

---

### 5.6 Cota (Profundidad) 🟠 Importante

**Campo:** `cota`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `2.5`, `3.0`, `1.8`  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Debe ser un número decimal válido

**Descripción:** Profundidad o cota de la tubería.

---

### 5.7 Estado 🟠 Importante

**Campo:** `estado`  
**Tipo:** Texto  
**Ejemplos válidos:** `Bueno`, `Regular`, `Malo`, `Obstruida`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Estado de conservación de la tubería.

---

### 5.8 ¿Tiene Emboquillado? 🟢 Opcional

**Campo:** `emboquillado`  
**Tipo:** Selección  
**Valores permitidos:** `Sí`, `No`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Indica si la tubería tiene emboquillado (sellado en la conexión).

---

### 5.9 Longitud 🟢 Opcional

**Campo:** `longitud`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `10.5`, `25.0`, `5.2`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Si se proporciona, debe ser mayor a 0

**Descripción:** Longitud de la tubería.

---

## Sección 6: Sumideros

Los sumideros son conexiones laterales al pozo. Cada sumidero tiene 8 campos.

### 6.1 ID del Sumidero 🔴 Obligatorio

**Campo:** `idSumidero`  
**Tipo:** Texto  
**Ejemplos válidos:** `SUM-001`, `S1667-1`, `SUMIDERO-PZ1666`  
**Reglas de validación:**
- No puede estar vacío
- Debe ser único

**Descripción:** Identificador único del sumidero.

---

### 6.2 ID del Pozo 🔴 Obligatorio

**Campo:** `idPozo`  
**Tipo:** Texto  
**Ejemplos válidos:** `PZ1666`, `M680`  
**Reglas de validación:**
- No puede estar vacío
- Debe existir un pozo con este ID

**Descripción:** Identificador del pozo al que conecta este sumidero.

---

### 6.3 Tipo de Sumidero 🟠 Importante

**Campo:** `tipoSumidero`  
**Tipo:** Selección  
**Valores permitidos:** `Rejilla`, `Buzón`, `Combinado`, `Lateral`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Tipo de sumidero.

---

### 6.4 Número en Esquema 🟢 Opcional

**Campo:** `numeroEsquema`  
**Tipo:** Texto  
**Ejemplos válidos:** `1`, `2`, `A`, `B1`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Número o identificador del sumidero en el esquema/plano.

---

### 6.5 Diámetro 🟢 Opcional

**Campo:** `diametro`  
**Tipo:** Número entero  
**Unidad:** Milímetros (mm)  
**Ejemplos válidos:** `100`, `150`, `200`  
**Rango válido:** Mayor a 0  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Si se proporciona, debe ser mayor a 0

**Descripción:** Diámetro de la tubería del sumidero.

---

### 6.6 Material de la Tubería 🟢 Opcional

**Campo:** `materialTuberia`  
**Tipo:** Texto  
**Ejemplos válidos:** `PVC`, `GRES`, `Concreto`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Material de la tubería del sumidero.

---

### 6.7 Altura de Salida 🟢 Opcional

**Campo:** `alturaSalida`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `0.5`, `1.0`, `1.5`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Altura de salida del sumidero.

---

### 6.8 Altura de Llegada 🟢 Opcional

**Campo:** `alturaLlegada`  
**Tipo:** Número decimal  
**Unidad:** Metros (m)  
**Ejemplos válidos:** `0.3`, `0.8`, `1.2`  
**Reglas de validación:**
- Puede estar vacío (opcional)

**Descripción:** Altura de llegada del sumidero.

---

## Sección 7: Fotografías

Las fotografías documentan visualmente el estado del pozo. Cada foto tiene 6 campos.

### 7.1 ID de la Foto 🔴 Obligatorio

**Campo:** `idFoto`  
**Tipo:** Texto  
**Ejemplos válidos:** `FOTO-PZ1666-001`, `IMG-001`, `TAPA-PZ1666`  
**Reglas de validación:**
- No puede estar vacío
- Debe ser único

**Descripción:** Identificador único de la fotografía.

---

### 7.2 ID del Pozo 🔴 Obligatorio

**Campo:** `idPozo`  
**Tipo:** Texto  
**Ejemplos válidos:** `PZ1666`, `M680`  
**Reglas de validación:**
- No puede estar vacío
- Debe existir un pozo con este ID

**Descripción:** Identificador del pozo fotografiado.

---

### 7.3 Tipo de Foto 🔴 Obligatorio

**Campo:** `tipoFoto`  
**Tipo:** Selección  
**Valores permitidos:** `tapa`, `interior`, `general`, `entrada`, `salida`, `sumidero`, `medicion`, `otro`  
**Reglas de validación:**
- Debe ser uno de los valores permitidos

**Descripción:** Categoría de la fotografía.

---

### 7.4 Ruta del Archivo 🔴 Obligatorio

**Campo:** `rutaArchivo`  
**Tipo:** Texto  
**Ejemplos válidos:** `/fotos/PZ1666-tapa.jpg`, `fotos/IMG_001.png`  
**Reglas de validación:**
- No puede estar vacío

**Descripción:** Ruta o nombre del archivo de la fotografía.

---

### 7.5 Fecha de Captura 🟠 Importante

**Campo:** `fechaCaptura`  
**Tipo:** Fecha y hora  
**Formato:** YYYY-MM-DD HH:mm:ss  
**Ejemplos válidos:** `2024-01-15 14:30:00`, `2024-06-01 09:15:30`  
**Reglas de validación:**
- Puede estar vacío (opcional)
- Si se proporciona, debe estar en formato válido

**Descripción:** Fecha y hora en que se capturó la fotografía.

---

### 7.6 Descripción 🟢 Opcional

**Campo:** `descripcion`  
**Tipo:** Texto  
**Longitud máxima:** 500 caracteres  
**Ejemplos válidos:**
- `Vista general del pozo desde arriba`
- `Interior del pozo mostrando tuberías`
- `Detalle de la tapa oxidada`

**Reglas de validación:**
- Puede estar vacío (opcional)
- Máximo 500 caracteres

**Descripción:** Descripción adicional de la fotografía.

---

## Guía de Nomenclatura de Fotografías

El sistema reconoce automáticamente el tipo de foto según el nombre del archivo:

### Patrones Reconocidos

- **Panorámica:** `*-P.*` (ej: `M680-P.jpg`)
- **Tapa:** `*-T.*` (ej: `M680-T.jpg`)
- **Interior:** `*-I.*` (ej: `M680-I.jpg`)
- **Acceso:** `*-A.*` (ej: `M680-A.jpg`)
- **Fondo:** `*-F.*` (ej: `M680-F.jpg`)
- **Medición:** `*-M.*` (ej: `M680-M.jpg`)
- **Entrada:** `*-E*-T.*` (ej: `M680-E1-T.jpg`)
- **Salida:** `*-S-T.*` (ej: `M680-S-T.jpg`)
- **Sumidero:** `*-SUM*.*` (ej: `M680-SUM1.jpg`)

Si el nombre no coincide con ningún patrón, puedes asociar la foto manualmente en el editor.

---

## Reglas de Validación General

### Campos Obligatorios vs Opcionales

- **Obligatorios (🔴):** Deben completarse siempre. El sistema no permitirá generar PDF sin estos campos.
- **Importantes (🟠):** Se recomienda completarlos. El sistema funcionará sin ellos, pero mostrará advertencias.
- **Opcionales (🟢):** Pueden dejarse en blanco sin problemas.

### Validaciones Condicionales

Algunos campos son obligatorios solo si otros campos tienen ciertos valores:

- Si `existeTapa = Sí` → `estadoTapa` es obligatorio
- Si `existeCilindro = Sí` → `diametroCilindro` es obligatorio y debe ser > 0
- Si `existePeldanos = Sí` → `numeroPeldanos` es obligatorio y debe ser > 0

### Validaciones de Formato

- **Números:** Deben ser válidos. Decimales usan punto (.) como separador
- **Fechas:** Formato YYYY-MM-DD (ej: 2024-01-15)
- **Coordenadas:** Números decimales en rango válido
- **Texto:** Sin restricciones especiales, máximo de caracteres según campo

### Recuperación de Errores

Si un campo tiene un error de validación:
1. El sistema lo marcará visualmente
2. Mostrará un mensaje explicativo
3. Permitirá continuar trabajando (no bloquea)
4. Podrás corregir el error en cualquier momento

---

## Preguntas Frecuentes

**P: ¿Puedo dejar campos en blanco?**  
R: Sí, todos los campos marcados como 🟢 Opcional pueden dejarse en blanco. Los campos 🔴 Obligatorios deben completarse.

**P: ¿Las coordenadas son obligatorias?**  
R: No, las coordenadas (X, Y) son completamente opcionales. El sistema funcionará perfectamente sin ellas.

**P: ¿Qué pasa si cometo un error?**  
R: El sistema lo detectará y te mostrará un mensaje. Puedes corregirlo en cualquier momento sin perder tu trabajo.

**P: ¿Puedo editar los datos después de cargarlos?**  
R: Sí, puedes editar cualquier campo en el editor visual. El sistema mantiene un registro del valor original.

**P: ¿Cómo sé de dónde vino cada dato?**  
R: Pasa el cursor sobre cualquier campo para ver un tooltip que muestra si vino de Excel, fue editado manualmente, o es un valor por defecto.

