/**
 * Lifecycle Manager - Gestión del ciclo de vida de fichas
 * Requirements: 9.1, 16.10
 * 
 * Fases: mounted | suspended | resumed | destroyed
 * Gestiona intervals, observers, listeners para prevenir memory leaks
 */

/**
 * Fases del ciclo de vida
 */
export enum LifecyclePhase {
  MOUNTED = 'mounted',
  SUSPENDED = 'suspended',
  RESUMED = 'resumed',
  DESTROYED = 'destroyed',
}

/**
 * Callback de ciclo de vida
 */
export type LifecycleCallback = () => void | Promise<void>;

/**
 * Recurso gestionado
 */
export interface ManagedResource {
  id: string;
  type: 'interval' | 'observer' | 'listener' | 'subscription' | 'other';
  cleanup: () => void | Promise<void>;
}

/**
 * Configuración del lifecycle manager
 */
export interface LifecycleConfig {
  autoCleanup: boolean;
  warnOnLeak: boolean;
  leakThreshold: number; // ms
}

const DEFAULT_CONFIG: LifecycleConfig = {
  autoCleanup: true,
  warnOnLeak: true,
  leakThreshold: 5000, // 5 segundos
};

/**
 * Gestor del ciclo de vida de una ficha
 */
export class FichaLifecycleManager {
  private fichaId: string;
  private config: LifecycleConfig;
  private currentPhase: LifecyclePhase = LifecyclePhase.DESTROYED;
  private resources: Map<string, ManagedResource> = new Map();
  private callbacks: Map<LifecyclePhase, LifecycleCallback[]> = new Map();
  private createdAt: number = Date.now();
  private mountedAt: number | null = null;
  private suspendedAt: number | null = null;

  constructor(fichaId: string, config: Partial<LifecycleConfig> = {}) {
    this.fichaId = fichaId;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Inicializar callbacks por fase
    for (const phase of Object.values(LifecyclePhase)) {
      this.callbacks.set(phase as LifecyclePhase, []);
    }
  }

  /**
   * Obtiene la fase actual
   */
  getPhase(): LifecyclePhase {
    return this.currentPhase;
  }

  /**
   * Verifica si está montado
   */
  isMounted(): boolean {
    return this.currentPhase !== LifecyclePhase.DESTROYED;
  }

  /**
   * Verifica si está activo (no suspendido ni destruido)
   */
  isActive(): boolean {
    return (
      this.currentPhase === LifecyclePhase.MOUNTED ||
      this.currentPhase === LifecyclePhase.RESUMED
    );
  }

  /**
   * Transiciona a la fase MOUNTED
   */
  async mount(): Promise<void> {
    if (this.currentPhase !== LifecyclePhase.DESTROYED) {
      throw new Error(`Cannot mount: already in phase ${this.currentPhase}`);
    }

    this.currentPhase = LifecyclePhase.MOUNTED;
    this.mountedAt = Date.now();

    await this.executeCallbacks(LifecyclePhase.MOUNTED);
  }

  /**
   * Transiciona a la fase SUSPENDED
   */
  async suspend(): Promise<void> {
    if (!this.isMounted()) {
      throw new Error(`Cannot suspend: not mounted`);
    }

    this.currentPhase = LifecyclePhase.SUSPENDED;
    this.suspendedAt = Date.now();

    await this.executeCallbacks(LifecyclePhase.SUSPENDED);
  }

  /**
   * Transiciona a la fase RESUMED
   */
  async resume(): Promise<void> {
    if (this.currentPhase !== LifecyclePhase.SUSPENDED) {
      throw new Error(`Cannot resume: not suspended`);
    }

    this.currentPhase = LifecyclePhase.RESUMED;
    this.suspendedAt = null;

    await this.executeCallbacks(LifecyclePhase.RESUMED);
  }

  /**
   * Transiciona a la fase DESTROYED
   */
  async destroy(): Promise<void> {
    if (this.currentPhase === LifecyclePhase.DESTROYED) {
      return; // Ya destruido
    }

    // Limpiar todos los recursos
    await this.cleanupAllResources();

    this.currentPhase = LifecyclePhase.DESTROYED;

    await this.executeCallbacks(LifecyclePhase.DESTROYED);
  }

