# Plan de Implementación: Alineación Controlada del Sistema con Excel Definitivo

**Fecha:** 14 de Enero de 2026  
**Versión:** 1.0  
**Estado:** Plan Aprobado  
**Tiempo Estimado:** 8-10 horas

---

## Resumen Ejecutivo

Plan de implementación para alinear el sistema con el Excel definitivo de forma controlada, sin afectar funcionalidad actual. Cambios mínimos, incrementales y reversibles.

---

## Fase 1: Preparación (1-2 horas)

### 1.1 Crear rama de trabajo

- [ ] Ejecutar: `git checkout -b feature/alineacion-excel-final`
- [ ] Verificar rama creada: `git branch`
- [ ] Documentar punto de partida en commit inicial

**Notas:**
- Esta rama es el punto de retorno si algo falla
- Todos los cambios van aquí, no en main

### 1.2 Hacer backup del estado actual

- [ ] Crear carpeta: `backups/estado-actual-$(date +%Y%m%d)`
- [ ] Copiar archivos críticos:
  - `src/types/pozo.ts`
  - `src/lib/parsers/excelParser.ts`
  - `src/lib/validators/pozoValidator.ts`
  - Componentes principales que acceden a datos

**Notas:**
- Backup manual, no en Git
- Referencia para revertir si es necesario

### 1.3 Documentar baseline funcional

- [ ] Cargar Excel actual en el sistema
- [ ] Captura de pantalla: visualización de datos
- [ ] Generar PDF y guardar como referencia
- [ ] Exportar Excel y verificar estructura
- [ ] Documentar en `BASELINE_FUNCIONAL.md`:
  - Qué funcionaba
  - Cómo se veía
  - Qué se espera que siga funcionando

**Notas:**
- Este baseline es la referencia para testing
- Cualquier cambio debe mantener este comportamiento

### 1.4 Revisar estructura actual

- [ ] Listar todos los archivos que usan `Pozo`:
  ```bash
  grep -r "interface Pozo" src/
  grep -r "type Pozo" src/
  grep -r ": Pozo" src/ | head -20
  ```
- [ ] Documentar componentes que acceden a propiedades del pozo
- [ ] Identificar parsers y validadores actuales

**Notas:**
- Esto ayuda a entender el alcance de cambios
- Evita sorpresas durante implementación

---

## Fase 2: Alineación Mínima (4-5 horas)

### 2.1 Crear mapa explícito Excel → Dominio

**Archivo:** `src/lib/constants/excelColumnMap.ts`

- [ ] Crear archivo con estructura:
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
- [ ] Agregar tipos derivados para type-safety
- [ ] Documentar el propósito del mapa en comentarios
- [ ] Commit: `feat: add EXCEL_COLUMN_MAP constant`

**Notas:**
- Este mapa es la fuente de verdad
- Cambios futuros del Excel se hacen aquí
- No se dispersan por el código

### 2.2 Actualizar parser de Excel

**Archivo:** `src/lib/parsers/excelParser.ts`

- [ ] Importar `EXCEL_COLUMN_MAP`
- [ ] Refactorizar `parsePozo()` para usar el mapa:
  ```typescript
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
      pozo[domainProperty] = {
        value: value !== undefined ? value : null,
        source: 'excel',
        confidence: value !== undefined ? 1 : 0
      };
    });
    
    return pozo as Pozo;
  }
  ```
- [ ] Verificar que el parser es defensivo (no falla con columnas faltantes)
- [ ] Verificar que ignora columnas desconocidas
- [ ] Commit: `refactor: update parser to use EXCEL_COLUMN_MAP`

**Notas:**
- El parser es defensivo: no lanza excepciones
- Asigna valores seguros si faltan columnas
- Ignora columnas desconocidas

### 2.3 Actualizar validador

**Archivo:** `src/lib/validators/pozoValidator.ts`

- [ ] Revisar validaciones actuales
- [ ] Actualizar para validar propiedades del dominio (no del Excel)
- [ ] Asegurar que valida:
  - Campos obligatorios: `idPozo`, `coordenadaX`, `coordenadaY`, `fecha`, `levanto`, `estado`
  - Validaciones condicionales: si existe tapa → estado tapa debe estar lleno
  - Valores positivos: profundidad, diámetros, número de peldaños
- [ ] Mantener validación no bloqueante (advertencias, no errores)
- [ ] Commit: `refactor: update validator for domain properties`

**Notas:**
- Validador advierte, no bloquea
- Permite corrección manual de datos
- Claro: cada validación tiene razón de ser

