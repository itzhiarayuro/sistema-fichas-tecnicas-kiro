# Guía de Contribución

## Cómo Contribuir

Este documento describe cómo contribuir al Sistema de Fichas Técnicas de Pozos.

## Configuración del Entorno

### Requisitos
- Node.js 18+
- npm 9+
- Git

### Setup Inicial
```bash
# Clonar repositorio
git clone <repo-url>
cd sistema-fichas-tecnicas

# Instalar dependencias
npm install

# Crear rama de desarrollo
git checkout -b feature/tu-feature
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests en watch mode
npm run test:watch

# Linting
npm run lint

# Build
npm run build
```

## Estructura de Cambios

### Agregar Nuevo Campo

1. **Actualizar tipos** (`src/types/pozo.ts`):
```typescript
export interface Pozo {
  // ... campos existentes
  nuevocampo: string;
}
```

2. **Agregar validación** (`src/lib/validators/pozoValidator.ts`):
```typescript
export function validatePozo(pozo: Pozo): ValidationResult {
  // ... validaciones existentes
  if (!pozo.nuevocamp) {
    errors.push('nuevocamp es requerido');
  }
}
```

3. **Actualizar diccionario** (`public/guias/DICCIONARIO_CAMPOS.md`):
```markdown
### nuevocamp
- **Tipo**: string
- **Obligatorio**: sí/no
- **Descripción**: Descripción del campo
- **Ejemplo**: Valor de ejemplo
- **Validación**: Reglas de validación
```

4. **Actualizar parser** (`src/lib/parsers/excelParser.ts`):
```typescript
const FIELD_MAPPING = {
  // ... mappings existentes
  'Nuevo Campo': 'nuevocamp',
};
```

5. **Crear tests** (`src/tests/unit/pozoValidator.test.ts`):
```typescript
it('debe validar nuevocamp correctamente', () => {
  const pozo = { ...validPozo, nuevocamp: 'valor' };
  const result = validatePozo(pozo);
  expect(result.isValid).toBe(true);
});
```

### Agregar Nueva Plantilla de Diseño

1. **Crear archivo de plantilla** (`src/lib/templates/miPlantilla.ts`):
```typescript
export const miPlantilla: FichaDesign = {
  id: 'mi-plantilla',
  name: 'Mi Plantilla',
  // ... configuración
};
```

2. **Registrar plantilla** (`src/stores/designStore.ts`):
```typescript
const BUILT_IN_TEMPLATES = [
  // ... plantillas existentes
  miPlantilla,
];
```

3. **Crear tests** (`src/tests/unit/templates.test.ts`):
```typescript
it('debe renderizar mi plantilla correctamente', () => {
  // Test de renderizado
});
```

### Extender Validaciones

1. **Crear validador** (`src/lib/validators/miValidador.ts`):
```typescript
export function miValidacion(pozo: Pozo): ValidationError[] {
  const errors: ValidationError[] = [];
  // Lógica de validación
  return errors;
}
```

2. **Integrar en validador principal** (`src/lib/validators/pozoValidator.ts`):
```typescript
export function validatePozo(pozo: Pozo): ValidationResult {
  const errors = [
    ...miValidacion(pozo),
    // ... otras validaciones
  ];
  return { isValid: errors.length === 0, errors };
}
```

3. **Crear tests**:
```typescript
describe('miValidacion', () => {
  it('debe detectar errores correctamente', () => {
    // Tests
  });
});
```

## Estándares de Código

### TypeScript
- Usar tipos explícitos
- Evitar `any`
- Usar interfaces para objetos
- Documentar tipos complejos

```typescript
// ✅ Bien
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

function crearUsuario(datos: Usuario): Promise<Usuario> {
  // ...
}

// ❌ Mal
function crearUsuario(datos: any): any {
  // ...
}
```

### React
- Usar functional components
- Usar hooks
- Memoizar cuando sea necesario
- Documentar props complejas

```typescript
// ✅ Bien
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Mal
export function Button(props: any) {
  return <button {...props}>{props.label}</button>;
}
```

### Naming
- Componentes: PascalCase
- Funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos: kebab-case (excepto componentes)

```
✅ Bien:
- src/components/UserCard.tsx
- src/lib/validators/pozo-validator.ts
- src/stores/fichaStore.ts
- const MAX_RETRIES = 3;

❌ Mal:
- src/components/userCard.tsx
- src/lib/validators/PozoValidator.ts
- src/stores/FichaStore.ts
- const maxRetries = 3;
```

