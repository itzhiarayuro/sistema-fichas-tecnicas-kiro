/**
 * Módulo de generación de PDF
 * Requirements: 7.1-7.6
 * 
 * Exporta pdfmake como único generador de PDF con sistemas de prevención de errores,
 * monitoreo, recuperación y compatibilidad cross-browser
 */

// Generador pdfmake
export {
  PDFMakeGenerator,
  type PDFGeneratorOptions,
  type PDFGenerationResult,
} from './pdfMakeGenerator';

// Generador en lote con pdfmake
export {
  BatchGeneratorPdfMake,
  type BatchItem,
  type BatchProgress,
  type BatchError,
  type BatchResult,
  type ProgressCallback,
} from './batchGeneratorPdfMake';

// Validation Engine
export {
  validatePozoForPDF,
  validatePozosForPDF,
  getPDFValidationSummary,
  type PDFValidationError,
  type PDFValidationResult,
} from './pdfValidationEngine';

// Error Prevention System
export {
  checkDependencies,
  validateEnvironment,
  preventKnownIssues,
  getRecoveryRecommendations,
  logErrorForAnalysis,
  type DependencyStatus,
  type EnvironmentStatus,
  type PreventionResult,
} from './errorPreventionSystem';

// Note: optimizeForBrowser is exported from crossBrowserCompatibility below

// Resource Management System
export {
  estimateMemoryUsage,
  estimateGenerationTime,
  estimateResources,
  processPhotosForPDF,
  processPholosInBatches,
  reduceImageQuality,
  releaseMemory,
  MemoryMonitor,
  type ResourceEstimate,
  type MemorySnapshot,
} from './resourceManagementSystem';

// Recovery System
export {
  getRecommendedStrategies,
  attemptRecovery,
  RecoveryStateManager,
  saveProgressState,
  restoreProgressState,
  clearProgressState,
  ErrorLearningSystem,
  type RecoveryAttempt,
  type RecoveryState,
  type FallbackStrategy,
} from './recoverySystem';

// Monitoring System
export {
  PDFGenerationMonitor,
  globalMonitor,
  investigateSlowGeneration,
  type GenerationMetadata,
  type PerformanceMetrics,
  type SystemHealth,
  type HealthReport,
} from './monitoringSystem';

// Debug Logger
export { debugLogger, type LogEntry } from './debugLogger';

// Format Templates
export {
  getFormato,
  getFormatosActivos,
  actualizarFormato,
  crearFormatoPersonalizado,
  eliminarFormato,
  exportarFormatos,
  importarFormatos,
  FORMATOS_ESTANDAR,
  type FormatoTemplate,
  type FotoTipo,
  type FotoPlaceholder,
} from './formatTemplates';

// Dynamic Format Calculator
export {
  analizarFotos,
  calcularFormatoDinamico,
  recomendarFormato,
  exportarAnalisis,
  type FotoAnalisis,
  type CalculoFormatoResult,
} from './dynamicFormatCalculator';
// Cross-Browser Compatibility
export {
  detectBrowser,
  validateBrowserCompatibility,
  supportsBlob,
  supportsPromise,
  supportsArrayBuffer,
  supportsTextEncoder,
  supportsPerformanceMemory,
  getBlobAlternative,
  optimizeForBrowser,
  handleJavaScriptDifferences,
  validateFeatureSupport,
  getFeatureAlternative,
  showBrowserWarning,
  getCompatibilityReport,
  type BrowserInfo,
  type CompatibilityResult,
} from './crossBrowserCompatibility';

// Dependency Validator
export {
  checkAllDependencies,
  getDependencyReport,
  startPeriodicDependencyCheck,
  type DependencyCheckResult,
} from './dependencyValidator';

// Server-specific pdfmake initialization
export {
  getPdfMakeForServer,
  isServerPdfMakeReady,
  resetServerPdfMake,
} from './pdfMakeServerInit';
