import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';
import type {PdsApiReferencePropertyModel, PdsBestPracticeItemModel} from '@shared/molecules';

export interface StateGuide {
  state: 'checked' | 'unchecked' | 'indeterminate';
  title: string;
  description: string;
  whenToUse: string[];
  examples: string[];
  emphasis: StateEmphasis;
}

export type StateEmphasis = 'high' | 'medium' | 'low';

export const CHECKBOX_DEFAULTS = {
  checked: false,
  color: 'primary' as CheckboxColor,
  size: 'medium' as CheckboxSize,
  labelPosition: 'after' as CheckboxLabelPosition,
  disabled: false,
  indeterminate: false,
  required: false
};

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

export const CHECKBOX_COLORS: Array<{ value: CheckboxColor; label: string }> = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' }
];

export const CHECKBOX_SIZES: Array<{ value: CheckboxSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  { label: 'Labels', text: 'Usa textos claros y descriptivos que indiquen qué representa la selección.' },
  { label: 'Agrupación', text: 'Agrupa checkboxes relacionados bajo un título común.' },
  { label: 'Indeterminate', text: 'Usa para "Seleccionar todos" cuando hay selección parcial de elementos hijos.' },
  { label: 'Accesibilidad', text: 'Marca como required los campos obligatorios y usa ariaLabel cuando no hay texto visible.' }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'checked',
    decorator: '@Input()',
    description: 'Estado marcado del checkbox.',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'indeterminate',
    decorator: '@Input()',
    description: 'Estado indeterminado (para selección parcial).',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'color',
    decorator: '@Input()',
    description: 'Color semántico del checkbox.',
    type: "'primary' | 'accent' | 'warn'",
    defaultValue: 'primary'
  },
  {
    name: 'size',
    decorator: '@Input()',
    description: 'Tamaño del checkbox.',
    type: "'small' | 'medium' | 'large'",
    defaultValue: 'medium'
  },
  {
    name: 'labelPosition',
    decorator: '@Input()',
    description: 'Posición del label respecto al checkbox.',
    type: "'before' | 'after'",
    defaultValue: 'after'
  },
  {
    name: 'disabled',
    decorator: '@Input()',
    description: 'Deshabilita el checkbox.',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'required',
    decorator: '@Input()',
    description: 'Marca el campo como requerido.',
    type: 'boolean',
    defaultValue: 'false'
  }
];
