import { RadioOption } from '@shared/molecules/app-form/app-form-radio-group/app-form-radio-group.model';
import { PdsVariantGuideModel } from '../../shared/templates/pds-page-layout/pds-variant-guide.model';

export const RADIO_STATE_GUIDES: PdsVariantGuideModel[] = [
  {
    variant: 'basic',
    title: 'Basic Radio Group',
    description: 'Simple radio group with text labels for mutually exclusive choices.',
    whenToUse: [
      'User must select exactly one option',
      'Options are mutually exclusive',
      'All choices should be visible',
      'Selection is required'
    ],
    examples: [
      'Gender selection',
      'Shipping method',
      'Account type',
      'Subscription plan'
    ],
    emphasis: 'high'
  },
  {
    variant: 'descriptions',
    title: 'With Descriptions',
    description: 'Radio options with additional help text for complex choices.',
    whenToUse: [
      'Options need clarification',
      'Choices have important differences',
      'Users need guidance',
      'Complex decision-making'
    ],
    examples: [
      'Notification preferences',
      'Privacy settings',
      'Plan comparisons',
      'Feature selection'
    ],
    emphasis: 'medium'
  },
  {
    variant: 'horizontal',
    title: 'Horizontal Layout',
    description: 'Radio buttons arranged horizontally for compact spaces.',
    whenToUse: [
      'Space is limited',
      'Options are short',
      'Fewer than 5 options',
      'Inline with other content'
    ],
    examples: [
      'Size selection',
      'Yes/No questions',
      'Rating scales',
      'Simple toggles'
    ],
    emphasis: 'low'
  },
  {
    variant: 'disabled',
    title: 'Disabled State',
    description: 'Radio group in a disabled state showing visual feedback.',
    whenToUse: [
      'Option temporarily unavailable',
      'User lacks permissions',
      'Dependent on other selection',
      'Read-only display'
    ],
    examples: [
      'Unavailable payment method',
      'Locked features',
      'Conditional options',
      'Review mode'
    ],
    emphasis: 'low'
  }
];

export const GENDER_OPTIONS: RadioOption<string>[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

export const SIZE_OPTIONS: RadioOption<string>[] = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' }
];

export const PAYMENT_OPTIONS: RadioOption<string>[] = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank-transfer', label: 'Bank Transfer' }
];

export const NOTIFICATION_OPTIONS: RadioOption<string>[] = [
  { value: 'all', label: 'All notifications' },
  { value: 'important', label: 'Important only' },
  { value: 'none', label: 'No notifications' }
];

export const API_PROPERTIES = [
  {
    name: 'options',
    decorator: '@Input()',
    type: 'RadioOption<T>[]',
    description: 'Array of radio options with value and label',
    defaultValue: 'required'
  },
  {
    name: 'config',
    decorator: '@Input()',
    type: 'AppFormRadioGroupConfig',
    description: 'Configuration object for styling and behavior',
    defaultValue: '{}'
  },
  {
    name: 'config.label',
    decorator: '',
    type: 'string',
    description: 'Label text displayed above the radio group',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.hint',
    decorator: '',
    type: 'string',
    description: 'Helper text displayed below the radio group',
    defaultValue: "''",
    optional: true
  },
  {
    name: 'config.layout',
    decorator: '',
    type: "'vertical' | 'horizontal'",
    description: 'Layout direction of radio buttons',
    defaultValue: "'vertical'"
  },
  {
    name: 'config.showErrors',
    decorator: '',
    type: 'boolean',
    description: 'Whether to show validation error messages',
    defaultValue: 'true'
  },
  {
    name: 'config.errorMessages',
    decorator: '',
    type: 'Record<string, string>',
    description: 'Custom error messages for validation errors',
    defaultValue: '{}',
    optional: true
  }
];

export const BEST_PRACTICES = [
  {
    icon: 'radio_button_checked',
    label: 'Selección Exclusiva',
    text: 'Usa radio buttons para seleccionar exactamente una opción de un conjunto. Para selección múltiple usa checkboxes'
  },
  {
    icon: 'title',
    label: 'Labels Claros',
    text: 'Cada opción debe tener una etiqueta clara y concisa. Agrega descripciones para opciones complejas'
  },
  {
    icon: 'view_list',
    label: 'Layout Vertical',
    text: 'El layout vertical es más fácil de escanear y leer. Usa horizontal solo cuando el espacio es limitado y las opciones son pocas'
  },
  {
    icon: 'settings_suggest',
    label: 'Defaults Sensibles',
    text: 'Cuando sea posible, pre-selecciona la opción más común o recomendada para reducir el esfuerzo del usuario'
  },
  {
    icon: 'filter_2',
    label: 'Limita Opciones',
    text: 'Mantén los grupos de radio entre 2-7 opciones. Para más opciones, considera usar un select dropdown'
  }
];
