# Diseño: Alineación Controlada del Sistema con Excel Definitivo

**Fecha:** 14 de Enero de 2026  
**Versión:** 1.0  
**Estado:** Diseño Aprobado

---

## 1. Visión General

Este diseño especifica cómo implementar la alineación entre Excel y sistema de forma **controlada, explícita y reversible**, sin afectar la funcionalidad actual.

### Principios de Diseño

1. **Separación clara:** Input externo ≠ Dominio interno
2. **Adaptadores explícitos:** Traducción visible y documentada
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
│ PARSER (Traduce columnas → claves internas)             │
│ Lee Excel, aplica mapa, crea objetos Pozo              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ DOMINIO INTERNO (Propiedades TypeScript)                │
│ pozo.materialCono, pozo.longitud, pozo.materialTuberia │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ COMPONENTES UI / PDF / EXPORTACIÓN                      │
│ Acceden a propiedades del dominio, no del Excel         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Componentes Clave

#### A. Mapa Explícito (EXCEL_COLUMN_MAP)

**Ubicación:** `src/lib/constants/excelColumnMap.ts`

```typescript
/**
 * Mapa explícito: Columnas Excel → Propiedades del Dominio
 * 
 * Este mapa es la fuente de verdad para la correspondencia.
 * Cambios futuros del Excel se manejan aquí, no dispersos en el código.
 */
export const EXCEL_COLUMN_MAP = {
  // IDENTIFICACIÓN (6 campos)
  'Id_pozo': 'idPozo',
  'Coordenada X': 'coordenadaX',
  'Coordenada Y': 'coordenadaY',
  'Fecha': 'fecha',
  'Levantó': 'levanto',
  'Estado': 'estado',
  
  // UBICACIÓN (4 campos)
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
  
  // OBSERVACIONES (1 campo)
  'Observaciones': 'observaciones',
  
  // TUBERÍAS (9 campos)
  'Id_tuberia': 'idTuberia',
  'tipo_tuberia': 'tipoTuberia',
  'ø (mm)': 'diametro',
  'Material': 'material',
  'Z': 'cota',
  'Emboquillado': 'emboquillado',
  'Longitud': 'longitud',                 // ✅ CORREGIDO
  
  // SUMIDEROS (8 campos)
  'Id_sumidero': 'idSumidero',
  '#_esquema': 'numeroEsquema',
  'Tipo sumidero': 'tipoSumidero',
  'Material Tubería': 'materialTuberia',  // ✅ CORREGIDO
  'H salida (m)': 'alturaSalida',
  'H llegada (m)': 'alturaLlegada',
} as const;

// Tipo derivado para type-safety
export type ExcelColumnKey = keyof typeof EXCEL_COLUMN_MAP;
export type DomainPropertyKey = typeof EXCEL_COLUMN_MAP[ExcelColumnKey];
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
    tuberias: [],
    sumideros: [],
    fotos: { principal: [], entradas: [], salidas: [], sumideros: [], otras: [] },
    metadata: createMetadata()
  };
  
  // Traducir cada columna Excel a propiedad del dominio
  Object.entries(EXCEL_COLUMN_MAP).forEach(([excelColumn, domainProperty]) => {
    const value = row[excelColumn];
    
    // Asignar valor si existe, o valor seguro por defecto
    pozo[domainProperty] = {
      value: value !== undefined ? value : null,
      source: 'excel',
      confidence: value !== undefined ? 1 : 0
    };
  });
  
  return pozo as Pozo;
}
```

#### C. Validador Actualizado

**Ubicación:** `src/lib/validators/pozoValidator.ts`

**Cambios:**
- Valida propiedades del dominio, no del Excel
- No bloquea, solo advierte
- Claro: cada validación tiene razón de ser

```typescript
export function validarPozo(pozo: Pozo): ValidationResult {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  // Validaciones obligatorias
  if (!pozo.idPozo?.value) {
    errores.push('Id_pozo es obligatorio');
  }
  
  if (!pozo.coordenadaX?.value || !pozo.coordenadaY?.value) {
    errores.push('Coordenadas (X, Y) son obligatorias');
  }
  
  if (!pozo.fecha?.value) {
    errores.push('Fecha es obligatoria');
  }
  
  // Validaciones condicionales
  if (pozo.existeTapa?.value === 'Sí' && !pozo.estadoTapa?.value) {
    advertencias.push('Si existe tapa, estado_tapa debería estar lleno');
  }
  
  if (pozo.existeCilindro?.value === 'Sí' && !pozo.diametroCilindro?.value) {
    advertencias.push('Si existe cilindro, diametro_cilindro debería estar lleno');
  }
  
  return {
    valid: errores.length === 0,
    errores,
    advertencias
  };
}
```

#### D. Componentes Actualizados

**Ubicación:** Componentes que acceden a datos del pozo

**Cambios:**
- Acceden a propiedades del dominio, no del Excel
- Usan adaptadores si necesitan traducción
- Claro: cada acceso es explícito

