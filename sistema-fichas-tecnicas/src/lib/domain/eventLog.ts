/**
 * Event Log Estructurado - Observabilidad interna
 * Requirements: 17.1-17.6
 * 
 * Registra eventos del sistema en un circular buffer (últimos 1000 eventos)
 * con persistencia en IndexedDB para diagnóstico y auditoría.
 */

/**
 * Tipos de eventos
 */
export enum EventType {
  EDIT = 'EDIT',
  UNDO = 'UNDO',
  REDO = 'REDO',
  SNAPSHOT = 'SNAPSHOT',
  TRANSITION = 'TRANSITION',
  ERROR = 'ERROR',
  VALIDATE = 'VALIDATE',
  FINALIZE = 'FINALIZE',
  RESTORE = 'RESTORE',
}

/**
 * Severidad del evento
 */
export enum EventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * Evento estructurado
 */
export interface DomainEvent {
  id: string;
  fichaId: string;
  type: EventType;
  severity: EventSeverity;
  timestamp: number;
  message: string;
  data?: Record<string, unknown>;
  stackTrace?: string;
}

/**
 * Configuración del event log
 */
export interface EventLogConfig {
  maxEvents: number;
  persistToIndexedDB: boolean;
  dbName: string;
  storeName: string;
}

const DEFAULT_CONFIG: EventLogConfig = {
  maxEvents: 1000,
  persistToIndexedDB: true,
  dbName: 'fichas-tecnicas',
  storeName: 'event-log',
};

/**
 * Event Log con circular buffer
 */
export class EventLog {
  private fichaId: string;
  private config: EventLogConfig;
  private events: DomainEvent[] = [];
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;

  constructor(fichaId: string, config: Partial<EventLogConfig> = {}) {
    this.fichaId = fichaId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicializa la base de datos IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.config.persistToIndexedDB) {
      this.isInitialized = true;
      return;
    }

    try {
      const request = indexedDB.open(this.config.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB for event log');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          db.createObjectStore(this.config.storeName, { keyPath: 'id' });
        }
      };

