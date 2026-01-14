# Arquitectura de Persistencia y Recuperación

**Versión:** 1.0  
**Objetivo:** Garantía central: "Nunca pierdo datos, siempre me recupero"

---

## Resumen Ejecutivo

Este documento describe cómo el sistema garantiza que:

1. **Nunca guarda estado corrupto** (SafePersist)
2. **Siempre se recupera** (RecoveryManager)
3. **Nunca renderiza basura** (StateGuard)
4. **El usuario siempre puede resetear** (SafeReset)
5. **Todo es auditable** (EventLog + StatusInfo)

---

## 1. Persistencia Segura (SafePersist)

### Garantía: "Nunca guardo un estado corrupto"

**Ubicación:** `src/lib/persistence/safePersist.ts`

### Proceso:
```
safeSave(fichaId, state)
  ↓
1. Validar estado con isStateValid()
  ↓
2. Si es válido:
   - Guardar en almacenamiento
   - Actualizar lastValidState
   - Registrar éxito en eventLog
  ↓
3. Si es inválido:
   - NO guardar
   - Registrar rechazo en eventLog
   - Retornar error
```

### Reglas:
- ✅ Validar ANTES de guardar
- ✅ Nunca sobrescribir estado válido con corrupto
- ✅ Mantener lastValidState independiente
- ✅ Registrar cada intento

### Uso:
```typescript
const safePersist = getSafePersist();
const result = await safePersist.safeSave(fichaId, state);

if (result.success) {
  console.log('Estado guardado exitosamente');
} else {
  console.log('Estado rechazado:', result.error);
}
```

---

## 2. Recuperación Ordenada (RecoveryManager)

### Garantía: "De aquí me recupero así, siempre"

**Ubicación:** `src/lib/persistence/recoveryManager.ts`

### Pipeline de Recuperación (Orden Fijo):
```
recover(fichaId)
  ↓
1. Intentar último estado válido
   - Si existe y es válido → usar
   - Si no → siguiente
  ↓
2. Intentar snapshots (más reciente primero)
   - Si existe y es válido → usar
   - Si no → siguiente
  ↓
3. Fallback a estado base (BASE_STATE)
   - Siempre existe
   - Siempre es válido
   - Nunca falla
```

### BASE_STATE:
```typescript
const BASE_STATE: FichaState = {
  id: '',
  pozoId: '',
  status: 'draft',
  sections: [],
  customizations: { /* valores por defecto */ },
  history: [],
  errors: [],
  lastModified: Date.now(),
  version: 1,
};
```

**Propiedades:**
- ✅ Único e inmutable
- ✅ Siempre válido
- ✅ Siempre renderizable
- ✅ Último fallback absoluto

### Uso:
```typescript
const recoveryManager = getRecoveryManager();
const result = await recoveryManager.recover(fichaId);

console.log(`Recuperado desde: ${result.source}`);
console.log(`Mensaje: ${result.message}`);
```

---

## 3. Estado Recuperado (StateStatus)

### Concepto: "Sé qué pasó"

**Ubicación:** `src/lib/persistence/stateStatus.ts`

### Estados Posibles:
```typescript
type StateStatusType = 'ok' | 'recovered' | 'reset';

interface StateStatusInfo {
  status: StateStatusType;
  message: string;
  timestamp: number;
  recoveredFrom?: 'lastValid' | 'snapshot' | 'base';
  userMessage: string; // Amigable para usuario
}
```

### Ejemplos:
```typescript
// Estado normal
{
  status: 'ok',
  message: 'Estado normal',
  userMessage: 'Tu ficha está en buen estado'
}

// Recuperado desde snapshot
{
  status: 'recovered',
  message: 'Recuperado desde snapshot',
  recoveredFrom: 'snapshot',
  userMessage: 'Tu ficha fue recuperada de un estado anterior'
}

// Reiniciado a base
{
  status: 'reset',
  message: 'Reiniciado a estado base',
  recoveredFrom: 'base',
  userMessage: 'Tu ficha fue reiniciada. Algunos cambios pueden haberse perdido.'
}
```