### 2.4 Actualizar componentes

**Archivos:** Componentes que acceden a datos del pozo

- [ ] Buscar todos los accesos a propiedades del pozo:
  ```bash
  grep -r "pozo\." src/components/ | grep -v "pozo\.[a-z]*:" | head -30
  ```
- [ ] Para cada acceso, verificar que usa propiedades del dominio (no anidadas)
- [ ] Actualizar si es necesario:
  - ❌ `pozo.identificacion.idPozo` → ✅ `pozo.idPozo`
  - ❌ `pozo.ubicacion.direccion` → ✅ `pozo.direccion`
  - ❌ `pozo.componentes.estadoTapa` → ✅ `pozo.estadoTapa`
- [ ] Verificar que TypeScript no reporta errores en componentes
- [ ] Commit: `refactor: update components to use domain properties`

**Notas:**
- Solo cambios donde TypeScript detecta inconsistencias reales
- No refactorizar UI innecesariamente
- Cambios son mínimos y localizados

### 2.5 Actualizar generador de Excel

**Archivo:** `src/lib/generators/excelGenerator.ts`

- [ ] Verificar que genera columnas con nombres correctos:
  - "Material Cono" (no "Materia Cono")
  - "Longitud" (no "Logitud")
  - "Material Tubería" (no "Materia Tuberia")
- [ ] Usar `EXCEL_COLUMN_MAP` como referencia para nombres
- [ ] Commit: `refactor: update excelGenerator to use correct column names`

**Notas:**
- El generador es el inverso del parser
- Debe producir Excel con estructura correcta

---

## Fase 3: Corrección de TypeScript (1-2 horas)

### 3.1 Ejecutar verificación de tipos

- [ ] Ejecutar: `npx tsc --noEmit`
- [ ] Documentar errores restantes en `TYPESCRIPT_ERRORS_REMAINING.md`
- [ ] Categorizar errores:
  - Errores reales (inconsistencias de lógica)
  - Errores cosméticos (solo TypeScript)

**Notas:**
- Algunos errores pueden ser cosméticos
- Solo corregir errores reales

### 3.2 Corregir errores reales

- [ ] Para cada error real:
  - Entender la causa
  - Corregir de forma limpia (sin `any`, casts forzados)
  - Verificar que la corrección tiene sentido
  - Commit pequeño con explicación

**Regla estricta:**
- ❌ Prohibido: `any`, casts forzados (`as`), non-null assertions (`!`)
- ✅ Permitido: Cambios que reflejan mejora real de consistencia

**Notas:**
- Si un error no se puede corregir limpiamente, se documenta y se pospone
- No se fuerza el sistema para "silenciar" TypeScript

### 3.3 Documentar errores pospuestos

- [ ] Crear `TYPESCRIPT_ERRORS_DEFERRED.md`
- [ ] Listar errores que no se corrigieron
- [ ] Explicar por qué se pospusieron
- [ ] Proponer solución futura si aplica

**Notas:**
- Transparencia: documentar decisiones
- Facilita trabajo futuro

---

## Fase 4: Testing Funcional (2-3 horas)

### 4.1 Testing de carga de Excel

- [ ] Cargar Excel definitivo (con nombres corregidos)
- [ ] Verificar que todos los datos se cargan correctamente
- [ ] Verificar que no hay errores en consola
- [ ] Verificar que la visualización es correcta
- [ ] Documentar resultado en `TEST_RESULTS.md`

**Checklist:**
- ✅ Datos se cargan sin errores
- ✅ Visualización muestra valores correctos
- ✅ No hay errores de TypeScript en runtime
- ✅ Validador no reporta errores críticos

### 4.2 Testing de visualización

- [ ] Abrir ficha de un pozo cargado
- [ ] Verificar que todos los campos se muestran
- [ ] Verificar que los valores son correctos
- [ ] Editar un campo y verificar que se actualiza
- [ ] Guardar cambios y verificar persistencia

**Checklist:**
- ✅ Todos los campos visibles
- ✅ Valores correctos
- ✅ Edición funciona
- ✅ Persistencia funciona

### 4.3 Testing de generación de PDF

- [ ] Generar PDF desde un pozo cargado
- [ ] Verificar que el PDF incluye todos los datos
- [ ] Verificar que los nombres de campos son correctos
- [ ] Verificar que el PDF es válido (se abre correctamente)

**Checklist:**
- ✅ PDF se genera sin errores
- ✅ Incluye todos los datos
- ✅ Nombres de campos son correctos
- ✅ PDF es válido

### 4.4 Testing de exportación a Excel

