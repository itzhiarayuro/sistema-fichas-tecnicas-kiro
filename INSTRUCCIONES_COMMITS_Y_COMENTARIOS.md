# Instrucciones: Commits y Comentarios en el Código

## 📋 Política de Commits

### Regla Principal
**CADA CAMBIO DEBE TENER UN COMMIT**

No acumules cambios. Haz commit después de cada funcionalidad completada.

### Formato de Mensaje de Commit

Usa el formato **Conventional Commits**:

```
<tipo>: <descripción corta>

<descripción detallada (opcional)>

<notas (opcional)>
```

### Tipos de Commit

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (sin lógica)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Agregar o actualizar tests
- **chore**: Cambios en configuración

### Ejemplos de Commits

#### ✅ Bueno
```
feat: Agregar validación de tipo de cámara

- Actualizar enum TipoCamara con nuevos valores
- Agregar validación en pozoValidator
- Actualizar tests

Relacionado con: #123
```

#### ✅ Bueno
```
fix: Corregir cálculo de altura en paginación

El servicio de paginación no calculaba correctamente
la altura cuando había 0 elementos.
```

#### ❌ Malo
```
actualizar código
```

#### ❌ Malo
```
fix stuff
```

---

## 💬 Comentarios en el Código

### Regla Principal
**COMENTA EL "POR QUÉ", NO EL "QUÉ"**

El código debe ser claro. Los comentarios explican la razón detrás de decisiones.

### Tipos de Comentarios

#### 1. Comentarios de Función/Clase
```typescript
/**
 * Calcula el ajuste de layout para un pozo
 * 
 * @param pozo - Pozo a analizar
 * @param maxLimits - Límites máximos del diseño
 * @returns Información de ajuste con factores de escala
 * 
 * @example
 * const adjustment = service.calculateAdjustment(pozo, {
 *   maxEntradas: 10,
 *   maxSalidas: 2,
 * });
 */
calculateAdjustment(pozo: Pozo, maxLimits: any): LayoutAdjustment {
  // ...
}
```

#### 2. Comentarios de Lógica Compleja
```typescript
// Usar Math.ceil porque necesitamos redondear hacia arriba
// Si hay 1 foto y maxFotos es 4, aún necesitamos 1 página
const totalPages = Math.ceil(actualFotos / maxLimits.maxFotos);
```

#### 3. Comentarios de Decisiones Importantes
```typescript
// NOTA: Las tuberías son completamente opcionales
// Un pozo puede no tener tuberías si no pudieron verificarlas
if (!tuberias || tuberias.length === 0) {
  return; // Permitido
}
```

#### 4. Comentarios de Advertencia
```typescript
// ⚠️ IMPORTANTE: Este valor debe ser > 0
// Si es 0 o negativo, causará errores en el cálculo
if (diametro <= 0) {
  throw new Error('Diámetro debe ser positivo');
}
```

#### 5. Comentarios de TODO
```typescript
// TODO: Implementar caché para mejorar rendimiento
// Actualmente recalcula cada vez que se llama
const result = calculateExpensiveOperation();
```

### ❌ Comentarios a Evitar

```typescript
// ❌ Obvio - el código ya lo dice
const x = 5; // Asignar 5 a x

// ❌ Incorrecto - el comentario no coincide con el código
const result = calculateAdjustment(); // Calcula el PDF

// ❌ Desactualizado - el código cambió pero el comentario no
// Este método retorna un string
// (pero en realidad retorna un objeto)
```

---

## 📝 Estructura de Comentarios en Archivos

### Encabezado de Archivo
```typescript
/**
 * Servicio de Ajuste Automático de Layout
 * Requirements: 7.1, 7.2
 * 
 * Reajusta automáticamente el espacio en el PDF según la cantidad real de datos
 * El diseño se hace con MÁXIMOS y se ajusta dinámicamente
 */
```

### Secciones Principales
```typescript
// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

// ============================================================================
// MÉTODOS PRIVADOS
// ============================================================================
```

### Métodos Públicos
```typescript
/**
 * Calcula el ajuste de layout para un pozo
 * 
 * @param pozo - Pozo a analizar
 * @param maxLimits - Límites máximos
 * @returns Información de ajuste
 */
public calculateAdjustment(pozo: Pozo, maxLimits: any): LayoutAdjustment {
  // Implementación
}
```

---

## 🔄 Flujo de Trabajo

### 1. Hacer Cambios
```bash
# Editar archivos
# Probar cambios
```

### 2. Verificar Estado
```bash
git status
```

### 3. Agregar Cambios
```bash
git add <archivo>
# o todos
git add -A
```

### 4. Hacer Commit
```bash
git commit -m "feat: Descripción clara del cambio"
```

### 5. Verificar Commit
```bash
git log --oneline -5
```

---

## 📊 Ejemplo Completo

### Cambio: Agregar nueva validación

**1. Editar archivo**
```typescript
/**
 * Valida que el tipo de cámara sea uno de los valores permitidos
 * 
 * Los valores permitidos están definidos en el enum TipoCamara
 * Si el valor no es válido, se agrega un error a la validación
 */
function validateTipoCamara(value: string): boolean {
  const validValues = [
    'TÍPICA DE FONDO DE CAÍDA',
    'CON COLCHÓN',
    // ...
  ];
  
  // Permitir valores vacíos (campo opcional)
  if (!value || value.trim() === '') {
    return true;
  }
  
  return validValues.includes(value);
}
```

**2. Hacer commit**
```bash
git add src/lib/validators/pozoValidator.ts
git commit -m "feat: Agregar validación de tipo de cámara

- Validar que tipoCamara sea uno de los valores permitidos
- Permitir valores vacíos (campo opcional)
- Agregar mensaje de error descriptivo

Valores permitidos:
- TÍPICA DE FONDO DE CAÍDA
- CON COLCHÓN
- CON ALIVIADERO VERTEDERO SIMPLE
- etc."
```

**3. Verificar**
```bash
git log --oneline -1
# feat: Agregar validación de tipo de cámara
```

---

## ✅ Checklist para Cada Commit

- [ ] El código funciona correctamente
- [ ] Los tests pasan
- [ ] El mensaje de commit es descriptivo
- [ ] Los comentarios explican el "por qué"
- [ ] No hay código comentado innecesario
- [ ] No hay console.log() de debug
- [ ] La documentación está actualizada

---

## 🚀 Resumen

| Aspecto | Regla |
|---------|-------|
| **Commits** | Uno por cada funcionalidad |
| **Mensaje** | Descriptivo y en formato Conventional |
| **Comentarios** | Explican el "por qué", no el "qué" |
| **Documentación** | Actualizar con cada cambio |
| **Código** | Limpio, sin debug, sin comentarios innecesarios |

**¡Cada cambio = Un commit con comentarios claros!** 🎯
