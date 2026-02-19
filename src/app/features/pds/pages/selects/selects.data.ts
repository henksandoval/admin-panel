import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';
import {
  PdsApiReferencePropertyModel
} from '../../shared/molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../shared/molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from '../../shared/templates/pds-page-layout/pds-variant-guide.model';

export interface SelectStateGuide extends PdsVariantGuideModel {
  readonly variant: 'single' | 'multiple' | 'grouped' | 'disabled';
  readonly state: 'single' | 'multiple' | 'grouped' | 'disabled';
}

export const SELECT_STATE_GUIDES: SelectStateGuide[] = [
  {
    variant: 'single',
    state: 'single',
    title: 'Single Selection',
    description: 'Standard dropdown for selecting one option from a list.',
    whenToUse: [
      'User needs to choose exactly one option',
      'Options are mutually exclusive',
      'List contains 5+ options (use radio for fewer)',
      'Space is limited'
    ],
    examples: [
      'Country selector',
      'Language picker',
      'Sort order',
      'Page size'
    ],
    emphasis: 'high'
  },
  {
    variant: 'multiple',
    state: 'multiple',
    title: 'Multiple Selection',
    description: 'Allow users to select multiple options with checkboxes.',
    whenToUse: [
      'User can select 0 or more options',
      'Selections are independent',
      'Filtering or tagging scenarios',
      'Building lists or collections'
    ],
    examples: [
      'Filter by categories',
      'Select frameworks',
      'Choose tags',
      'Permission settings'
    ],
    emphasis: 'high'
  },
  {
    variant: 'grouped',
    state: 'grouped',
    title: 'Grouped Options',
    description: 'Organize options into logical groups for better scanability.',
    whenToUse: [
      'Large option sets (15+ items)',
      'Options have natural categorization',
      'Improve findability',
      'Reduce cognitive load'
    ],
    examples: [
      'Grouped by region',
      'Categorized products',
      'Department hierarchy',
      'Font families'
    ],
    emphasis: 'medium'
  },
  {
    variant: 'disabled',
    state: 'disabled',
    title: 'Disabled State',
    description: 'Indicate when selection is not currently available.',
    whenToUse: [
      'Action depends on another condition',
      'Read-only forms',
      'Progressive disclosure',
      'Permission restrictions'
    ],
    examples: [
      'Locked fields',
      'View-only mode',
      'Conditional inputs',
      'Restricted access'
    ],
    emphasis: 'low'
  }
];

export const SELECT_DEFAULTS_CONFIG = {
  appearance: 'fill' as const,
  size: 'medium' as const
};

export const COUNTRY_OPTIONS: SelectOption<string>[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' }
];

export const FRAMEWORK_OPTIONS: SelectOption<string>[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' }
];

export const GROUPED_OPTIONS: SelectOption<string>[] = [
  { value: 'angular', label: 'Angular', group: 'Frontend Frameworks' },
  { value: 'react', label: 'React', group: 'Frontend Frameworks' },
  { value: 'vue', label: 'Vue', group: 'Frontend Frameworks' },
  { value: 'express', label: 'Express', group: 'Backend Frameworks' },
  { value: 'nestjs', label: 'NestJS', group: 'Backend Frameworks' },
  { value: 'fastify', label: 'Fastify', group: 'Backend Frameworks' },
  { value: 'postgresql', label: 'PostgreSQL', group: 'Databases' },
  { value: 'mongodb', label: 'MongoDB', group: 'Databases' },
  { value: 'redis', label: 'Redis', group: 'Databases' }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'options',
    decorator: '@Input()',
    type: 'SelectOption<T>[]',
    description: 'Array of options to display in the select dropdown',
    defaultValue: 'required'
  },
  {
    name: 'config',
    decorator: '@Input()',
    type: 'SelectConfig<T>',
    description: 'Configuration object for label, placeholder, appearance, etc.',
    defaultValue: '{}',
    optional: true
  },
  {
    name: 'config.label',
    decorator: '@Input()',
    type: 'string',
    description: 'Label text displayed above the select field',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.placeholder',
    decorator: '@Input()',
    type: 'string',
    description: 'Placeholder text when no option is selected',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.hint',
    decorator: '@Input()',
    type: 'string',
    description: 'Helper text displayed below the select field',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.icon',
    decorator: '@Input()',
    type: 'string',
    description: 'Material Icon name to display as prefix',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.appearance',
    decorator: '@Input()',
    type: "'fill' | 'outline'",
    description: 'Visual style of the form field',
    defaultValue: "'fill'"
  },
  {
    name: 'config.size',
    decorator: '@Input()',
    type: "'small' | 'medium' | 'large'",
    description: 'Size variant of the select field',
    defaultValue: "'medium'"
  },
  {
    name: 'config.multiple',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Enable multiple selection with checkboxes',
    defaultValue: 'false'
  },
  {
    name: 'config.required',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Mark field as required with validation',
    defaultValue: 'false'
  },
  {
    name: 'config.disabled',
    decorator: '@Input()',
    type: 'boolean',
    description: 'Disable the select field',
    defaultValue: 'false'
  },
  {
    name: 'config.errorMessages',
    decorator: '@Input()',
    type: 'Record<string, string>',
    description: 'Custom error messages for validators',
    defaultValue: '{}',
    optional: true
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  {
    icon: 'format_list_numbered',
    label: 'Límite de Opciones',
    text: 'Para más de 15 opciones, considera agregar funcionalidad de búsqueda o usar opciones agrupadas'
  },
  {
    icon: 'check_circle',
    label: 'Selección por Defecto',
    text: 'Para campos requeridos, considera pre-seleccionar un valor sensato para reducir fricción'
  },
  {
    icon: 'label',
    label: 'Labels vs Placeholders',
    text: 'Siempre usa un label. Los placeholders desaparecen al seleccionar, dificultando la revisión de formularios'
  },
  {
    icon: 'sort_by_alpha',
    label: 'Orden Alfabético',
    text: 'Ordena las opciones alfabéticamente a menos que haya un orden lógico (ej: prioridad, frecuencia)'
  },
  {
    icon: 'checklist',
    label: 'Múltiple vs Checkboxes',
    text: 'Usa select múltiple para listas. Para 2-5 opciones, considera checkboxes individuales'
  },
  {
    icon: 'error_outline',
    label: 'Mensajes de Error',
    text: 'Proporciona mensajes de error claros y accionables que indiquen cómo resolver el problema'
  }
];
