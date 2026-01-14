# Plan de Tareas: Alineación Excel sin Tocar Estructura Interna (v2.0)

**Fecha:** 14 de Enero de 2026  
**Versión:** 2.0 (Revisado - Enfoque Correcto)  
**Estado:** ✅ Plan de Tareas Aprobado  
**Rama:** `feature/alineacion-excel-final`

---

## Resumen Ejecutivo

Este documento detalla las 6 fases de implementación para alinear el Excel con el sistema **sin tocar la estructura jerárquica**. Cada fase es independiente, verificable y reversible.

**Duración estimada:** 3-4 días  
**Riesgo:** Bajo (cambios aditivos, no destructivos)  
**Impacto:** Medio (reduce deuda técnica, mejora mantenibilidad)

---

## FASE 1: Preparación (Día 1)

### Objetivo
Establecer punto de partida estable, documentado y reversible.

### Tareas

#### T1.1: Crear rama de trabajo
**Responsable:** Developer  
**Tiempo:** 5 min  
**Archivos:** N/A

```bash
git checkout -b feature/alineacion-excel-final
git push -u origin feature/alineacion-excel-final
```

**Verificación:**
- [ ] Rama creada y pusheada
- [ ] Rama visible en GitHub

---

#### T1.2: Backup del estado actual
**Responsable:** Developer  
**Tiempo:** 10 min  
**Archivos:** N/A

```bash
# Crear tag de referencia
git tag -a baseline-alineacion-excel -m "Baseline antes de alineación Excel"
git push origin baseline-alineacion-excel

# Crear archivo de backup
cp -r sistema-fichas-tecnicas sistema-fichas-tecnicas.backup
```

**Verificación:**
- [ ] Tag creado
- [ ] Backup local disponible

---

#### T1.3: Documentar baseline funcional
**Responsable:** Developer  
**Tiempo:** 30 min  
**Archivos:** `BASELINE_FUNCIONAL.md` (crear)

**Acciones:**
1. Cargar Excel actual (informacion fichas 3 modelado de datos.xlsx)
2. Visualizar datos en UI
3. Generar PDF
4. Guardar PDF como referencia: `baseline-pdf-reference.pdf`
5. Documentar en `BASELINE_FUNCIONAL.md`:
   - Fecha y hora del baseline
   - Versión del código
   - Resultado de carga Excel
   - Resultado de visualización
   - Resultado de PDF
   - Checksum del PDF (para comparación futura)

**Verificación:**
- [ ] `BASELINE_FUNCIONAL.md` creado
- [ ] `baseline-pdf-reference.pdf` guardado
- [ ] Checksum documentado

---

#### T1.4: Documentar diferencias nominales
**Responsable:** Developer  
**Tiempo:** 20 min  
**Archivos:** `DIFERENCIAS_NOMINALES.md` (crear)

**Contenido:**
```markdown
# Diferencias Nominales Identificadas

## Columnas a Corregir en Excel

| Columna Actual | Columna Correcta | Propiedad Dominio | Impacto |
|---|---|---|---|
| Materia Cono | Material Cono | materialCono | Componentes |
| Logitud | Longitud | longitud | Tuberías |
| Materia Tuberia | Material Tubería | materialTuberia | Sumideros |

## Estructura Jerárquica (Intacta)

- ✅ pozo.identificacion (6 campos)
- ✅ pozo.ubicacion (4 campos)
- ✅ pozo.componentes (23 campos)
- ✅ pozo.observaciones (1 campo)

## Mapa Excel → Flat Fields

[Tabla completa de mapeo]
```

**Verificación:**
- [ ] `DIFERENCIAS_NOMINALES.md` creado
- [ ] Tabla de mapeo completa

---

#### T1.5: Commit de preparación
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add BASELINE_FUNCIONAL.md DIFERENCIAS_NOMINALES.md
git commit -m "Phase 1: Preparación - Baseline y documentación"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Archivos visibles en GitHub

