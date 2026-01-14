# Guía de Integración - Persistencia y Recuperación

**Objetivo:** Conectar la arquitectura de persistencia con los stores y componentes existentes.

---

## 1. Inicialización Global

### En `src/app/layout.tsx` o `src/lib/init.ts`:

```typescript
import { initSafePersist } from '@/lib/persistence/safePersist';
import { initRecoveryManager } from '@/lib/persistence/recoveryManager';
import { initSafeReset } from '@/lib/persistence/safeReset';
import { IndexedDBAdapter } from '@/lib/persistence/adapters/indexedDBAdapter';
import { SnapshotStoreImpl } from '@/lib/persistence/adapters/snapshotStore';

// Inicializar adaptadores
const storageAdapter = new IndexedDBAdapter();
const snapshotStore = new SnapshotStoreImpl();

// Inicializar managers
export const safePersist = initSafePersist(storageAdapter);
export const recoveryManager = initRecoveryManager(snapshotStore);
export const safeReset = initSafeReset();
```

---

## 2. Integración con FichaStore (Zustand)

### Antes:
```typescript
const fichaStore = create((set) => ({
  state: initialState,
  
  updateField: (sectionId, field, value) => {
    set((state) => ({
      ...state,
      sections: state.sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: { ...s.content, [field]: value } }
          : s
      )
    }));
  },
}));
```

### Después:
```typescript
import { getSafePersist } from '@/lib/persistence/safePersist';
import { guardState } from '@/lib/persistence/stateGuard';

const fichaStore = create((set, get) => ({
  state: initialState,
  
  updateField: (sectionId, field, value) => {
    set((state) => {
      const newState = {
        ...state,
        sections: state.sections.map(s => 
          s.id === sectionId 
            ? { ...s, content: { ...s.content, [field]: value } }
            : s
        ),
        lastModified: Date.now(),
      };
      
      // Guardar de forma segura
      getSafePersist().safeSave(state.id, newState).catch(err => {
        console.error('Error guardando:', err);
      });
      
      return newState;
    });
  },
  
  // Nuevo: Cargar con recuperación
  loadFicha: async (fichaId) => {
    // Intentar cargar
    let state = await getSafePersist().safeLoad(fichaId);
    
    // Si no existe, recuperar
    if (!state) {
      const recovery = await getRecoveryManager().recover(fichaId);
      state = recovery.state;
    }
    
    // Validar antes de usar
    const guardResult = await guardState(fichaId, state);
    if (guardResult.valid) {
      set({ state: guardResult.state });
    } else {
      // Mostrar error
      console.error('No se pudo cargar ficha:', guardResult.message);
    }
  },
}));
```

---

## 3. Integración con Componentes

### Componente de Editor:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { guardState } from '@/lib/persistence/stateGuard';
import { getStatusMessage } from '@/lib/persistence/stateStatus';
import { useFichaStore } from '@/stores/fichaStore';