  /**
   * Registra un callback para una fase
   */
  onPhase(phase: LifecyclePhase, callback: LifecycleCallback): () => void {
    const callbacks = this.callbacks.get(phase) || [];
    callbacks.push(callback);
    this.callbacks.set(phase, callbacks);

    // Retornar función para desuscribirse
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Registra un callback para MOUNTED
   */
  onMount(callback: LifecycleCallback): () => void {
    return this.onPhase(LifecyclePhase.MOUNTED, callback);
  }

  /**
   * Registra un callback para SUSPENDED
   */
  onSuspend(callback: LifecycleCallback): () => void {
    return this.onPhase(LifecyclePhase.SUSPENDED, callback);
  }

  /**
   * Registra un callback para RESUMED
   */
  onResume(callback: LifecycleCallback): () => void {
    return this.onPhase(LifecyclePhase.RESUMED, callback);
  }

  /**
   * Registra un callback para DESTROYED
   */
  onDestroy(callback: LifecycleCallback): () => void {
    return this.onPhase(LifecyclePhase.DESTROYED, callback);
  }

  /**
   * Registra un interval gestionado
   */
  registerInterval(callback: () => void, interval: number): string {
    const id = crypto.randomUUID();
    const intervalId = setInterval(callback, interval);

    this.resources.set(id, {
      id,
      type: 'interval',
      cleanup: () => clearInterval(intervalId),
    });

    return id;
  }

  /**
   * Registra un observer gestionado (MutationObserver, ResizeObserver, etc.)
   */
  registerObserver(observer: { disconnect: () => void }): string {
    const id = crypto.randomUUID();

    this.resources.set(id, {
      id,
      type: 'observer',
      cleanup: () => observer.disconnect(),
    });

    return id;
  }

  /**
   * Registra un event listener gestionado
   */
  registerListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): string {
    const id = crypto.randomUUID();

    this.resources.set(id, {
      id,
      type: 'listener',
      cleanup: () => target.removeEventListener(event, handler, options),
    });

    target.addEventListener(event, handler, options);

    return id;
  }

  /**
   * Registra una suscripción gestionada
   */
  registerSubscription(unsubscribe: () => void): string {
    const id = crypto.randomUUID();

    this.resources.set(id, {
      id,
      type: 'subscription',
      cleanup: unsubscribe,
    });

    return id;
  }

  /**
   * Registra un recurso personalizado
   */
  registerResource(cleanup: () => void | Promise<void>, type: string = 'other'): string {
    const id = crypto.randomUUID();

    this.resources.set(id, {
      id,
      type: type as any,
      cleanup,
    });

    return id;
  }

  /**
   * Desregistra un recurso
   */
  unregisterResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) return false;

    try {
      const result = resource.cleanup();
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Error cleaning up resource ${id}:`, error);
        });
      }
    } catch (error) {
      console.error(`Error cleaning up resource ${id}:`, error);
    }

    return this.resources.delete(id);
  }

  /**
   * Obtiene todos los recursos registrados
   */
  getResources(): ManagedResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Obtiene recursos por tipo
   */
  getResourcesByType(type: string): ManagedResource[] {
    return Array.from(this.resources.values()).filter((r) => r.type === type);
  }

  /**
   * Limpia todos los recursos
   */
  private async cleanupAllResources(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    for (const resource of this.resources.values()) {
      try {
        const result = resource.cleanup();
        if (result instanceof Promise) {
          cleanupPromises.push(result);
        }
      } catch (error) {
        console.error(`Error cleaning up resource ${resource.id}:`, error);
      }
    }

    // Esperar a que se completen todas las limpiezas
    await Promise.all(cleanupPromises);

    this.resources.clear();
  }

  /**
   * Ejecuta callbacks para una fase
   */
  private async executeCallbacks(phase: LifecyclePhase): Promise<void> {
    const callbacks = this.callbacks.get(phase) || [];

    for (const callback of callbacks) {
      try {
        const result = callback();
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.error(`Error executing callback for phase ${phase}:`, error);
      }
    }
  }

  /**
   * Obtiene información del ciclo de vida
   */
  getInfo(): {
    fichaId: string;
    currentPhase: LifecyclePhase;
    isMounted: boolean;
    isActive: boolean;
    resourceCount: number;
    resourcesByType: Record<string, number>;
    createdAt: number;
    mountedAt: number | null;
    suspendedAt: number | null;
    uptime: number;
  } {
    const resourcesByType: Record<string, number> = {};
    for (const resource of this.resources.values()) {
      resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
    }

    return {
      fichaId: this.fichaId,
      currentPhase: this.currentPhase,
      isMounted: this.isMounted(),
      isActive: this.isActive(),
      resourceCount: this.resources.size,
      resourcesByType,
      createdAt: this.createdAt,
      mountedAt: this.mountedAt,
      suspendedAt: this.suspendedAt,
      uptime: this.mountedAt ? Date.now() - this.mountedAt : 0,
    };
  }
}

/**
 * Registry para lifecycle managers por ficha
 */
const lifecycleRegistry = new Map<string, FichaLifecycleManager>();

/**
 * Obtiene o crea un lifecycle manager para una ficha
 */
export function getOrCreateLifecycleManager(
  fichaId: string,
  config?: Partial<LifecycleConfig>
): FichaLifecycleManager {
  let manager = lifecycleRegistry.get(fichaId);
  if (!manager) {
    manager = new FichaLifecycleManager(fichaId, config);
    lifecycleRegistry.set(fichaId, manager);
  }
  return manager;
}

/**
 * Obtiene un lifecycle manager existente
 */
export function getLifecycleManager(fichaId: string): FichaLifecycleManager | undefined {
  return lifecycleRegistry.get(fichaId);
}

/**
 * Elimina un lifecycle manager
 */
export function removeLifecycleManager(fichaId: string): boolean {
  return lifecycleRegistry.delete(fichaId);
}

/**
 * Limpia todos los lifecycle managers
 */
export function clearAllLifecycleManagers(): void {
  lifecycleRegistry.clear();
}
