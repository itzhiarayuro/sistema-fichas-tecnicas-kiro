# System Boundaries - Sistema de Fichas Técnicas de Pozos

## Overview

Este documento define explícitamente los límites del Sistema de Fichas Técnicas de Pozos, incluyendo qué hace, qué NO hace, y las limitaciones técnicas.

## Qué Hace el Sistema

### Core Functionality

1. **Local-First Architecture**
   - Toda la información se almacena localmente en el navegador (IndexedDB, localStorage)
   - No hay sincronización con servidores remotos
   - Los datos nunca salen del navegador del usuario

2. **Edición de Fichas Técnicas**
   - Carga de datos desde archivos Excel
   - Asociación automática de fotografías mediante nomenclatura
   - Editor visual en tiempo real con sincronización bidireccional
   - Edición inline de campos
   - Reordenamiento de secciones mediante drag & drop
   - Redimensionamiento de imágenes

3. **Generación de PDF**
   - Generación de PDFs individuales de fichas
   - Generación en lote de múltiples fichas
   - Personalización de formato (colores, fuentes, espaciado)
   - Compresión de imágenes para optimizar tamaño
   - Descarga directa o como archivo ZIP

4. **Persistencia Local**
   - Guardado automático cada 30 segundos
   - Snapshots para recuperación ante fallos
   - Historial de cambios (undo/redo)
   - Exportación e importación de configuraciones

5. **Validación y Robustez**
   - Validación no bloqueante de datos
   - Manejo gracioso de errores
   - Recuperación automática ante fallos
   - Protección contra acciones destructivas

6. **Observabilidad Interna**
   - Event log estructurado (últimos 1000 eventos)
   - State machine explícito
   - Lifecycle management
   - Trazabilidad de datos (origen de cada valor)

## Qué NO Hace el Sistema

### Out of Scope

1. **Multiusuario**
   - No hay soporte para múltiples usuarios editando la misma ficha
   - No hay sincronización entre dispositivos
   - No hay control de acceso o permisos
   - No hay auditoría de cambios por usuario

2. **Sincronización Remota**
   - No hay API para guardar en servidor
   - No hay sincronización en la nube
   - No hay backup automático en servidor
   - No hay versionado remoto

3. **Validación Legal/Normativa**
   - No valida cumplimiento de normativas específicas
   - No verifica requisitos legales
   - No genera reportes de cumplimiento
   - No integra con sistemas de auditoría externa

4. **Versionado de PDF**
   - No mantiene historial de PDFs generados
   - No permite comparar versiones de PDFs
   - No genera reportes de cambios entre versiones

5. **Integración con Sistemas Externos**
   - No se conecta a bases de datos externas
   - No integra con sistemas GIS
   - No sincroniza con aplicaciones de terceros
   - No tiene API REST para consumo externo

6. **Análisis Avanzado**
   - No genera reportes estadísticos
   - No hace análisis de datos
   - No predice problemas
   - No sugiere mejoras basadas en datos

## Limitaciones Técnicas

### Tamaños Máximos

```typescript
const SIZE_LIMITS = {
  maxFichaSize: 50 * 1024 * 1024,      // 50 MB por ficha
  maxPhotoSize: 10 * 1024 * 1024,      // 10 MB por foto
  maxPhotoCount: 100,                   // 100 fotos máximo
  maxBase64Size: 15 * 1024 * 1024,     // 15 MB para base64
  maxFieldLength: 10000,                // 10,000 caracteres por campo
};
```

### Límites de Almacenamiento

- **IndexedDB**: Típicamente 50 MB por origen (varía según navegador)
- **localStorage**: Típicamente 5-10 MB por origen
- **Total disponible**: Depende del navegador y configuración del usuario

### Límites de Rendimiento

- **Máximo de fichas**: ~1000 fichas (depende de tamaño de datos)
- **Máximo de secciones por ficha**: 100
- **Máximo de errores por ficha**: 1000
- **Máximo de snapshots**: 10 por ficha
- **Máximo de eventos en log**: 1000 por ficha

### Compatibilidad de Navegadores

- **Requerimientos**: Navegadores modernos con soporte para:
  - ES2020+
  - IndexedDB
  - Blob API
  - Canvas API (para PDF)
  - Web Workers (opcional)

- **Navegadores soportados**:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
  - Opera 76+

### Formatos Soportados

**Entrada:**
- Excel: `.xlsx`, `.xls`
- Imágenes: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

**Salida:**
- PDF: `.pdf`
- ZIP: `.zip` (para lotes)

## Arquitectura y Decisiones de Diseño

### Local-First by Design

El sistema está diseñado como local-first por razones de:
- **Privacidad**: Los datos nunca salen del navegador
- **Rendimiento**: No hay latencia de red
- **Disponibilidad**: Funciona sin conexión a internet
- **Simplicidad**: No requiere backend