      // Esperar a que se complete
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    } catch (error) {
      console.error('Error initializing event log:', error);
      this.isInitialized = true; // Continuar sin persistencia
    }
  }

  /**
   * Registra un evento
   */
  logEvent(
    type: EventType,
    message: string,
    severity: EventSeverity = EventSeverity.INFO,
    data?: Record<string, unknown>
  ): DomainEvent {
    const event: DomainEvent = {
      id: crypto.randomUUID(),
      fichaId: this.fichaId,
      type,
      severity,
      timestamp: Date.now(),
      message,
      data,
    };

    // Agregar al buffer circular
    this.events.push(event);
    if (this.events.length > this.config.maxEvents) {
      this.events.shift();
    }

    // Persistir si está habilitado
    if (this.config.persistToIndexedDB && this.db) {
      this.persistEvent(event).catch((error) => {
        console.error('Error persisting event:', error);
      });
    }

    return event;
  }

  /**
   * Registra un evento de edición
   */
  logEdit(field: string, oldValue: string, newValue: string): DomainEvent {
    return this.logEvent(
      EventType.EDIT,
      `Field edited: ${field}`,
      EventSeverity.INFO,
      { field, oldValue, newValue }
    );
  }

  /**
   * Registra un evento de undo
   */
  logUndo(action: string): DomainEvent {
    return this.logEvent(EventType.UNDO, `Undo: ${action}`, EventSeverity.INFO);
  }

  /**
   * Registra un evento de redo
   */
  logRedo(action: string): DomainEvent {
    return this.logEvent(EventType.REDO, `Redo: ${action}`, EventSeverity.INFO);
  }

  /**
   * Registra un evento de snapshot
   */
  logSnapshot(trigger: string): DomainEvent {
    return this.logEvent(
      EventType.SNAPSHOT,
      `Snapshot created: ${trigger}`,
      EventSeverity.INFO,
      { trigger }
    );
  }

  /**
   * Registra un evento de transición de estado
   */
  logTransition(fromState: string, toState: string): DomainEvent {
    return this.logEvent(
      EventType.TRANSITION,
      `State transition: ${fromState} → ${toState}`,
      EventSeverity.INFO,
      { fromState, toState }
    );
  }

  /**
   * Registra un evento de error
   */
  logError(message: string, error?: Error, data?: Record<string, unknown>): DomainEvent {
    return this.logEvent(
      EventType.ERROR,
      message,
      EventSeverity.ERROR,
      {
        ...data,
        errorMessage: error?.message,
        errorStack: error?.stack,
      }
    );
  }

  /**
   * Registra un evento de validación
   */
  logValidation(isValid: boolean, errors?: string[]): DomainEvent {
    return this.logEvent(
      EventType.VALIDATE,
      isValid ? 'Validation passed' : 'Validation failed',
      isValid ? EventSeverity.INFO : EventSeverity.WARNING,
      { isValid, errors }
    );
  }

  /**
   * Registra un evento de finalización
   */
  logFinalize(): DomainEvent {
    return this.logEvent(EventType.FINALIZE, 'Ficha finalized', EventSeverity.INFO);
  }

  /**
   * Registra un evento de restauración
   */
  logRestore(snapshotId: string): DomainEvent {
    return this.logEvent(
      EventType.RESTORE,
      `Snapshot restored: ${snapshotId}`,
      EventSeverity.INFO,
      { snapshotId }
    );
  }

  /**
   * Obtiene todos los eventos
   */
  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  /**
   * Obtiene eventos filtrados por tipo
   */
  getEventsByType(type: EventType): DomainEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Obtiene eventos filtrados por severidad
   */
  getEventsBySeverity(severity: EventSeverity): DomainEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  /**
   * Obtiene eventos en un rango de tiempo
   */
  getEventsByTimeRange(startTime: number, endTime: number): DomainEvent[] {
    return this.events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Obtiene los últimos N eventos
   */
  getLastEvents(count: number): DomainEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Limpia el event log
   */
  clear(): void {
    this.events = [];
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.config.storeName], 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        store.clear();
      } catch (error) {
        console.error('Error clearing event log from IndexedDB:', error);
      }
    }
  }

  /**
   * Obtiene estadísticas del event log
   */
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    oldestEvent: DomainEvent | null;
    newestEvent: DomainEvent | null;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      oldestEvent: this.events[0] || null,
      newestEvent: this.events[this.events.length - 1] || null,
    };
  }

  /**
   * Persiste un evento en IndexedDB
   */
  private async persistEvent(event: DomainEvent): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        store.add(event);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Carga eventos desde IndexedDB
   */
  async loadFromIndexedDB(): Promise<DomainEvent[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.config.storeName], 'readonly');
        const store = transaction.objectStore(this.config.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const events = request.result as DomainEvent[];
          this.events = events.slice(-this.config.maxEvents);
          resolve(this.events);
        };

        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exporta el event log como JSON
   */
  export(): string {
    return JSON.stringify(
      {
        fichaId: this.fichaId,
        exportedAt: new Date().toISOString(),
        events: this.events,
        stats: this.getStats(),
      },
      null,
      2
    );
  }
}

/**
 * Registry para event logs por ficha
 */
const eventLogRegistry = new Map<string, EventLog>();

/**
 * Obtiene o crea un event log para una ficha
 */
export function getOrCreateEventLog(
  fichaId: string,
  config?: Partial<EventLogConfig>
): EventLog {
  let log = eventLogRegistry.get(fichaId);
  if (!log) {
    log = new EventLog(fichaId, config);
    eventLogRegistry.set(fichaId, log);
  }
  return log;
}

/**
 * Obtiene un event log existente
 */
export function getEventLog(fichaId: string): EventLog | undefined {
  return eventLogRegistry.get(fichaId);
}

/**
 * Elimina un event log
 */
export function removeEventLog(fichaId: string): boolean {
  return eventLogRegistry.delete(fichaId);
}

/**
 * Limpia todos los event logs
 */
export function clearAllEventLogs(): void {
  eventLogRegistry.clear();
}