---

## FASE 2: Introducir Flat Layer (Aditivo)

### Objetivo
Agregar flat layer como aliases derivados, sin cambiar nada existente.

### Tareas

#### T2.1: Extender interfaz Pozo con getters
**Responsable:** Developer  
**Tiempo:** 45 min  
**Archivos:** `sistema-fichas-tecnicas/src/types/pozo.ts`

**Cambios:**
1. Agregar getters para flat fields (derivados de estructura jerárquica)
2. Getters NO son almacenamiento independiente
3. Cada getter apunta a la estructura jerárquica

**Ejemplo:**
```typescript
export interface Pozo {
  // Estructura jerárquica (autoridad)
  identificacion: IdentificacionPozo;
  ubicacion: UbicacionPozo;
  componentes: ComponentesPozo;
  observaciones: ObservacionesPozo;
  
  // Flat layer (aliases derivados)
  // Identificación
  get idPozo(): FieldValue { return this.identificacion.idPozo; }
  get coordenadaX(): FieldValue { return this.identificacion.coordenadaX; }
  get coordenadaY(): FieldValue { return this.identificacion.coordenadaY; }
  get fecha(): FieldValue { return this.identificacion.fecha; }
  get levanto(): FieldValue { return this.identificacion.levanto; }
  get estado(): FieldValue { return this.identificacion.estado; }
  
  // Ubicación
  get direccion(): FieldValue { return this.ubicacion.direccion; }
  get barrio(): FieldValue { return this.ubicacion.barrio; }
  get elevacion(): FieldValue { return this.ubicacion.elevacion; }
  get profundidad(): FieldValue { return this.ubicacion.profundidad; }
  
  // Componentes (23 getters)
  get existeTapa(): FieldValue { return this.componentes.existeTapa; }
  get estadoTapa(): FieldValue { return this.componentes.estadoTapa; }
  // ... más getters
  
  // Observaciones
  get observaciones(): FieldValue { return this.observaciones.observaciones; }
}
```

**Verificación:**
- [ ] Getters compilados sin errores
- [ ] Getters apuntan a estructura jerárquica
- [ ] No hay almacenamiento independiente

---

#### T2.2: Verificar que no hay cambios funcionales
**Responsable:** Developer  
**Tiempo:** 20 min

**Acciones:**
1. Ejecutar tests existentes
2. Cargar Excel actual
3. Visualizar datos
4. Generar PDF
5. Comparar con baseline

**Verificación:**
- [ ] Tests pasan
- [ ] PDF es idéntico al baseline
- [ ] Visualización es idéntica

---

#### T2.3: Commit de flat layer
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add sistema-fichas-tecnicas/src/types/pozo.ts
git commit -m "Phase 2: Introducir flat layer como getters derivados"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Cambios visibles en GitHub

---

## FASE 3: Excel Parser Alignment

### Objetivo
Mapear Excel → flat fields → estructura jerárquica.

### Tareas

#### T3.1: Crear EXCEL_COLUMN_MAP
**Responsable:** Developer  
**Tiempo:** 60 min  
**Archivos:** `sistema-fichas-tecnicas/src/lib/constants/excelColumnMap.ts` (crear)

**Contenido:**
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

**Verificación:**
- [ ] Archivo creado
- [ ] Mapa es exhaustivo
- [ ] Comentarios marcan correcciones

---

#### T3.2: Actualizar parser para usar EXCEL_COLUMN_MAP
**Responsable:** Developer  
**Tiempo:** 90 min  
**Archivos:** `sistema-fichas-tecnicas/src/lib/parsers/excelParser.ts`

**Cambios:**
1. Importar `EXCEL_COLUMN_MAP`
2. Usar mapa para traducir columnas
3. Defensivo: ignorar columnas desconocidas
4. Seguro: asignar valores por defecto si faltan columnas
5. Claro: cada paso es explícito

