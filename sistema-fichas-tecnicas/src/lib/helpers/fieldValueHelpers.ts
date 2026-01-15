/**
 * Helpers para trabajar con FieldValue
 * Centraliza la lógica de extracción de valores
 */

import type { FieldValue } from '@/types';

/**
 * Extrae el valor de un FieldValue
 * @param field - El FieldValue a extraer
 * @returns El valor string o string vacío si no existe
 */
export function getFieldValue(field: FieldValue | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && 'value' in field) {
    return field.value ?? '';
  }
  return '';
}

/**
 * Extrae el valor de un FieldValue con valor por defecto
 * @param field - El FieldValue a extraer
 * @param defaultValue - Valor a retornar si el campo está vacío
 * @returns El valor string o el valor por defecto
 */
export function getFieldValueOrDefault(field: FieldValue | undefined, defaultValue: string = '-'): string {
  const value = getFieldValue(field);
  return value || defaultValue;
}

/**
 * Verifica si un FieldValue tiene valor
 * @param field - El FieldValue a verificar
 * @returns true si tiene valor, false si está vacío
 */
export function hasFieldValue(field: FieldValue | undefined): boolean {
  return getFieldValue(field).length > 0;
}
