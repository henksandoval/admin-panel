import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { PdsApiReferencePropertyModel } from '../../shared/molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../shared/molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from '../../shared/templates/pds-page-layout/pds-variant-guide.model';

export interface ToggleGroupStateGuide extends PdsVariantGuideModel {
  readonly variant: 'single' | 'multiple' | 'icons' | 'vertical';
  readonly state: 'single' | 'multiple' | 'icons' | 'vertical';
}

export const TOGGLE_GROUP_STATE_GUIDES: ToggleGroupStateGuide[] = [
  {
    variant: 'single',
    state: 'single',
    title: 'Single Selection',
    description: 'Allow users to select one option from a mutually exclusive set.',
    whenToUse: [
      'User must choose exactly one option',
      'Options are mutually exclusive',
      'You have 2-5 options to display',
      'Visual segmented control is preferred over dropdown'
    ],
    examples: [
      'View mode toggle',
      'Sort order',
      'Chart type selector',
      'Payment method'
    ],
    emphasis: 'high'
  },
  {
    variant: 'multiple',
    state: 'multiple',
    title: 'Multiple Selection',
    description: 'Enable users to select multiple options independently.',
    whenToUse: [
      'User can select 0 or more options',
      'Selections are independent of each other',
      'Filtering or toggling multiple states',
      'Quick access to multiple settings'
    ],
    examples: [
      'Text formatting',
      'Filter options',
      'Feature toggles',
      'Multi-select filters'
    ],
    emphasis: 'high'
  },
  {
    variant: 'icons',
    state: 'icons',
    title: 'Icon Toggles',
    description: 'Use icons instead of text labels for compact visual representation.',
    whenToUse: [
      'Space is limited',
      'Icons are universally recognized',
      'Quick visual scanning is important',
      'Formatting toolbars or controls'
    ],
    examples: [
      'Text alignment',
      'View toggles',
      'Tool selection',
      'Editor toolbar'
    ],
    emphasis: 'medium'
  },
  {
    variant: 'vertical',
    state: 'vertical',
    title: 'Vertical Layout',
    description: 'Stack toggle options vertically for narrow spaces or longer labels.',
    whenToUse: [
      'Sidebar or narrow containers',
      'Options have longer text labels',
      'Part of a vertical form layout',
      'Mobile-optimized interfaces'
    ],
    examples: [
      'Sidebar filters',
      'Navigation menu',
      'Settings panel',
      'Mobile layouts'
    ],
    emphasis: 'low'
  }
];

export const ALIGNMENT_OPTIONS: ToggleOption[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' }
];

export const ALIGNMENT_ICON_OPTIONS: ToggleOption[] = [
  { value: 'left', label: 'Align Left', icon: 'format_align_left', ariaLabel: 'Align left' },
  { value: 'center', label: 'Align Center', icon: 'format_align_center', ariaLabel: 'Align center' },
  { value: 'right', label: 'Align Right', icon: 'format_align_right', ariaLabel: 'Align right' },
  { value: 'justify', label: 'Justify', icon: 'format_align_justify', ariaLabel: 'Justify text' }
];

export const FORMATTING_OPTIONS: ToggleOption[] = [
  { value: 'bold', label: 'Bold', icon: 'format_bold' },
  { value: 'italic', label: 'Italic', icon: 'format_italic' },
  { value: 'underline', label: 'Underline', icon: 'format_underlined' }
];

export const VIEW_OPTIONS: ToggleOption[] = [
  { value: 'list', label: 'List View' },
  { value: 'grid', label: 'Grid View' },
  { value: 'timeline', label: 'Timeline View' }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'options',
    decorator: '@Input()',
    type: 'ToggleOption[]',
    description: 'Array of toggle options with value, label, and optional icon',
    defaultValue: 'required'
  },
  {
    name: 'value',
    decorator: '@Model()',
    type: 'string | string[] | null',
    description: 'Selected value(s). Two-way bindable with [(value)]',
    defaultValue: 'null'
  },
  {
    name: 'color',
    decorator: '@Input()',
    type: "'primary' | 'secondary' | 'tertiary'",
    description: 'Color theme of the toggle group',
    defaultValue: "'primary'"
  },
  {
    name: 'size',
    decorator: '@Input()',
    type: "'small' | 'medium' | 'large'",
    description: 'Size variant of the toggle buttons',
    defaultValue: "'medium'"
  },
  {
    name: 'appearance',
    decorator: '@Input()',
    type: "'standard' | 'legacy'",
    description: 'Visual style variant',
    defaultValue: "'standard'"
  },
  {
    name: 'multiple',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Enable multiple selection mode',
    defaultValue: 'false'
  },
  {
    name: 'vertical',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Stack toggles vertically instead of horizontally',
    defaultValue: 'false'
  },
  {
    name: 'disabled',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Disable the entire toggle group',
    defaultValue: 'false'
  },
  {
    name: 'hideSingleSelectionIndicator',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Hide the selection indicator in single-select mode',
    defaultValue: 'false'
  },
  {
    name: 'hideMultipleSelectionIndicator',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Hide the selection indicators in multi-select mode',
    defaultValue: 'false'
  },
  {
    name: 'changed',
    decorator: '@Output()',
    type: 'EventEmitter<string | string[]>',
    description: 'Emits when selection changes',
    optional: true
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  {
    icon: 'filter_2',
    label: 'Opciones Limitadas',
    text: 'Usa toggle groups para 2-5 opciones. Para más opciones, considera un select o radio buttons'
  },
  {
    icon: 'title',
    label: 'Labels Claros',
    text: 'Las etiquetas deben ser cortas, claras y mutuamente exclusivas. Evita ambigüedad'
  },
  {
    icon: 'emoji_symbols',
    label: 'Iconos Reconocibles',
    text: 'Cuando uses iconos sin texto, asegúrate de que sean universalmente reconocidos y agrega aria-label'
  },
  {
    icon: 'toggle_on',
    label: 'Estado Inicial',
    text: 'Para single selection, considera tener una opción pre-seleccionada por defecto'
  },
  {
    icon: 'layers',
    label: 'Agrupación Lógica',
    text: 'Agrupa opciones relacionadas juntas. No mezcles categorías diferentes en un mismo toggle group'
  },
  {
    icon: 'visibility',
    label: 'Feedback Visual',
    text: 'El estado seleccionado debe ser claramente visible y distinguible del no seleccionado'
  }
];
