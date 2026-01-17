import { MatFormFieldAppearance } from '@angular/material/form-field';
import { InputFieldType, FormFieldInputOptions } from '@shared/atoms/form-field-input/form-field-input.model';

export const FORM_FIELD_DEFAULTS = {
  type: 'text' as InputFieldType,
  appearance: 'fill' as MatFormFieldAppearance,
  label: '',
  placeholder: '',
  hint: '',
  icon: '',
  prefix: '',
  suffix: '',
  ariaLabel: ''
};

export type FieldEmphasis = 'high' | 'medium' | 'low';

export interface FieldConfigGuide {
  config: 'basic' | 'with-validation' | 'with-extras';
  title: string;
  description: string;
  whenToUse: string[];
  examples: string[];
  emphasis: FieldEmphasis;
}

export const FIELD_CONFIG_GUIDES: FieldConfigGuide[] = [
  {
    config: 'basic',
    title: 'Basic Configuration',
    description: 'Campo de texto simple sin validaciones ni extras visuales. Ideal para formularios sencillos donde solo necesitas capturar texto.',
    whenToUse: [
      'Formularios de comentarios o notas',
      'Campos opcionales sin validación',
      'Prototipos rápidos',
      'Inputs de búsqueda simple'
    ],
    examples: [
      'Campo de comentarios',
      'Notas adicionales',
      'Búsqueda básica'
    ],
    emphasis: 'low'
  },
  {
    config: 'with-validation',
    title: 'With Validation',
    description: 'Campo con validaciones activas (required, email, minLength, etc.). Muestra mensajes de error personalizados y feedback visual al usuario.',
    whenToUse: [
      'Formularios de registro o login',
      'Datos críticos que requieren validación',
      'Campos obligatorios en cualquier contexto',
      'Inputs con formato específico (email, teléfono)'
    ],
    examples: [
      'Email (required + email validator)',
      'Password (required + minLength)',
      'Age (required + min + max)'
    ],
    emphasis: 'high'
  },
  {
    config: 'with-extras',
    title: 'With Visual Extras',
    description: 'Campo completo con todas las características visuales: iconos, prefijos, sufijos, hints. Mejora la UX mostrando contexto adicional al usuario.',
    whenToUse: [
      'Formularios complejos con mucha información',
      'Campos que requieren contexto adicional',
      'Inputs con unidades específicas (moneda, medidas)',
      'Mejora de accesibilidad con iconos descriptivos'
    ],
    examples: [
      'Precio ($, icon: attach_money)',
      'URL (prefix: https://, icon: link)',
      'Username (@, icon: person)'
    ],
    emphasis: 'medium'
  }
];

export const INPUT_TYPES: Array<{ value: InputFieldType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Telephone' }
];

export const FIELD_APPEARANCES: Array<{ value: MatFormFieldAppearance; label: string }> = [
  { value: 'fill', label: 'Fill (Default)' },
  { value: 'outline', label: 'Outline' }
];

export const COMMON_ICONS = [
  'person',
  'email',
  'lock',
  'visibility',
  'phone',
  'search',
  'edit',
  'star',
  'attach_money',
  'link',
  'calendar_today',
  'location_on'
];