```typescript
// ❌ ANTES (Acceso directo, frágil)
function PozoViewer({ pozo }: { pozo: Pozo }) {
  return <p>{pozo.identificacion?.idPozo?.value}</p>;
}

// ✅ DESPUÉS (Acceso a dominio, claro)
function PozoViewer({ pozo }: { pozo: Pozo }) {
  return <p>{pozo.idPozo?.value}</p>;
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

### 3.2 Fase 2: Alineación Mínima (Semana en curso)

**Objetivo:** Implementar mapa y actualizar parser

**Acciones:**
1. Crear `excelColumnMap.ts` con mapa explícito
2. Actualizar parser para usar el mapa
3. Actualizar validador para alineación fina
4. Ajustar componentes donde TypeScript detecta inconsistencias reales

**Commits:**
- `feat: add EXCEL_COLUMN_MAP constant`
- `refactor: update parser to use EXCEL_COLUMN_MAP`
- `refactor: update validator for domain properties`
- `refactor: update components to use domain properties`

**Resultado:** Alineación explícita y controlada

### 3.3 Fase 3: Corrección de TypeScript (Semana en curso)

**Objetivo:** Resolver errores reales, no cosméticos

**Estrategia:**
- Resolver errores que revelen inconsistencias reales
- Posponer errores puramente cosméticos
- Prohibido: `any`, casts forzados, non-null assertions

**Resultado:** Reducción real de deuda técnica

### 3.4 Fase 4: Testing Funcional (Semana en curso)

**Objetivo:** Verificar no regresiones

**Pruebas:**
- Cargar Excel corregido → verificar datos
- Visualizar fichas
- Generar PDF
- Exportar / descargar Excel
- Cargar Excel antiguo → verificar degradación controlada

**Resultado:** Confianza en cambios

---

## 4. Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.

### Property 1: Mapeo Consistente

**For any** columna en el Excel definitivo, el parser debe traducirla correctamente a su propiedad del dominio usando `EXCEL_COLUMN_MAP`.

**Validates:** RF-1.1 (Mapeo correcto de columnas)

### Property 2: Defensividad del Parser

**For any** Excel con columnas faltantes, el parser debe asignar valores seguros sin lanzar excepciones.

**Validates:** RF-1.3 (Valores seguros si faltan columnas)

### Property 3: Ignorancia de Columnas Desconocidas

**For any** Excel con columnas desconocidas, el parser debe ignorarlas sin error.

**Validates:** RF-1.4 (Ignorar columnas desconocidas)

### Property 4: Visualización Consistente

**For any** pozo cargado desde Excel, la visualización debe mostrar todos los campos con valores correctos.

**Validates:** RF-2.1 (Visualización correcta)

### Property 5: Generación de PDF Consistente

**For any** pozo cargado desde Excel, el PDF generado debe incluir todos los datos correctamente mapeados.

**Validates:** RF-2.3 (PDF con datos correctos)

### Property 6: Exportación Consistente

**For any** pozo en el sistema, la exportación a Excel debe tener columnas con nombres correctos.

**Validates:** RF-2.4 (Exportación con nombres correctos)

### Property 7: Mapa Explícito y Mantenible

**For any** cambio futuro del Excel, solo debe ser necesario actualizar `EXCEL_COLUMN_MAP`, no refactorizar el sistema.

**Validates:** RF-3.2 (Cambios localizados)

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
- Validador detecta inconsistencias
- Componentes acceden a propiedades correctas

### Integration Tests

**Objetivo:** Verificar flujos completos

**Cobertura:**
- Cargar Excel → Visualizar → Generar PDF
- Cargar Excel antiguo → Degradación controlada
- Editar datos → Persistencia

### Property-Based Tests

**Objetivo:** Verificar propiedades universales

**Cobertura:**
- Para cualquier Excel válido, el parser produce un Pozo válido
- Para cualquier Pozo, la visualización es consistente
- Para cualquier Pozo, el PDF es válido

---

## 7. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|--------|-----------|
| Regresión funcional | Baja | Alto | Testing exhaustivo, referencia funcional |
| Acoplamiento nuevo | Baja | Medio | Revisión de arquitectura, adaptadores explícitos |
| Cambios dispersos | Media | Medio | Mapa centralizado, commits pequeños |
| TypeScript forzado | Media | Bajo | Prohibición de `any`, casts forzados |

---

## 8. Criterios de Aceptación

### Técnicos

- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito y documentado
- ✅ Parser usa el mapa y es defensivo
- ✅ Validador está alineado con dominio
- ✅ Componentes acceden a propiedades correctas
- ✅ No hay `any`, casts forzados o non-null assertions nuevos

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

## 9. Notas de Implementación

### Orden de Implementación

1. Crear `excelColumnMap.ts` (base)
2. Actualizar parser (usa el mapa)
3. Actualizar validador (alineación fina)
4. Actualizar componentes (acceso correcto)
5. Testing (verificar no regresiones)

### Commits Recomendados

```
feat: add EXCEL_COLUMN_MAP constant
refactor: update parser to use EXCEL_COLUMN_MAP
refactor: update validator for domain properties
refactor: update components to use domain properties
test: verify no regressions in Excel loading
test: verify PDF generation consistency
test: verify export consistency
```

### Documentación

- Actualizar README con nueva estructura
- Documentar cambios en CHANGELOG
- Crear guía de mantenimiento del mapa

---

**Documento:** Diseño de Alineación Controlada  
**Versión:** 1.0  
**Estado:** ✅ Aprobado  
**Próximo Paso:** Crear plan de tareas (tasks.md)
