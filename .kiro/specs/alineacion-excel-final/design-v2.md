# Diseño: Alineación Excel sin Tocar Estructura Interna (v2.0)

**Fecha:** 14 de Enero de 2026  
**Versión:** 2.0 (Revisado - Enfoque Correcto)  
**Estado:** ✅ Diseño Aprobado

---

## 1. Visión General

Este diseño especifica cómo alinear el Excel con el sistema **manteniendo la estructura jerárquica intacta** e introduciendo una flat layer en paralelo.

### Principios de Diseño

1. **Estructura jerárquica es autoridad:** Hasta que parity sea probada
2. **Flat layer es aditivo:** Aliases derivados, no almacenamiento independiente
3. **Cambios mínimos:** Solo lo necesario, nada más
4. **Reversibilidad:** Cada cambio es auditado
5. **Defensividad:** El parser maneja casos edge sin fallar

---

## 2. Arquitectura de Solución

### 2.1 Capas de Transformación

```
┌─────────────────────────────────────────────────────────┐
│ EXCEL DEFINITIVO (Input Externo)                        │
│ Columnas: "Material Cono", "Longitud", "Material Tubería" │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ MAPA EXPLÍCITO (EXCEL_COLUMN_MAP)                       │
│ "Material Cono" → "materialCono"                        │
│ "Longitud" → "longitud"                                 │
│ "Material Tubería" → "materialTuberia"                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ PARSER (Traduce columnas → flat fields)                 │
│ Lee Excel, aplica mapa, crea flat fields               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ FLAT LAYER (Aliases Derivados)                          │
│ pozo.idPozo → alias de pozo.identificacion.idPozo      │
│ pozo.direccion → alias de pozo.ubicacion.direccion     │
│ (NO almacenamiento independiente)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ ESTRUCTURA JERÁRQUICA (Autoridad)                       │
│ pozo.identificacion.idPozo                              │
│ pozo.ubicacion.direccion                                │
│ pozo.componentes.estadoTapa                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ COMPONENTES UI / PDF / EXPORTACIÓN                      │
│ Pueden acceder a través de flat layer o jerárquico     │
│ (Ambas rutas producen el mismo resultado)              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Componentes Clave

#### A. Mapa Explícito (EXCEL_COLUMN_MAP)

**Ubicación:** `src/lib/constants/excelColumnMap.ts`

```typescript
export const EXCEL_COLUMN_MAP = {
  // IDENTIFICACIÓN
  'Id_pozo': 'idPozo',
  'Coordenada X': 'coordenadaX',
  'Coordenada Y': 'coordenadaY',
  'Fecha': 'fecha',
  'Levantó': 'levanto',
  'Estado': 'estado',
  
  // UBICACIÓN
  'Dirección': 'direccion',
  'Barrio': 'barrio',
  'Elevación': 'elevacion',
  'Profundidad': 'profundidad',
  
  // COMPONENTES (23 campos)
  'Sistema': 'sistema',
  'Año de instalación': 'anoInstalacion',
  'Tipo Cámara': 'tipoCamara',
  'Estructura de pavimento': 'estructuraPavimento',
  'Existe tapa': 'existeTapa',
  'Material tapa': 'materialTapa',
  'Estado tapa': 'estadoTapa',
  'Existe cono': 'existeCono',
  'Tipo Cono': 'tipoCono',
  'Material Cono': 'materialCono',        // ✅ CORREGIDO
  'Estado Cono': 'estadoCono',
  'Existe Cilindro': 'existeCilindro',
  'Diametro Cilindro (m)': 'diametroCilindro',
  'Material Cilindro': 'materialCilindro',
  'Estado Cilindro': 'estadoCilindro',
  'Existe Cañuela': 'existeCanuela',
  'Material Cañuela': 'materialCanuela',
  'Estado Cañuela': 'estadoCanuela',
  'Existe Peldaños': 'existePeldanos',
  'Material Peldaños': 'materialPeldanos',
  'Número Peldaños': 'numeroPeldanos',
  'Estado Peldaños': 'estadoPeldanos',
  
  // OBSERVACIONES
  'Observaciones': 'observaciones',
  
  // TUBERÍAS
  'Id_tuberia': 'idTuberia',
  'tipo_tuberia': 'tipoTuberia',
  'ø (mm)': 'diametro',
  'Material': 'material',
  'Z': 'cota',
  'Emboquillado': 'emboquillado',
  'Longitud': 'longitud',                 // ✅ CORREGIDO
  
  // SUMIDEROS
  'Id_sumidero': 'idSumidero',
  '#_esquema': 'numeroEsquema',
  'Tipo sumidero': 'tipoSumidero',
  'Material Tubería': 'materialTuberia',  // ✅ CORREGIDO
  'H salida (m)': 'alturaSalida',
  'H llegada (m)': 'alturaLlegada',
} as const;
```

#### B. Parser Actualizado

**Ubicación:** `src/lib/parsers/excelParser.ts`

**Cambios:**
- Usa `EXCEL_COLUMN_MAP` para traducir columnas
- Defensivo: ignora columnas desconocidas
- Seguro: asigna valores por defecto si faltan columnas
- Claro: cada paso es explícito

```typescript
import { EXCEL_COLUMN_MAP } from '../constants/excelColumnMap';

