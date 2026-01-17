import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';

/**
 * Valores por defecto del componente Checkbox
 */
export const CHECKBOX_DEFAULTS = {
  checked: false,
  color: 'primary' as CheckboxColor,
  size: 'medium' as CheckboxSize,
  labelPosition: 'after' as CheckboxLabelPosition,
  disabled: false,
  indeterminate: false,
  required: false
};

/**
 * Tipo de énfasis para estados del checkbox
 */
export type StateEmphasis = 'high' | 'medium' | 'low';

/**
 * Guía de estados del checkbox
 */
export interface StateGuide {
  state: 'checked' | 'unchecked' | 'indeterminate';
  title: string;
  description: string;
  whenToUse: string[];
  examples: string[];
  emphasis: StateEmphasis;
}

export const STATE_GUIDES: StateGuide[] = [
  {
    state: 'checked',
    title: 'Checked State',
    description: 'Estado activo cuando la opción está seleccionada. Indica que el usuario ha elegido esta opción de manera explícita.',
    whenToUse: [
      'El usuario ha confirmado una elección',
      'Una opción binaria está activada',
      'Un elemento de lista está seleccionado',
      'Se han aceptado términos o condiciones'
    ],
    examples: [
      'Acepto términos y condiciones',
      'Recordar sesión',
      'Suscribirse al newsletter'
    ],
    emphasis: 'high'
  },
  {
    state: 'unchecked',
    title: 'Unchecked State',
    description: 'Estado por defecto cuando ninguna selección ha sido hecha. Representa una opción disponible pero no elegida.',
    whenToUse: [
      'Estado inicial de opciones',
      'Opción desactivada por el usuario',
      'Elemento no seleccionado en lista',
      'Configuración deshabilitada'
    ],
    examples: [
      'Opción disponible sin seleccionar',
      'Filtro no aplicado',
      'Configuración desactivada'
    ],
    emphasis: 'medium'
  },
  {
    state: 'indeterminate',
    title: 'Indeterminate State',
    description: 'Estado intermedio que indica una selección parcial. Comúnmente usado en checkboxes "Seleccionar todos" cuando solo algunos elementos están marcados.',
    whenToUse: [
      'Selección parcial de elementos hijos',
      'Estado ambiguo entre checked/unchecked',
      'Checkbox padre con hijos parcialmente seleccionados',
      'Indicar que hay subelementos con estados mixtos'
    ],
    examples: [
      'Seleccionar todos (algunos seleccionados)',
      'Categoría con ítems parcialmente marcados',
      'Grupo con opciones mixtas'
    ],
    emphasis: 'medium'
  }
];

/**
 * Colores disponibles para el checkbox
 */
export const CHECKBOX_COLORS: Array<{ value: CheckboxColor; label: string }> = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' }
];

/**
 * Tamaños disponibles para el checkbox
 */
export const CHECKBOX_SIZES: Array<{ value: CheckboxSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

/**
 * Posiciones del label
 */
export const LABEL_POSITIONS: Array<{ value: CheckboxLabelPosition; label: string }> = [
  { value: 'after', label: 'After (Default)' },
  { value: 'before', label: 'Before' }
];