### Uso en UI:
```typescript
const statusMessage = getStatusMessage(state);
if (statusMessage) {
  showNotification(statusMessage, 'warning');
}
```

---

## 4. Guard de Renderizado (StateGuard)

### Regla: "Nunca renderizar estado inválido"

**Ubicación:** `src/lib/persistence/stateGuard.ts`

### Proceso:
```
guardState(fichaId, state)
  ↓
1. Validar estado
  ↓
2. Si es válido:
   - Retornar estado
  ↓
3. Si es inválido:
   - Intentar recuperar
   - Si recuperación exitosa → retornar estado recuperado
   - Si falla → mostrar pantalla de error
```

### Uso en Componentes:
```typescript
const result = await guardState(fichaId, state);

if (result.valid) {
  // Renderizar estado
  return <FichaEditor state={result.state} />;
} else {
  // Mostrar pantalla de recuperación
  return <RecoveryScreen reason={result.reason} message={result.message} />;
}
```

### Pantalla de Recuperación:
- Muestra error de forma clara
- Ofrece opciones: Reintentar, Volver al Inicio
- HTML puro (no depende de React)
- Fallback absoluto

---

## 5. Reset Seguro (SafeReset)

### Garantía: "El usuario siempre puede volver a algo seguro"

**Ubicación:** `src/lib/persistence/safeReset.ts`

### Opciones de Reset:
```typescript
// 1. Resetear a último snapshot
const result = await safeReset.resetToLastSnapshot(fichaId);

// 2. Resetear a estado base
const result = await safeReset.resetToBase(fichaId);

// 3. Con confirmación explícita
const result = await safeReset.resetWithConfirmation(
  fichaId,
  'base',
  async () => {
    // Mostrar diálogo de confirmación
    return await showConfirmDialog('¿Reiniciar ficha?');
  }
);
```

### Flujo:
```
resetToLastSnapshot(fichaId)
  ↓
1. Obtener último estado válido
  ↓
2. Si existe:
   - Adjuntar statusInfo: 'recovered'
   - Guardar de forma segura
   - Retornar
  ↓
3. Si no existe:
   - Resetear a base
```

---

## 6. Validación Estructural (StructuralValidator)

### Responsabilidad: "¿Es renderizable y persistible?"

**Ubicación:** `src/lib/persistence/structuralValidator.ts`

### Checks Mínimos:
```typescript
validateFichaStateStructure(state)
  ↓
1. ¿Es un objeto?
2. ¿Tiene ID?
3. ¿Status es válido?
4. ¿Sections es array?
5. ¿Customizations existe?
6. ¿History es array?
7. ¿Errors es array?
8. ¿LastModified es número?
9. ¿Version es número?
```

### Uso:
```typescript
const validation = validateFichaStateStructure(state);

if (validation.valid) {
  // Renderizar y persistir
} else {
  // Recuperar
  console.log('Errores:', validation.errors);
}
```

---

## 7. Auditoría Completa (EventLog)

### Registro de Cada Evento:
```typescript
eventLog.log({
  type: 'PERSIST_SUCCESS',
  fichaId,
  data: { size: 1024 }
});

eventLog.log({
  type: 'RECOVERY_SUCCESS',
  fichaId,
  data: { source: 'snapshot' }
});

eventLog.log({
  type: 'STATE_INVALID',
  fichaId,
  data: { errors: ['...'] }
});
```

### Tipos de Eventos:
- `PERSIST_SUCCESS` - Persistencia exitosa
- `PERSIST_FAILED` - Persistencia rechazada
- `PERSIST_CORRUPTED` - Estado corrupto detectado
- `RECOVERY_SUCCESS` - Recuperación exitosa
- `RECOVERY_RESET` - Recuperación a base
- `RECOVERY_ERROR` - Error durante recuperación
- `STATE_INVALID` - Estado inválido detectado
- `RESET_SUCCESS` - Reset exitoso
- `RESET_CANCELLED` - Reset cancelado por usuario
- `RESET_ERROR` - Error durante reset