export function parsePozo(row: any): Pozo {
  const pozo: any = {
    id: generateId(),
    identificacion: {},
    ubicacion: {},
    componentes: {},
    observaciones: {},
    tuberias: [],
    sumideros: [],
    fotos: [],
    metadata: createMetadata()
  };
  
  // Traducir cada columna Excel a flat field
  Object.entries(EXCEL_COLUMN_MAP).forEach(([excelColumn, flatField]) => {
    const value = row[excelColumn];
    
    // Asignar a estructura jerárquica
    assignToHierarchical(pozo, flatField, value);
  });
  
  return pozo as Pozo;
}

// Helper para asignar a estructura jerárquica
function assignToHierarchical(pozo: any, flatField: string, value: any) {
  const fieldValue = {
    value: value !== undefined ? value : null,
    source: 'excel',
    confidence: value !== undefined ? 1 : 0
  };
  
  // Mapear flat field a estructura jerárquica
  const mapping: Record<string, [string, string]> = {
    // Identificación
    'idPozo': ['identificacion', 'idPozo'],
    'coordenadaX': ['identificacion', 'coordenadaX'],
    'coordenadaY': ['identificacion', 'coordenadaY'],
    'fecha': ['identificacion', 'fecha'],
    'levanto': ['identificacion', 'levanto'],
    'estado': ['identificacion', 'estado'],
    
    // Ubicación
    'direccion': ['ubicacion', 'direccion'],
    'barrio': ['ubicacion', 'barrio'],
    'elevacion': ['ubicacion', 'elevacion'],
    'profundidad': ['ubicacion', 'profundidad'],
    
    // Componentes (23 campos)
    'existeTapa': ['componentes', 'existeTapa'],
    'estadoTapa': ['componentes', 'estadoTapa'],
    // ... más campos
    
    // Observaciones
    'observaciones': ['observaciones', 'observaciones'],
  };
  
  const [section, field] = mapping[flatField] || [null, null];
  if (section && field) {
    pozo[section][field] = fieldValue;
  }
}
```

#### C. Flat Layer (Aliases Derivados)

**Ubicación:** Extender `Pozo` interface con getters

```typescript
// En src/types/pozo.ts
export interface Pozo {
  // Estructura jerárquica (autoridad)
  identificacion: IdentificacionPozo;
  ubicacion: UbicacionPozo;
  componentes: ComponentesPozo;
  observaciones: ObservacionesPozo;
  
