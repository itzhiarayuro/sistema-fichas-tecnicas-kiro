/**
 * TextEditor - Editor de texto inline con trazabilidad
 * Requirements: 3.2, 5.1-5.4
 * 
 * Proporciona edición directa con click y muestra:
 * - Fuente del dato (Excel, manual, default)
 * - Valor original antes de modificaciones
 * - Timestamp de última modificación
 * - Indicador visual de cambios
 */

'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import type { FieldValue, FieldSource } from '@/types/ficha';
import { TraceabilityTooltip } from '@/components/ui/TraceabilityTooltip';

interface TextEditorProps {
  /** Valor del campo con trazabilidad */
  fieldValue: FieldValue;
  /** Etiqueta del campo */
  label?: string;
  /** Placeholder cuando está vacío */
  placeholder?: string;
  /** Si el campo es editable */
  editable?: boolean;
  /** Si el campo es multilínea */
  multiline?: boolean;
  /** Número de filas para multilínea */
  rows?: number;
  /** Callback cuando cambia el valor */
  onChange?: (value: string) => void;
  /** Callback cuando se confirma el cambio (blur o Enter) */
  onCommit?: (value: string) => void;
  /** Clase CSS adicional */
  className?: string;
  /** Si mostrar el indicador de fuente */
  showSource?: boolean;
  /** Si mostrar el tooltip de trazabilidad */
  showTraceability?: boolean;
  /** Tamaño del texto */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de estilo */
  variant?: 'default' | 'minimal' | 'bordered';
}

const sourceConfig: Record<FieldSource, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  excel: {
    label: 'Excel',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  manual: {
    label: 'Editado',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  default: {
    label: 'Por defecto',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
};

const sizeConfig = {
  sm: 'text-sm px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-base px-4 py-3',
};

export function TextEditor({
  fieldValue,
  label,
  placeholder = 'Sin datos',
  editable = true,
  multiline = false,
  rows = 3,
  onChange,
  onCommit,
  className = '',
  showSource = true,
  showTraceability = true,
  size = 'md',
  variant = 'default',
}: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(fieldValue.value);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local value with prop
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(fieldValue.value);
    }
  }, [fieldValue.value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = useCallback(() => {
    if (editable && !isEditing) {
      setIsEditing(true);
    }
  }, [editable, isEditing]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localValue !== fieldValue.value) {
      onCommit?.(localValue);
    }
  }, [localValue, fieldValue.value, onCommit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(fieldValue.value);
      setIsEditing(false);
    }
  }, [multiline, handleBlur, fieldValue.value]);

  const sourceStyle = sourceConfig[fieldValue.source];
  const hasBeenModified = fieldValue.source === 'manual' && fieldValue.originalValue !== undefined;
  const isValueEmpty = !fieldValue.value || fieldValue.value.trim() === '';

  // Format timestamp for display
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'border-transparent hover:border-gray-200 focus-within:border-primary';
      case 'bordered':
        return `border ${sourceStyle.borderColor}`;
      default:
        return `border ${sourceStyle.borderColor} ${sourceStyle.bgColor}`;
    }
  };

  return (
    <div className={`group relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
          {hasBeenModified && (
            <span className="ml-1 text-yellow-600" title="Campo modificado">
              •
            </span>
          )}
        </label>
      )}

      {/* Editor container */}
      <div
        className={`relative rounded-md transition-all ${getVariantStyles()} ${
          isEditing ? 'ring-2 ring-primary/30 border-primary' : ''
        } ${editable ? 'cursor-text' : 'cursor-default'}`}
        onClick={handleClick}
        onMouseEnter={() => showTraceability && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isEditing ? (
          // Edit mode
          multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              rows={rows}
              placeholder={placeholder}
              className={`w-full bg-transparent border-none outline-none resize-none ${sizeConfig[size]}`}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full bg-transparent border-none outline-none ${sizeConfig[size]}`}
            />
          )
        ) : (
          // Display mode
          <div className={`${sizeConfig[size]} ${isValueEmpty ? 'text-gray-400 italic' : ''}`}>
            {isValueEmpty ? placeholder : fieldValue.value}
            {multiline && fieldValue.value && (
              <div className="whitespace-pre-wrap">{fieldValue.value}</div>
            )}
          </div>
        )}

        {/* Source indicator badge */}
        {showSource && !isEditing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className={`text-xs px-1.5 py-0.5 rounded ${sourceStyle.bgColor} ${sourceStyle.textColor}`}>
              {sourceStyle.label}
            </span>
          </div>
        )}

        {/* Edit indicator */}
        {editable && !isEditing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        )}
      </div>

      {/* Traceability tooltip */}
      {showTraceability && showTooltip && !isEditing && (
        <TraceabilityTooltip
          fieldValue={fieldValue}
          position="bottom"
          alwaysVisible={true}
        >
          <div className="text-xs text-gray-500">Información disponible</div>
        </TraceabilityTooltip>
      )}
    </div>
  );
}

/**
 * TextEditorReadOnly - Versión de solo lectura del TextEditor
 * Útil para mostrar datos con trazabilidad sin permitir edición
 */
export function TextEditorReadOnly({
  fieldValue,
  label,
  showSource = true,
  showTraceability = true,
  size = 'md',
  className = '',
}: Omit<TextEditorProps, 'editable' | 'onChange' | 'onCommit' | 'multiline' | 'rows' | 'placeholder' | 'variant'>) {
  return (
    <TextEditor
      fieldValue={fieldValue}
      label={label}
      editable={false}
      showSource={showSource}
      showTraceability={showTraceability}
      size={size}
      className={className}
      variant="minimal"
    />
  );
}