**Verificación:**
- [ ] Parser compila sin errores
- [ ] Parser usa EXCEL_COLUMN_MAP
- [ ] Parser es defensivo (no falla con columnas faltantes)
- [ ] Parser ignora columnas desconocidas

---

#### T3.3: Actualizar validador
**Responsable:** Developer  
**Tiempo:** 60 min  
**Archivos:** `sistema-fichas-tecnicas/src/lib/validators/pozoValidator.ts`

**Cambios:**
1. Validar estructura jerárquica (autoridad)
2. No bloquear, solo advertir
3. Claro: cada validación tiene razón de ser

**Verificación:**
- [ ] Validador compila sin errores
- [ ] Validador usa estructura jerárquica
- [ ] Validador no bloquea, solo advierte

---

#### T3.4: Testing del parser
**Responsable:** Developer  
**Tiempo:** 60 min

**Acciones:**
1. Cargar Excel definitivo (con columnas corregidas)
2. Verificar que parser mapea correctamente
3. Verificar que estructura jerárquica se llena correctamente
4. Verificar que flat layer accede correctamente
5. Cargar Excel antiguo (con columnas incorrectas)
6. Verificar que parser degrada controladamente

**Verificación:**
- [ ] Excel definitivo se carga correctamente
- [ ] Estructura jerárquica se llena correctamente
- [ ] Flat layer accede correctamente
- [ ] Excel antiguo se degrada controladamente

---

#### T3.5: Commit de parser alignment
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add sistema-fichas-tecnicas/src/lib/constants/excelColumnMap.ts
git add sistema-fichas-tecnicas/src/lib/parsers/excelParser.ts
git add sistema-fichas-tecnicas/src/lib/validators/pozoValidator.ts
git commit -m "Phase 3: Excel parser alignment con EXCEL_COLUMN_MAP"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Cambios visibles en GitHub

---

## FASE 4: Parity Verification

### Objetivo
Verificar que ambas rutas (jerárquica y plana) producen el mismo resultado.

### Tareas

#### T4.1: Generar PDF con ambas rutas
**Responsable:** Developer  
**Tiempo:** 90 min  
**Archivos:** `sistema-fichas-tecnicas/src/lib/pdf/pdfGenerator.ts`

**Acciones:**
1. Crear función `generatePdfHierarchical()` (acceso jerárquico)
2. Crear función `generatePdfFlat()` (acceso plano)
3. Ambas funciones generan PDF idéntico
4. Guardar ambos PDFs para comparación

**Verificación:**
- [ ] Ambas funciones generan PDF
- [ ] PDFs son idénticos (byte-for-byte o visualmente)
- [ ] Checksum de ambos PDFs es igual

---

#### T4.2: Verificar persistencia con ambas rutas
**Responsable:** Developer  
**Tiempo:** 60 min

**Acciones:**
1. Cargar pozo desde Excel
2. Persistir usando acceso jerárquico
3. Cargar pozo desde Excel
4. Persistir usando acceso plano
5. Comparar estados persistidos

**Verificación:**
- [ ] Estados persistidos son idénticos
- [ ] Snapshots son idénticos
- [ ] Recuperación es idéntica

---

#### T4.3: Verificar validación con ambas rutas
**Responsable:** Developer  
**Tiempo:** 45 min

**Acciones:**
1. Validar pozo usando acceso jerárquico
2. Validar pozo usando acceso plano
3. Comparar resultados de validación

**Verificación:**
- [ ] Resultados de validación son idénticos
- [ ] Errores son idénticos
- [ ] Advertencias son idénticas

---

#### T4.4: Documentar parity verification
**Responsable:** Developer  
**Tiempo:** 30 min  
**Archivos:** `PARITY_VERIFICATION.md` (crear)