export function FichaEditor({ fichaId }: { fichaId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const { state, loadFicha } = useFichaStore();

  useEffect(() => {
    const load = async () => {
      try {
        // Cargar ficha
        await loadFicha(fichaId);
        
        // Validar y recuperar si es necesario
        const guardResult = await guardState(fichaId, state);
        
        if (!guardResult.valid) {
          setError(guardResult.message);
        } else {
          // Mostrar mensaje de status si fue recuperado
          const message = getStatusMessage(guardResult.state);
          if (message) {
            setStatusMessage(message);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [fichaId]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="font-semibold text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {statusMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-yellow-800">{statusMessage}</p>
        </div>
      )}
      
      {/* Contenido del editor */}
      <div>
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 4. Botón de Reset Seguro

### Componente:

```typescript
import { getSafeReset } from '@/lib/persistence/safeReset';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ResetButton({ fichaId }: { fichaId: string }) {
  const { showConfirm } = useConfirmDialog();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: '¿Reiniciar ficha?',
      message: 'Esto restaurará la ficha a su último snapshot. ¿Continuar?',
      confirmText: 'Reiniciar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    setIsResetting(true);
    try {
      const safeReset = getSafeReset();
      const result = await safeReset.resetToLastSnapshot(fichaId);
      
      if (result.success) {
        // Actualizar store
        useFichaStore.setState({ state: result.state });
        
        // Mostrar mensaje
        showNotification(result.message, 'success');
      } else {
        showNotification('Error al reiniciar', 'error');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
    >
      {isResetting ? 'Reiniciando...' : 'Reiniciar Ficha'}
    </button>
  );
}
```

---

## 5. Adaptadores de Almacenamiento

### IndexedDB Adapter:

```typescript
// src/lib/persistence/adapters/indexedDBAdapter.ts

import { StorageAdapter } from '@/lib/persistence/safePersist';

export class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'fichas-tecnicas';
  private readonly storeName = 'fichas';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async save(key: string, data: unknown): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ id: key, data, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(key: string): Promise<unknown> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data || null);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exists(key: string): Promise<boolean> {
    const data = await this.load(key);
    return data !== null;
  }
}
```

### Snapshot Store:

```typescript
// src/lib/persistence/adapters/snapshotStore.ts

import { FichaState } from '@/types/ficha';
import { SnapshotStore } from '@/lib/persistence/recoveryManager';

export class SnapshotStoreImpl implements SnapshotStore {
  private snapshots: Map<string, FichaState[]> = new Map();
  private maxSnapshotsPerFicha = 10;

  async getLatestSnapshot(fichaId: string): Promise<FichaState | null> {
    const snapshots = this.snapshots.get(fichaId) || [];
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }

  async getAllSnapshots(fichaId: string): Promise<FichaState[]> {
    return this.snapshots.get(fichaId) || [];
  }

  async saveSnapshot(fichaId: string, state: FichaState): Promise<void> {
    const snapshots = this.snapshots.get(fichaId) || [];
    snapshots.push(JSON.parse(JSON.stringify(state)));

    // Mantener máximo de snapshots
    if (snapshots.length > this.maxSnapshotsPerFicha) {
      snapshots.shift();
    }

    this.snapshots.set(fichaId, snapshots);
  }

  async clearSnapshots(fichaId: string): Promise<void> {
    this.snapshots.delete(fichaId);
  }
}
```

---

## 6. Checklist de Integración

- [ ] Inicializar SafePersist, RecoveryManager, SafeReset en app layout
- [ ] Actualizar FichaStore para usar SafePersist
- [ ] Agregar guardState en componentes principales
- [ ] Mostrar mensajes de statusInfo en UI
- [ ] Implementar botón de Reset Seguro
- [ ] Crear adaptadores de almacenamiento
- [ ] Ejecutar CHAOS_CHECKLIST.md
- [ ] Verificar que no hay errores en consola
- [ ] Documentar cambios en README

---

## 7. Testing Manual

### Escenario 1: Cierre y Reapertura
1. Abrir editor
2. Hacer cambios
3. Cerrar navegador
4. Reabrir
5. ✅ Cambios están presentes

### Escenario 2: Recarga a Mitad
1. Abrir editor
2. Hacer cambios
3. Presionar F5
4. ✅ Cambios están presentes

### Escenario 3: Reset
1. Abrir editor
2. Hacer cambios
3. Clic en "Reiniciar Ficha"
4. Confirmar
5. ✅ Ficha vuelve a estado anterior

---

## 8. Monitoreo

### Ver logs de persistencia:
```typescript
const safePersist = getSafePersist();
console.log(safePersist.getPersistenceLog());
```

### Ver logs de recuperación:
```typescript
const recoveryManager = getRecoveryManager();
console.log(recoveryManager.getRecoveryLog());
```

### Ver logs de eventos:
```typescript
import { getEventLog } from '@/lib/domain/eventLog';

const eventLog = getEventLog(fichaId);
console.log(eventLog?.getEvents());
```

---

## 9. Troubleshooting

### Problema: Estado no se guarda
**Solución:** Verificar que `validateFichaFinal()` retorna `valid: true`

### Problema: Recuperación no funciona
**Solución:** Verificar que `RecoveryManager` está inicializado y `SnapshotStore` tiene datos

### Problema: UI no muestra mensaje de recuperación
**Solución:** Verificar que `getStatusMessage()` retorna un valor y se muestra en UI

---

## 10. Próximos Pasos

1. Implementar adaptadores de almacenamiento
2. Integrar con stores existentes
3. Agregar UI para mensajes de status
4. Ejecutar CHAOS_CHECKLIST.md
5. Documentar en README

