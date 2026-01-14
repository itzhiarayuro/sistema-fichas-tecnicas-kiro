/**
 * TraceabilityTooltip - Tooltip que muestra el origen y trazabilidad de datos
 * Requirements: 5.1-5.3
 * 
 * Muestra información detallada sobre:
 * - Origen del dato (Excel, manual, default)
 * - Valor original antes de modificaciones
 * - Timestamp de última modificación
 * - Indicador visual del tipo de fuente
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { FieldValue, FieldSource } from '@/types/ficha';

interface TraceabilityTooltipProps {
  /** Valor del campo con trazabilidad */
  fieldValue: FieldValue;
  /** Elemento hijo que activa el tooltip */
  children: React.ReactNode;
  /** Posición del tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Si mostrar siempre o solo en hover */
  alwaysVisible?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const sourceConfig: Record<FieldSource, { 
  label: string; 
  description: string;
  icon: string;
  bgColor: string; 
  textColor: string; 
  borderColor: string;
}> = {
  excel: {
    label: 'Importado de Excel',
    description: 'Este dato fue cargado desde el archivo Excel',
    icon: '📊',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  manual: {
    label: 'Editado manualmente',
    description: 'Este dato fue modificado por el usuario',
    icon: '✏️',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  default: {
    label: 'Valor por defecto',
    description: 'Este es un valor por defecto del sistema',
    icon: '⚙️',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
};

const positionClasses = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'No disponible';
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TraceabilityTooltip({
  fieldValue,
  children,
  position = 'top',
  alwaysVisible = false,
  className = '',
}: TraceabilityTooltipProps) {
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const config = sourceConfig[fieldValue.source];
  const hasOriginalValue = fieldValue.originalValue && fieldValue.originalValue !== fieldValue.value;

  // Handle click outside to close tooltip
  useEffect(() => {
    if (!alwaysVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
        }
      };

      if (isVisible) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }
  }, [isVisible, alwaysVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => !alwaysVisible && setIsVisible(true)}
      onMouseLeave={() => !alwaysVisible && setIsVisible(false)}
    >
      {/* Trigger element */}
      <div className="cursor-help">{children}</div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 w-64 p-3 rounded-lg shadow-lg border
            ${config.bgColor} ${config.borderColor}
            ${positionClasses[position]}
            animate-in fade-in duration-200
          `}
        >
          {/* Header with source */}
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">{config.icon}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${config.textColor}`}>
                {config.label}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-300 opacity-30 my-2"></div>

          {/* Current value */}
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Valor actual:</p>
            <p className="text-sm text-gray-800 break-words bg-white bg-opacity-50 p-2 rounded border border-gray-200">
              {fieldValue.value || '(vacío)'}
            </p>
          </div>

          {/* Original value if modified */}
          {hasOriginalValue && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-600 mb-1">Valor original:</p>
              <p className="text-sm text-gray-700 break-words bg-white bg-opacity-50 p-2 rounded border border-gray-200">
                {fieldValue.originalValue}
              </p>
            </div>
          )}

          {/* Modification timestamp */}
          {fieldValue.modifiedAt && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Última modificación:</p>
              <p className="text-xs text-gray-600">
                {formatDate(fieldValue.modifiedAt)}
              </p>
            </div>
          )}

          {/* Arrow pointer */}
          <div
            className={`
              absolute w-2 h-2 bg-inherit border-inherit
              ${
                position === 'top'
                  ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1 border-r border-b'
                  : position === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1 border-l border-t'
                  : position === 'left'
                  ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1 border-t border-r'
                  : 'right-full top-1/2 -translate-y-1/2 translate-x-1 border-b border-l'
              }
            `}
          ></div>
        </div>
      )}
    </div>
  );
}
