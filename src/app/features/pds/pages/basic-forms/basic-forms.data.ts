import { MatFormFieldAppearance } from '@angular/material/form-field';
import { InputFieldType } from '@shared/atoms/form-field-input/form-field-input.model';
import {PdsApiReferencePropertyModel} from '../../shared/molecules/pds-api-reference/pds-api-reference-property.model';
import {PdsBestPracticeItemModel} from '../../shared/molecules/pds-best-practices/pds-best-practice-item.model';

export type FieldEmphasis = 'high' | 'medium' | 'low';

export interface FieldConfigGuide {
  config: 'basic' | 'with-validation' | 'with-extras';
  title: string;
  description: string;
  whenToUse: string[];
  examples: string[];
  emphasis: FieldEmphasis;
}

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
  'attach_money'
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'config',
    decorator: '@Input()',
    description: 'Objeto de configuración completo del campo.',
    type: 'FormFieldInputOptions',
    defaultValue: '{}'
  },
  {
    name: 'type',
    decorator: '@Input()',
    description: 'Tipo de input HTML.',
    type: "'text' | 'email' | 'password' | 'number' | 'tel'",
    defaultValue: 'text'
  },
  {
    name: 'label',
    decorator: '@Input()',
    description: 'Etiqueta del campo.',
    type: 'string',
    optional: true
  },
  {
    name: 'placeholder',
    decorator: '@Input()',
    description: 'Texto placeholder del input.',
    type: 'string',
    optional: true
  },
  {
    name: 'appearance',
    decorator: '@Input()',
    description: 'Estilo visual del campo.',
    type: "'fill' | 'outline'",
    defaultValue: 'fill'
  },
  {
    name: 'hint',
    decorator: '@Input()',
    description: 'Texto de ayuda debajo del campo.',
    type: 'string',
    optional: true
  },
  {
    name: 'icon',
    decorator: '@Input()',
    description: 'Icono Material al inicio del campo.',
    type: 'string',
    optional: true
  },
  {
    name: 'prefix',
    decorator: '@Input()',
    description: 'Prefijo de texto (ej: "$", "@").',
    type: 'string',
    optional: true
  },
  {
    name: 'suffix',
    decorator: '@Input()',
    description: 'Sufijo de texto (ej: ".00", "km").',
    type: 'string',
    optional: true
  },
  {
    name: 'errorMessages',
    decorator: '@Input()',
    description: 'Mapeo de mensajes de error personalizados.',
    type: 'Record<string, string>',
    optional: true
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  { label: 'Labels', text: 'Usa labels descriptivos que indiquen claramente qué se espera del usuario.' },
  { label: 'Placeholders', text: 'Los placeholders deben ser ejemplos, no instrucciones. Usa hints para instrucciones.' },
  { label: 'Validación', text: 'Muestra errores de validación en tiempo real después del primer intento o blur.' },
  { label: 'Accesibilidad', text: 'Siempre incluye labels, marca campos requeridos y proporciona mensajes de error claros.' }
];