### Comentarios
- Documentar funciones complejas
- Explicar el "por qué", no el "qué"
- Usar JSDoc para funciones públicas

```typescript
// ✅ Bien
/**
 * Valida un pozo según reglas de negocio
 * @param pozo - Datos del pozo a validar
 * @returns Resultado de validación con errores si aplica
 */
export function validatePozo(pozo: Pozo): ValidationResult {
  // Validar estructura mínima primero
  // porque es más rápido que validar campos individuales
  if (!pozo.id || !pozo.codigo) {
    return { isValid: false, errors: ['Estructura mínima requerida'] };
  }
  // ...
}

// ❌ Mal
export function validatePozo(pozo: Pozo): ValidationResult {
  // Validar pozo
  if (!pozo.id) {
    return { isValid: false, errors: ['ID requerido'] };
  }
  // ...
}
```

## Testing

### Cobertura Mínima
- 80% de cobertura general
- 100% de funciones críticas
- 100% de validadores

### Tipos de Tests

#### Unit Tests
```typescript
describe('validatePozo', () => {
  it('debe aceptar pozos válidos', () => {
    const pozo = { id: '1', codigo: 'P001', /* ... */ };
    const result = validatePozo(pozo);
    expect(result.isValid).toBe(true);
  });

  it('debe rechazar pozos sin ID', () => {
    const pozo = { codigo: 'P001', /* ... */ };
    const result = validatePozo(pozo);
    expect(result.isValid).toBe(false);
  });
});
```

#### Property-Based Tests
```typescript
import * as fc from 'fast-check';

it('debe ser idempotente', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result1 = transform(input);
      const result2 = transform(result1);
      return result1 === result2;
    })
  );
});
```

#### Integration Tests
```typescript
it('debe cargar y procesar archivo Excel', async () => {
  const file = new File(['...'], 'test.xlsx');
  const result = await parseExcel(file);
  expect(result.pozos).toHaveLength(10);
});
```

## Proceso de Commit

### Mensajes de Commit
Usar formato convencional:
```
<tipo>(<scope>): <descripción>

<cuerpo>

<footer>
```

Tipos:
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Agregar o actualizar tests
- `chore`: Cambios en build, deps, etc

Ejemplos:
```
feat(editor): agregar soporte para campos repetibles

fix(validator): corregir validación de coordenadas

docs(readme): actualizar instrucciones de instalación

test(parser): agregar tests para Excel con columnas extra
```

### Pre-commit Checks
```bash
# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

## Pull Requests

### Checklist
- [ ] Tests pasan (`npm test`)
- [ ] Linting pasa (`npm run lint`)
- [ ] Build pasa (`npm run build`)
- [ ] Documentación actualizada
- [ ] Cambios en tipos documentados
- [ ] Cambios en API documentados
- [ ] Ejemplos de uso incluidos

### Descripción del PR
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Cambio en documentación

## Cambios
- Cambio 1
- Cambio 2

## Testing
Describe cómo se probaron los cambios

## Screenshots (si aplica)
Incluir screenshots de cambios visuales

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He actualizado la documentación
- [ ] He agregado tests
- [ ] Los tests pasan
```

## Reportar Bugs

### Información Requerida
1. Descripción clara del bug
2. Pasos para reproducir
3. Comportamiento esperado
4. Comportamiento actual
5. Entorno (OS, navegador, versión)
6. Logs/screenshots si aplica

### Ejemplo
```markdown
## Descripción
El editor no guarda cambios en campos repetibles

## Pasos para Reproducir
1. Cargar archivo Excel con tuberías
2. Editar una tubería
3. Hacer clic en guardar
4. Recargar página

## Esperado
Los cambios deben persistir

## Actual
Los cambios se pierden al recargar

## Entorno
- OS: Windows 11
- Navegador: Chrome 120
- Versión: 0.1.0
```

## Roadmap

### Próximas Características
- [ ] Sincronización multiusuario
- [ ] Auditoría completa
- [ ] Integración con BD remota
- [ ] Validación normativa
- [ ] Exportación a múltiples formatos

### Mejoras Planeadas
- [ ] Performance: Virtualización de listas
- [ ] UX: Drag-and-drop mejorado
- [ ] Accesibilidad: WCAG 2.1 AAA
- [ ] Mobile: App nativa

## Preguntas?

Contacta al equipo de desarrollo o abre una issue en el repositorio.

## Licencia

Al contribuir, aceptas que tus cambios se licencien bajo la misma licencia del proyecto.