### Aislamiento Total entre Fichas

Cada ficha es una unidad completamente independiente:
- Errores en una ficha no afectan otras
- Personalizaciones son locales por ficha
- Estado es completamente aislado
- Permite recuperación granular

### Fail-Safe by Default

El sistema está diseñado para nunca romper:
- Validación no bloqueante
- Valores por defecto seguros
- Recuperación automática
- Snapshots automáticos

## Trabajo Futuro

### Posibles Extensiones

1. **Sincronización Remota (CRDT)**
   - Implementar Conflict-free Replicated Data Types
   - Sincronización P2P entre dispositivos
   - Merge automático de cambios

2. **Multiusuario**
   - Agregar backend para almacenamiento
   - Implementar control de acceso
   - Agregar auditoría de cambios
   - Soporte para colaboración en tiempo real

3. **Integración Externa**
   - API REST para consumo externo
   - Webhooks para eventos
   - Integración con GIS
   - Sincronización con bases de datos

4. **Análisis y Reportes**
   - Generación de reportes estadísticos
   - Análisis de tendencias
   - Predicción de problemas
   - Sugerencias automáticas

5. **Versionado Avanzado**
   - Historial de PDFs generados
   - Comparación entre versiones
   - Reportes de cambios
   - Auditoría de cambios

## Configuración y Personalización

### Variables de Entorno

```env
# Límites de tamaño (en bytes)
NEXT_PUBLIC_MAX_FICHA_SIZE=52428800
NEXT_PUBLIC_MAX_PHOTO_SIZE=10485760
NEXT_PUBLIC_MAX_PHOTOS=100

# Configuración de persistencia
NEXT_PUBLIC_AUTO_SAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_SNAPSHOTS=10
NEXT_PUBLIC_MAX_HISTORY=50

# Configuración de seguridad
NEXT_PUBLIC_ENABLE_SECURITY_LAYER=true
NEXT_PUBLIC_SANITIZE_HTML=true
```

### Configuración en Tiempo de Ejecución

```typescript
import { getSecurityLayer } from '@/lib/security/securityLayer';

// Personalizar límites de tamaño
const security = getSecurityLayer({
  maxFichaSize: 100 * 1024 * 1024, // 100 MB
  maxPhotoSize: 20 * 1024 * 1024,  // 20 MB
});
```

## Monitoreo y Diagnóstico

### Event Log

El sistema mantiene un event log estructurado con los últimos 1000 eventos:

```typescript
import { getEventLog } from '@/lib/domain/eventLog';

const log = getEventLog(fichaId);
const stats = log.getStats();
console.log(stats);
// {
//   totalEvents: 150,
//   eventsByType: { EDIT: 100, UNDO: 20, SNAPSHOT: 30 },
//   eventsBySeverity: { INFO: 140, WARNING: 10, ERROR: 0 },
//   oldestEvent: {...},
//   newestEvent: {...}
// }
```

### State Machine

Cada ficha tiene una máquina de estados explícita:

```typescript
import { getStateMachine } from '@/lib/domain/fichaStateMachine';

const machine = getStateMachine(fichaId);
const info = machine.getInfo();
console.log(info);
// {
//   fichaId: 'ficha-123',
//   currentState: 'editing',
//   validEvents: ['COMPLETE', 'FINALIZE', 'RESET'],
//   transitionCount: 5,
//   isFinalized: false
// }
```

### Lifecycle Management

Monitoreo del ciclo de vida de fichas:

```typescript
import { getLifecycleManager } from '@/lib/lifecycle/fichaLifecycleManager';

const lifecycle = getLifecycleManager(fichaId);
const info = lifecycle.getInfo();
console.log(info);
// {
//   fichaId: 'ficha-123',
//   currentPhase: 'mounted',
//   resourceCount: 5,
//   uptime: 3600000
// }
```

## Seguridad

### Sanitización

- HTML sanitizado para prevenir XSS
- Texto limpiado de caracteres de control
- Validación de tipos MIME

### Validación

- Validación de tamaños de archivos
- Validación de base64
- Validación de coordenadas geográficas
- Validación de fechas

### Protección

- Confirmación doble para acciones destructivas
- Snapshots automáticos antes de acciones críticas
- Recuperación automática ante fallos
- Aislamiento total entre fichas

## Conclusión

El Sistema de Fichas Técnicas de Pozos es un sistema local-first, robusto y aislado diseñado para edición y generación de fichas técnicas. Sus límites explícitos permiten extensiones futuras sin comprometer la estabilidad actual.

Para más información sobre arquitectura, ver `ARQUITECTURA_FORMAL_FICHAS.md`.