**Contenido:**
```markdown
# Parity Verification Report

## PDF Comparison
- Hierarchical PDF: [checksum]
- Flat PDF: [checksum]
- Result: ✅ IDENTICAL

## Persistence Comparison
- Hierarchical State: [checksum]
- Flat State: [checksum]
- Result: ✅ IDENTICAL

## Validation Comparison
- Hierarchical Validation: [errors, warnings]
- Flat Validation: [errors, warnings]
- Result: ✅ IDENTICAL

## Conclusion
Parity verified. Safe to proceed with progressive migration.
```

**Verificación:**
- [ ] `PARITY_VERIFICATION.md` creado
- [ ] Todos los checksum documentados
- [ ] Conclusión clara

---

#### T4.5: Commit de parity verification
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add PARITY_VERIFICATION.md
git add baseline-pdf-hierarchical.pdf baseline-pdf-flat.pdf
git commit -m "Phase 4: Parity verification - ambas rutas producen resultado idéntico"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Archivos visibles en GitHub

---

## FASE 5: Progressive Migration

### Objetivo
Migrar componentes uno a uno, verificando equivalencia.

### Tareas

#### T5.1: Migrar PozoViewer
**Responsable:** Developer  
**Tiempo:** 60 min  
**Archivos:** `sistema-fichas-tecnicas/src/components/PozoViewer.tsx`

**Cambios:**
1. Cambiar acceso de jerárquico a plano
2. Usar flat layer en lugar de estructura jerárquica
3. Verificar que visualización es idéntica

**Verificación:**
- [ ] Componente compila sin errores
- [ ] Visualización es idéntica
- [ ] Tests pasan

---

#### T5.2: Migrar PozoForm
**Responsable:** Developer  
**Tiempo:** 60 min  
**Archivos:** `sistema-fichas-tecnicas/src/components/PozoForm.tsx`

**Cambios:**
1. Cambiar acceso de jerárquico a plano
2. Usar flat layer en lugar de estructura jerárquica
3. Verificar que edición funciona igual

**Verificación:**
- [ ] Componente compila sin errores
- [ ] Edición funciona igual
- [ ] Tests pasan

---

#### T5.3: Migrar PDF Generator
**Responsable:** Developer  
**Tiempo:** 60 min  
**Archivos:** `sistema-fichas-tecnicas/src/lib/pdf/pdfGenerator.ts`

**Cambios:**
1. Cambiar acceso de jerárquico a plano
2. Usar flat layer en lugar de estructura jerárquica
3. Verificar que PDF es idéntico

**Verificación:**
- [ ] Componente compila sin errores
- [ ] PDF es idéntico
- [ ] Tests pasan

---

#### T5.4: Migrar componentes restantes
**Responsable:** Developer  
**Tiempo:** 120 min

**Componentes a migrar:**
- Exportador de Excel
- Validador
- Adaptadores
- Helpers

**Verificación:**
- [ ] Todos los componentes compilados
- [ ] Todos los tests pasan
- [ ] Funcionalidad es idéntica

---

#### T5.5: Commit de progressive migration
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add sistema-fichas-tecnicas/src/components/
git add sistema-fichas-tecnicas/src/lib/
git commit -m "Phase 5: Progressive migration - componentes migrados a flat layer"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Cambios visibles en GitHub

---

## FASE 6: Removal (Post-MVP)

### Objetivo
Simplificar después de MVP (solo si MVP es exitoso).

### Tareas

#### T6.1: Evaluar MVP
**Responsable:** Product Manager  
**Tiempo:** N/A

**Criterios:**
- ✅ MVP fue mostrado a stakeholders
- ✅ Sistema es estable
- ✅ Cero regresos observados
- ✅ Usuarios están satisfechos

**Decisión:**
- Si todos los criterios se cumplen → Proceder a T6.2
- Si algún criterio no se cumple → Mantener estructura jerárquica

---

#### T6.2: Remover estructura jerárquica
**Responsable:** Developer  
**Tiempo:** 120 min  
**Archivos:** `sistema-fichas-tecnicas/src/types/pozo.ts`

