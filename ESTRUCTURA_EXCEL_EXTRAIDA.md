# Estructura del Excel: "informacion fichas 3 modelado de datos.xlsx"

## Información Extraída del Archivo

### Encabezados (Row 1) - Orden Exacto del Excel

```
Columna A:  Dirección
Columna B:  Barrio
Columna C:  Fecha
Columna D:  Levantó
Columna E:  Estado
Columna F:  Sistema
Columna G:  Coordenada X
Columna H:  Coordenada Y
Columna I:  Elevación
Columna J:  Profundidad
Columna K:  Año de instalación
Columna L:  Tipo Cámara
Columna M:  Estructura de pavimento
Columna N:  Existe tapa
Columna O:  Material tapa
Columna P:  Estado tapa
Columna Q:  Existe cono
Columna R:  Tipo Cono
Columna S:  Materia Cono
Columna T:  Estado Cono
Columna U:  Existe Cilindro
Columna V:  Diametro Cilindro (m)
Columna W:  Material Cilindro
Columna X:  Estado Cilindro
Columna Y:  Existe Cañuela
Columna Z:  Material Cañuela
Columna AA: Estado Cañuela
Columna AB: Existe Peldaños
Columna AC: Material Peldaños
Columna AD: Número Peldaños
Columna AE: Estado Peldaños
Columna AF: Observaciones
```

**Total de columnas de POZO:** 33 campos

---

### Datos de Ejemplo (Row 2)

```
Dirección:                  Cl 7 # 10-44
Barrio:                     Centro
Fecha:                      43103 (formato Excel date)
Levantó:                    Michelle
Estado:                     (vacío)
Sistema:                    Sin representación
Coordenada X:               (vacío)
Coordenada Y:               (vacío)
Elevación:                  (vacío)
Profundidad:                (vacío)
Año de instalación:         (vacío)
Tipo Cámara:                Combinado
Estructura de pavimento:    Típica de fondo
Existe tapa:                Si
Material tapa:              Ferroconcreto
Estado tapa:                Bueno
Existe cono:                Concéntrico
Tipo Cono:                  Mampostería
Materia Cono:               (vacío)
Estado Cono:                (vacío)
Existe Cilindro:            Si
Diametro Cilindro (m):      1.20 m
Material Cilindro:          Concreto
Estado Cilindro:            Regular
Existe Cañuela:             No
Material Cañuela:           (vacío)
Estado Cañuela:             (vacío)
Existe Peldaños:            No
Material Peldaños:          (vacío)
Número Peldaños:            (vacío)
Estado Peldaños:            (vacío)
Observaciones:              (vacío)
```

---

### Valores Encontrados en el Excel

#### Estados
- `SI` / `NO` 
- `Bueno` / `Regular` / `Malo`
- `NA`

#### Sistemas
- `Sin representación`
- `Combinado`

#### Tipos de Cámara
- `Combinado`

#### Estructuras de Pavimento
- `Típica de fondo`
- `Pav. Rígido`

#### Materiales
- `Ferroconcreto`
- `Mampostería`
- `Concreto`
- `PVC`
- `Gres`
- `GRES`

#### Tipos de Cono
- `Concéntrico`

---

### Secciones Adicionales Detectadas en el Excel

#### TUBERÍAS (Basado en strings encontrados)
```
Encabezados:
- Id_pozo
- Id_tuberia
- ø (mm)
- Material
- Z
- Emboquillado
- Logitud (sic - debería ser "Longitud")

Valores encontrados:
- PZ1666, PZ1665, PZ1669
- PVC, Gres, GRES
- 0.6924
- SI, NO
```

#### SUMIDEROS (Basado en strings encontrados)
```
Encabezados:
- Id_sumidero
- #_esquema
- Tipo sumidero
- Vía
- Materia Tuberia
- H salida (m)
- H llegada (m)

Valores encontrados:
- S1667-1, S1667-2, S1667-3, S1667-4
```

---

## Análisis de la Estructura

### Características Principales

