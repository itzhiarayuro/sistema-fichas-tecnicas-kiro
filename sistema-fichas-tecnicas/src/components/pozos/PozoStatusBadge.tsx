/**
 * PozoStatusBadge - Indicador visual de estado del pozo
 * Requirements: 2.5, 16.13
 * 
 * Muestra indicadores claros de estado por ficha:
 * - Completo: todos los datos requeridos y fotos asociadas
 * - Incompleto: faltan datos requeridos
 * - Con advertencias: datos presentes pero con posibles problemas
 * 
 * Sin afectar visualmente a otras fichas (Requirement 16.13)
 */

'use client';

import { Pozo } from '@/types';
import { useGlobalStore } from '@/stores/globalStore';

export type PozoStatusType = 'complete' | 'incomplete' | 'warning';

interface PozoStatusBadgeProps {
  pozo: Pozo;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Extrae el valor de un FieldValue de forma segura
 */
function getFieldValueAsString(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'value' in value) return String(value.value);
  return String(value);
}

/**
 * Determina el estado de completitud de un pozo
 * Analiza datos requeridos y fotos asociadas
 */
export function getPozoStatus(pozo: Pozo, fotosGlobales?: Map<string, any>): PozoStatusType {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!getFieldValueAsString(pozo.idPozo)) issues.push('Código faltante');
  if (!getFieldValueAsString(pozo.direccion)) issues.push('Dirección faltante');
  
  // Check estructura fields - solo como advertencias
  if (!getFieldValueAsString(pozo.elevacion)) warnings.push('Elevación no especificada');
  if (!getFieldValueAsString(pozo.materialTapa)) warnings.push('Material de tapa no especificado');
  if (!getFieldValueAsString(pozo.diametroCilindro)) warnings.push('Diámetro de cilindro no especificado');
  
  // Check photos - buscar en fotos globales si se proporcionan
  let fotosCount = countFotos(pozo);
  if (fotosGlobales) {
    fotosCount = countFotosGlobales(getFieldValueAsString(pozo.idPozo), fotosGlobales);
  }
  
  if (fotosCount === 0) {
    warnings.push('Sin fotos asociadas');
  }
  // Nota: Ya no requerimos foto principal específicamente
  
  // Determine status
  if (issues.length > 0) {
    return 'incomplete';
  }
  if (warnings.length > 0) {
    return 'warning';
  }
  return 'complete';
}

/**
 * Obtiene los detalles de los problemas encontrados
 */
export function getPozoStatusDetails(pozo: Pozo, fotosGlobales?: Map<string, any>): { issues: string[]; warnings: string[] } {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!getFieldValueAsString(pozo.idPozo)) issues.push('Código faltante');
  if (!getFieldValueAsString(pozo.direccion)) issues.push('Dirección faltante');
  
  // Check estructura fields - solo como advertencias, no como problemas
  if (!getFieldValueAsString(pozo.elevacion)) warnings.push('Elevación no especificada');
  if (!getFieldValueAsString(pozo.materialTapa)) warnings.push('Material de tapa no especificado');
  if (!getFieldValueAsString(pozo.diametroCilindro)) warnings.push('Diámetro de cilindro no especificado');
  
  // Check photos - buscar en fotos globales si se proporcionan
  let fotosCount = countFotos(pozo);
  if (fotosGlobales) {
    fotosCount = countFotosGlobales(getFieldValueAsString(pozo.idPozo), fotosGlobales);
  }
  
  if (fotosCount === 0) {
    warnings.push('Sin fotos asociadas');
  }
  // Nota: Ya no requerimos foto principal específicamente
  
  return { issues, warnings };
}

// Helper function to count photos in pozo.fotos
function countFotos(pozo: Pozo): number {
  const { fotos } = pozo;
  return (
    (fotos.principal?.length || 0) +
    (fotos.entradas?.length || 0) +
    (fotos.salidas?.length || 0) +
    (fotos.sumideros?.length || 0) +
    (fotos.otras?.length || 0)
  );
}

// Helper function to count photos in global store
function countFotosGlobales(pozoId: string, fotosGlobales: Map<string, any>): number {
  let count = 0;
  
  // FIX: Problema #2 - Extraer código del pozoId correctamente
  // pozoId viene como "pozo-M680-1234567890-0", necesitamos extraer "M680"
  const codigoMatch = pozoId.match(/^(?:pozo-)?([A-Z]\d+)/);
  const codigo = codigoMatch ? codigoMatch[1] : pozoId;
  
  fotosGlobales.forEach((foto) => {
    // Extract codigo from filename (e.g., M680-P.jpg -> M680)
    const match = foto.filename?.match(/^([A-Z]\d+)/);
    if (match && match[1].toUpperCase() === codigo.toUpperCase()) {
      count++;
    }
  });
  return count;
}

const STATUS_CONFIG: Record<PozoStatusType, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  complete: {
    label: 'Completo',
    bgColor: 'bg-environmental-50',
    textColor: 'text-environmental-700',
    borderColor: 'border-environmental-200',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  incomplete: {
    label: 'Incompleto',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  warning: {
    label: 'Advertencias',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function PozoStatusBadge({ pozo, showLabel = true, size = 'sm' }: PozoStatusBadgeProps) {
  const { photos } = useGlobalStore();
  const status = getPozoStatus(pozo, photos);
  const config = STATUS_CONFIG[status];
  const { issues, warnings } = getPozoStatusDetails(pozo, photos);
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : 'px-3 py-1 text-sm gap-1.5';
  
  // Build tooltip content
  const tooltipContent = [...issues, ...warnings].join('\n');
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses}
      `}
      title={tooltipContent || config.label}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/**
 * Componente para mostrar el detalle de estado en un panel
 */
export function PozoStatusDetail({ pozo }: { pozo: Pozo }) {
  const { photos } = useGlobalStore();
  const status = getPozoStatus(pozo, photos);
  const { issues, warnings } = getPozoStatusDetails(pozo, photos);
  const config = STATUS_CONFIG[status];
  
  if (status === 'complete') {
    return (
      <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
        <div className={`flex items-center gap-2 ${config.textColor}`}>
          {config.icon}
          <span className="font-medium">Datos completos</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Todos los datos requeridos están presentes y hay fotos asociadas.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
      <div className={`flex items-center gap-2 ${config.textColor}`}>
        {config.icon}
        <span className="font-medium">{config.label}</span>
      </div>
      
      {issues.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-red-600 mb-1">Problemas:</p>
          <ul className="text-sm text-red-700 space-y-0.5">
            {issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-red-400">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-yellow-600 mb-1">Advertencias:</p>
          <ul className="text-sm text-yellow-700 space-y-0.5">
            {warnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-yellow-400">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