**Cambios:**
1. Remover campos jerárquicos (identificacion, ubicacion, componentes, observaciones)
2. Mantener solo flat fields
3. Actualizar tipos

**Verificación:**
- [ ] Tipos compilados sin errores
- [ ] Funcionalidad es idéntica
- [ ] Tests pasan

---

#### T6.3: Simplificar validador
**Responsable:** Developer  
**Tiempo:** 60 min

**Cambios:**
1. Simplificar validador para usar solo flat fields
2. Remover lógica de mapeo jerárquico

**Verificación:**
- [ ] Validador compila sin errores
- [ ] Validación es idéntica
- [ ] Tests pasan

---

#### T6.4: Finalizar flattening
**Responsable:** Developer  
**Tiempo:** 60 min

**Acciones:**
1. Remover adaptadores jerárquicos
2. Remover helpers jerárquicos
3. Limpiar código

**Verificación:**
- [ ] Código compila sin errores
- [ ] Tests pasan
- [ ] Funcionalidad es idéntica

---

#### T6.5: Commit de removal
**Responsable:** Developer  
**Tiempo:** 5 min

```bash
git add sistema-fichas-tecnicas/src/
git commit -m "Phase 6: Removal - estructura jerárquica removida (post-MVP)"
git push
```

**Verificación:**
- [ ] Commit pusheado
- [ ] Cambios visibles en GitHub

---

## Criterios de Éxito Global

### Técnicos

- ✅ Mapa `EXCEL_COLUMN_MAP` es explícito
- ✅ Parser mapea Excel → flat fields
- ✅ Flat fields hidratan estructura jerárquica
- ✅ PDF generado con ambas rutas es idéntico
- ✅ Errores de TypeScript se reducen

### Funcionales

- ✅ Sistema carga Excel definitivo correctamente
- ✅ Visualización es consistente
- ✅ PDF es válido
- ✅ Exportación tiene nombres correctos
- ✅ Excel antiguo se degrada controladamente

### De Calidad

- ✅ Código es más coherente
- ✅ Cambios son claros y documentados
- ✅ Reversibilidad garantizada
- ✅ Cero regresiones funcionales

---

## Rollback Procedures

### Si algo falla en Fase 1-2

```bash
git reset --hard baseline-alineacion-excel
git push -f
```

### Si algo falla en Fase 3-4

```bash
git reset --hard HEAD~N  # N = número de commits a revertir
git push -f
```

### Si algo falla en Fase 5

```bash
git revert HEAD  # Revertir último commit
git push
```

### Si algo falla en Fase 6

```bash
git reset --hard HEAD~N  # Revertir a antes de Phase 6
git push -f
```

---

## Timeline

| Fase | Duración | Día |
|------|----------|-----|
| Fase 1: Preparación | 1 día | Día 1 |
| Fase 2: Flat Layer | 1 día | Día 1-2 |
| Fase 3: Parser Alignment | 1 día | Día 2 |
| Fase 4: Parity Verification | 1 día | Día 2-3 |
| Fase 5: Progressive Migration | 1 día | Día 3-4 |
| Fase 6: Removal | Post-MVP | N/A |

**Total:** 3-4 días (hasta MVP)

---

## Notas Finales

Este plan es **prudente, profesional y adecuado para un MVP serio**:

- ✅ Mantiene MVP funcionando
- ✅ Introduce cambios sin riesgo
- ✅ Verifica equivalencia antes de migrar
- ✅ Permite rollback en cualquier momento
- ✅ Demuestra profesionalismo y control

**Aprobación:** Plan de tareas listo para implementación

---

**Documento:** Plan de Tareas (v2.0)  
**Versión:** 2.0  
**Estado:** ✅ Aprobado  
**Próximo Paso:** Iniciar Fase 1 (Preparación)