1. **Estructura Plana para POZO**
   - 33 campos en una sola fila
   - Sin anidamiento
   - Orden específico de columnas

2. **Estructura Separada para TUBERÍAS**
   - Probablemente en otra hoja o sección
   - Campos: Id_pozo, Id_tuberia, diámetro, material, etc.
   - Relación: Muchas tuberías por pozo

3. **Estructura Separada para SUMIDEROS**
   - Probablemente en otra hoja o sección
   - Campos: Id_sumidero, tipo, altura, etc.
   - Relación: Muchos sumideros por pozo

---

## Comparación con Sistema Actual

### Sistema Actual (Jerárquico)
```typescript
interface Pozo {
  identificacion: {
    idPozo: FieldValue;
    coordenadaX: FieldValue;
    coordenadaY: FieldValue;
    fecha: FieldValue;
    levanto: FieldValue;
    estado: FieldValue;
  };
  ubicacion: {
    direccion: FieldValue;
    barrio: FieldValue;
    elevacion: FieldValue;
    profundidad: FieldValue;
  };
  componentes: {
    existeTapa: FieldValue;
    estadoTapa: FieldValue;
    // ... más campos
  };
  // ... más secciones
}
```

### Excel (Plano)
```
Dirección | Barrio | Fecha | Levantó | Estado | Sistema | Coordenada X | ... | Observaciones
```

### Desalineación
- ❌ Sistema agrupa campos en categorías
- ❌ Excel tiene todos los campos en una fila
- ❌ Nombres de campos no coinciden exactamente
- ❌ Orden de campos es diferente

---

## Nombres de Campos: Comparación

| Excel | Sistema Actual | Debería Ser |
|-------|---|---|
| Dirección | ubicacion.direccion | direccion |
| Barrio | ubicacion.barrio | barrio |
| Fecha | identificacion.fecha | fecha |
| Levantó | identificacion.levanto | levanto |
| Estado | identificacion.estado | estado |
| Sistema | componentes.sistema | sistema |
| Coordenada X | identificacion.coordenadaX | coordenadaX |
| Coordenada Y | identificacion.coordenadaY | coordenadaY |
| Elevación | ubicacion.elevacion | elevacion |
| Profundidad | ubicacion.profundidad | profundidad |
| Año de instalación | componentes.anoInstalacion | anoInstalacion |
| Tipo Cámara | componentes.tipoCamara | tipoCamara |
| Estructura de pavimento | componentes.estructuraPavimento | estructuraPavimento |
| Existe tapa | componentes.existeTapa | existeTapa |
| Material tapa | componentes.materialTapa | materialTapa |
| Estado tapa | componentes.estadoTapa | estadoTapa |
| ... | ... | ... |

---

## Recomendaciones

### 1. Alinear Estructura de Tipos
- Cambiar de estructura jerárquica a plana
- Reflejar exactamente el orden del Excel
- Usar nombres de campos idénticos al Excel

### 2. Normalizar Nombres
- Excel: "Levantó" → Sistema: "levanto" ✅ (ya normalizado)
- Excel: "Coordenada X" → Sistema: "coordenadaX" ✅ (ya normalizado)
- Excel: "Diametro Cilindro (m)" → Sistema: "diametroCilindro" ✅ (ya normalizado)

### 3. Mantener Orden de Campos
- Respetar el orden del Excel en la estructura de tipos
- Facilita mapping directo durante parsing

### 4. Documentar Relaciones
- POZO tiene muchas TUBERÍAS (1:N)
- POZO tiene muchos SUMIDEROS (1:N)
- POZO tiene muchas FOTOS (1:N)

---

## Conclusión

El Excel tiene una estructura **claramente plana** para POZO con 33 campos. El sistema actual tiene una estructura **jerárquica** que no coincide. 

**Recomendación:** Alinear el sistema para que refleje exactamente la estructura del Excel.

---

**Documento creado:** 14 de Enero de 2026  
**Fuente:** Extracción de "informacion fichas 3 modelado de datos.xlsx"  
**Estado:** Análisis Completo