  // Flat layer (aliases derivados - NO almacenamiento independiente)
  // Estos son getters que apuntan a la estructura jerárquica
  get idPozo(): FieldValue { return this.identificacion.idPozo; }
  get direccion(): FieldValue { return this.ubicacion.direccion; }
  get estadoTapa(): FieldValue { return this.componentes.estadoTapa; }
  // ... más aliases
}
```

#### D. Validador Actualizado

**Ubicación:** `src/lib/validators/pozoValidator.ts`

**Cambios:**
- Valida estructura jerárquica (autoridad)
- No bloquea, solo advierte
- Claro: cada validación tiene razón de ser

```typescript
export function validarPozo(pozo: Pozo): ValidationResult {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  // Validaciones obligatorias (usando estructura jerárquica)
  if (!pozo.identificacion?.idPozo?.value) {
    errores.push('Id_pozo es obligatorio');
  }
  
  if (!pozo.identificacion?.coordenadaX?.value || !pozo.identificacion?.coordenadaY?.value) {
    errores.push('Coordenadas (X, Y) son obligatorias');
  }
  
  // Validaciones condicionales
  if (pozo.componentes?.existeTapa?.value === 'Sí' && !pozo.componentes?.estadoTapa?.value) {
    advertencias.push('Si existe tapa, estado_tapa debería estar lleno');
  }
  
  return {
    valid: errores.length === 0,
    errores,
    advertencias
  };
}
```

---

## 3. Estrategia de Implementación

### 3.1 Fase 1: Preparación (Día 1)

**Objetivo:** Establecer punto de partida estable

**Acciones:**
1. Crear rama: `feature/alineacion-excel-final`
2. Hacer backup del código actual
3. Documentar baseline funcional:
   - Cargar Excel actual
   - Visualizar datos
   - Generar PDF
   - Guardar resultado como referencia

**Resultado:** Punto de partida documentado y reversible

### 3.2 Fase 2: Introducir Flat Layer (Aditivo)

**Objetivo:** Agregar flat layer sin cambiar nada

**Acciones:**
1. Extender `Pozo` interface con getters (flat aliases)
2. Flat fields son derivados, no almacenamiento independiente
3. Cero cambios en componentes
4. Cero cambios en validadores

**Resultado:** Flat layer disponible, estructura jerárquica intacta

### 3.3 Fase 3: Excel Parser Alignment

**Objetivo:** Mapear Excel → flat fields → jerárquico

**Acciones:**
1. Crear `EXCEL_COLUMN_MAP`
2. Actualizar parser para usar el mapa
3. Parser mapea Excel → flat fields
4. Flat fields hidratan estructura jerárquica

**Resultado:** Excel se carga correctamente

### 3.4 Fase 4: Parity Verification

**Objetivo:** Verificar que ambas rutas producen el mismo resultado

**Acciones:**
1. Generar PDF usando acceso jerárquico
2. Generar PDF usando acceso plano (a través de flat layer)
3. Comparar PDFs lado a lado
4. Verificar persistencia con ambas rutas

**Resultado:** Parity probada, confianza para migrar

### 3.5 Fase 5: Progressive Migration

**Objetivo:** Migrar componentes uno a uno

**Acciones:**
1. Seleccionar componente (ej: PozoViewer)
2. Cambiar acceso de jerárquico a plano
3. Verificar que funciona igual
4. Commit aislado, rollbackable
5. Repetir para cada componente

**Resultado:** Componentes migrados progresivamente

### 3.6 Fase 6: Removal (Post-MVP)

**Objetivo:** Simplificar después de MVP

**Acciones:**
1. Solo después de MVP mostrado
2. Solo después de sistema estable
3. Solo después de cero regresos observados
4. Entonces: remover estructura jerárquica
5. Simplificar validadores
6. Finalizar flattening

**Resultado:** Sistema simplificado, mantenible

---

## 4. Correctness Properties

### Property 1: Mapeo Consistente

**For any** columna en el Excel definitivo, el parser debe traducirla correctamente a su flat field usando `EXCEL_COLUMN_MAP`.

**Validates:** RF-1.1 (Mapeo correcto de columnas)

### Property 2: Defensividad del Parser

**For any** Excel con columnas faltantes, el parser debe asignar valores seguros sin lanzar excepciones.

**Validates:** RF-1.3 (Valores seguros si faltan columnas)

### Property 3: Equivalencia Jerárquica ↔ Plana

**For any** pozo cargado desde Excel, acceder a través de flat layer debe producir el mismo resultado que acceder a través de estructura jerárquica.

**Validates:** RF-2.1 (Equivalencia de acceso)

### Property 4: Parity de PDF

**For any** pozo, el PDF generado usando acceso jerárquico debe ser idéntico al PDF generado usando acceso plano.

**Validates:** RF-2.2 (PDF idéntico)

### Property 5: Parity de Persistencia

**For any** pozo, el estado persistido usando ambas rutas debe ser idéntico.

**Validates:** RF-2.3 (Persistencia idéntica)

---

## 5. Error Handling

### Estrategia General

- **Defensivo:** El parser no falla, degrada
- **Claro:** Cada error tiene contexto
- **Reversible:** El usuario puede corregir y reintentar

### Casos Edge

| Caso | Comportamiento | Razón |
|------|----------------|-------|
| Columna faltante | Asignar valor seguro (null) | No romper el flujo |
| Columna desconocida | Ignorar silenciosamente | No contaminar el dominio |
| Valor inválido | Asignar como está, advertir en validación | Permitir corrección manual |
| Excel antiguo | Reconocer, advertir, degradar | Compatibilidad hacia atrás |

---

## 6. Testing Strategy

### Unit Tests

**Objetivo:** Verificar comportamiento de componentes individuales

**Cobertura:**
- Parser traduce columnas correctamente
- Flat layer accede a estructura jerárquica correctamente
- Validador detecta inconsistencias

### Integration Tests

**Objetivo:** Verificar flujos completos

**Cobertura:**
- Cargar Excel → Visualizar → Generar PDF (ambas rutas)
- Cargar Excel antiguo → Degradación controlada
- Editar datos → Persistencia (ambas rutas)

### Parity Tests

**Objetivo:** Verificar equivalencia

**Cobertura:**
- PDF generado con ambas rutas es idéntico
- Estado persistido con ambas rutas es idéntico
- Validación con ambas rutas produce mismo resultado

---

## 7. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|--------|-----------|
| Regresión funcional | Baja | Alto | Testing exhaustivo, parity verification |
| Acoplamiento nuevo | Baja | Medio | Revisión de arquitectura, flat layer aditivo |
| Cambios dispersos | Media | Medio | Mapa centralizado, commits pequeños |
| Estructura jerárquica rota | Baja | Alto | Mantener intacta hasta parity probada |

---

## 8. Criterios de Aceptación

### Técnicos

- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito y documentado
- ✅ Parser usa el mapa y es defensivo
- ✅ Flat layer es aditivo (no almacenamiento independiente)
- ✅ Estructura jerárquica intacta
- ✅ Parity verificada (PDF, persistencia, validación)

### Funcionales

- ✅ Sistema carga Excel definitivo correctamente
- ✅ Visualización es consistente
- ✅ PDF es válido
- ✅ Exportación tiene nombres correctos
- ✅ Excel antiguo se degrada controladamente

### De Calidad

- ✅ Errores de TypeScript se reducen
- ✅ Código es más coherente
- ✅ Cambios son claros y documentados
- ✅ Reversibilidad garantizada

---

**Documento:** Diseño de Alineación (v2.0)  
**Versión:** 2.0  
**Estado:** ✅ Aprobado  
**Próximo Paso:** Crear plan de tareas (tasks.md)