- [ ] Exportar datos a Excel
- [ ] Verificar que las columnas tienen nombres correctos
- [ ] Verificar que los datos se exportan correctamente
- [ ] Abrir Excel exportado y verificar estructura

**Checklist:**
- ✅ Excel se genera sin errores
- ✅ Columnas tienen nombres correctos
- ✅ Datos se exportan correctamente
- ✅ Estructura es válida

### 4.5 Testing de compatibilidad hacia atrás

- [ ] Cargar Excel antiguo (con nombres incorrectos)
- [ ] Verificar que el sistema lo reconoce
- [ ] Verificar que advierte al usuario
- [ ] Verificar que degrada de forma controlada (no falla)

**Checklist:**
- ✅ Sistema reconoce Excel antiguo
- ✅ Advierte al usuario
- ✅ No falla, degrada controladamente
- ✅ Usuario puede corregir y reintentar

### 4.6 Comparación con baseline

- [ ] Comparar visualización actual con baseline
- [ ] Comparar PDF actual con baseline
- [ ] Comparar Excel exportado con baseline
- [ ] Documentar diferencias (si las hay)

**Checklist:**
- ✅ Visualización es igual o mejor
- ✅ PDF es igual o mejor
- ✅ Excel exportado es igual o mejor
- ✅ No hay regresiones

---

## Fase 5: Documentación y Cierre (1 hora)

### 5.1 Actualizar documentación

- [ ] Actualizar `README.md` con nueva estructura
- [ ] Crear `CHANGELOG.md` con cambios realizados
- [ ] Crear `EXCEL_COLUMN_MAP_GUIDE.md` con guía de mantenimiento
- [ ] Documentar cómo agregar nuevas columnas en el futuro

**Notas:**
- Documentación clara facilita mantenimiento futuro
- Guía de mantenimiento es crítica

### 5.2 Crear resumen de cambios

- [ ] Crear `ALINEACION_COMPLETADA.md` con:
  - Qué se cambió
  - Por qué se cambió
  - Cómo verificar que funciona
  - Cómo revertir si es necesario

**Notas:**
- Resumen es referencia para el equipo
- Facilita onboarding de nuevos desarrolladores

### 5.3 Preparar merge a main

- [ ] Verificar que todos los tests pasan
- [ ] Verificar que no hay errores de TypeScript
- [ ] Crear pull request con descripción clara
- [ ] Solicitar revisión

**Notas:**
- PR debe ser clara y fácil de revisar
- Commits deben ser pequeños y verificables

### 5.4 Merge y deployment

- [ ] Merge a main (después de aprobación)
- [ ] Deploy a staging
- [ ] Verificar en staging
- [ ] Deploy a producción
- [ ] Monitorear errores

**Notas:**
- Deployment es gradual y controlado
- Monitoreo es crítico

---

## Criterios de Éxito

### Técnicos

- ✅ `npx tsc --noEmit` reporta menos errores que antes
- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito y documentado
- ✅ Parser usa el mapa y es defensivo
- ✅ Validador está alineado con dominio
- ✅ Componentes acceden a propiedades correctas

### Funcionales

- ✅ Sistema carga Excel definitivo correctamente
- ✅ Visualización es consistente
- ✅ PDF es válido
- ✅ Exportación tiene nombres correctos
- ✅ Excel antiguo se degrada controladamente

### De Calidad

- ✅ Errores de TypeScript se reducen sin forzar el sistema
- ✅ Código es más coherente que antes
- ✅ Cambios son claros, documentados y reversibles
- ✅ No hay regresiones funcionales

---

## Notas Finales

### Principios a Mantener

- ✅ Sistema funciona en todo momento
- ✅ Cambios son incrementales y reversibles
- ✅ Adaptadores son explícitos
- ✅ TypeScript es una señal, no el objetivo
- ✅ Documentación es clara

### Si Algo Falla

1. Revertir a rama anterior: `git checkout main`
2. Revisar backup en `backups/`
3. Analizar qué salió mal
4. Crear issue con detalles
5. Reintentar con ajustes

### Contacto y Soporte

- Cualquier duda: revisar `design.md`
- Cualquier problema: revisar `BASELINE_FUNCIONAL.md`
- Cualquier cambio futuro: actualizar `EXCEL_COLUMN_MAP`

---

**Plan:** Alineación Controlada del Sistema  
**Versión:** 1.0  
**Estado:** ✅ Aprobado  
**Tiempo Estimado:** 8-10 horas  
**Próximo Paso:** Ejecutar Fase 1 (Preparación)