---

## 8. Flujo Completo: Edición → Guardado → Recuperación

### Escenario: Usuario edita y cierra navegador

```
1. Usuario edita campo
   ↓
2. onChange → actualizar estado local
   ↓
3. onBlur → safeSave(fichaId, state)
   ↓
4. SafePersist valida estado
   ↓
5. Si válido:
   - Guardar en IndexedDB
   - Actualizar lastValidState
   - Registrar en eventLog
   ↓
6. Usuario cierra navegador
   ↓
7. Usuario reabre navegador
   ↓
8. Componente monta
   ↓
9. guardState(fichaId, state)
   ↓
10. StateGuard valida estado
    ↓
11. Si inválido:
    - RecoveryManager.recover()
    - Intenta: lastValid → snapshots → base
    - Retorna estado válido
    ↓
12. Adjuntar statusInfo: 'recovered'
    ↓
13. Renderizar con mensaje: "Tu ficha fue recuperada"
    ↓
14. Usuario puede continuar editando
```

---

## 9. Integración con Stores (Zustand)

### FichaStore debe usar SafePersist:
```typescript
const fichaStore = create((set) => ({
  state: initialState,
  
  updateField: (sectionId, field, value) => {
    set((state) => {
      const newState = { ...state, /* cambios */ };
      
      // Guardar de forma segura
      getSafePersist().safeSave(state.id, newState);
      
      return newState;
    });
  },
}));
```

### GlobalStore debe usar RecoveryManager:
```typescript
const globalStore = create((set) => ({
  fichas: new Map(),
  
  loadFicha: async (fichaId) => {
    // Intentar cargar
    let state = await getSafePersist().safeLoad(fichaId);
    
    // Si no existe o es inválido, recuperar
    if (!state) {
      const recovery = await getRecoveryManager().recover(fichaId);
      state = recovery.state;
    }
    
    set((store) => ({
      fichas: store.fichas.set(fichaId, state)
    }));
  },
}));
```

---

## 10. Checklist de Implementación

- [ ] SafePersist inicializado con StorageAdapter
- [ ] RecoveryManager inicializado con SnapshotStore
- [ ] SafeReset inicializado
- [ ] StateGuard usado en componentes principales
- [ ] EventLog registrando todos los eventos
- [ ] Stores usando SafePersist y RecoveryManager
- [ ] UI mostrando mensajes de statusInfo
- [ ] Tests de caos pasando (CHAOS_CHECKLIST.md)
- [ ] Documentación actualizada
- [ ] Demo funcional

---

## 11. Garantías Finales

✅ **Nunca pierdo datos:**
- Validación antes de guardar
- Último estado válido siempre disponible
- Snapshots como backup

✅ **Siempre me recupero:**
- Pipeline ordenado: lastValid → snapshots → base
- BASE_STATE como fallback absoluto
- Nunca falla

✅ **Nunca renderizo basura:**
- StateGuard valida antes de renderizar
- Pantalla de recuperación como fallback
- HTML puro para casos extremos

✅ **Usuario siempre puede resetear:**
- SafeReset con confirmación explícita
- Opciones claras: snapshot o base
- Recuperación automática después

✅ **Todo es auditable:**
- EventLog registra cada evento
- StatusInfo explica qué pasó
- Logs disponibles para debugging

---

## 12. Próximos Pasos

1. **Integración:** Conectar con stores existentes
2. **Testing:** Ejecutar CHAOS_CHECKLIST.md
3. **UI:** Mostrar mensajes de statusInfo
4. **Documentación:** Actualizar guías de usuario
5. **Demo:** Demostrar robustez ante caos

