import { PdsApiReferencePropertyModel } from '../../shared/molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../shared/molecules/pds-best-practices/pds-best-practice-item.model';

export interface FieldExample {
  id: string;
  title: string;
  description: string;
  icon: string;
  formControlName: string;
  configName: string;
  validators: string;
  config: {
    label: string;
    placeholder: string;
    type: string;
    icon?: string;
    hint?: string;
    prefix?: string;
    suffix?: string;
    errorMessages?: Record<string, string>;
  };
}

export const FIELD_EXAMPLES: FieldExample[] = [
  {
    id: 'basic-text',
    title: 'Basic Text',
    description: 'Simple text input without validation',
    icon: 'text_fields',
    formControlName: 'basicText',
    configName: 'basicTextConfig',
    validators: '',
    config: {
      label: 'Full Name',
      placeholder: 'John Doe',
      type: 'text',
      icon: 'person',
      hint: 'Enter your full name'
    }
  },
  {
    id: 'email',
    title: 'Email Field',
    description: 'Email with required and format validation',
    icon: 'email',
    formControlName: 'email',
    configName: 'emailConfig',
    validators: 'Validators.required, Validators.email',
    config: {
      label: 'Email Address',
      placeholder: 'your@email.com',
      type: 'email',
      icon: 'email',
      hint: "We'll never share your email",
      errorMessages: {
        required: 'Email address is required',
        email: 'Please enter a valid email address'
      }
    }
  },
  {
    id: 'password',
    title: 'Password Field',
    description: 'Password with minimum length validation',
    icon: 'lock',
    formControlName: 'password',
    configName: 'passwordConfig',
    validators: 'Validators.required, Validators.minLength(8)',
    config: {
      label: 'Password',
      placeholder: 'Enter secure password',
      type: 'password',
      icon: 'lock',
      prefix: '🔒 ',
      hint: 'Must be at least 8 characters',
      errorMessages: {
        required: 'Password is required',
        minlength: 'Password must be at least 8 characters long'
      }
    }
  },
  {
    id: 'age',
    title: 'Number Field',
    description: 'Number with min/max validation',
    icon: 'cake',
    formControlName: 'age',
    configName: 'ageConfig',
    validators: 'Validators.required, Validators.min(18), Validators.max(99)',
    config: {
      label: 'Age',
      placeholder: '18-99',
      type: 'number',
      icon: 'cake',
      suffix: ' years',
      hint: 'You must be 18 or older',
      errorMessages: {
        required: 'Age is required',
        min: 'You must be at least 18 years old',
        max: 'Please enter a valid age (maximum 99)'
      }
    }
  },
  {
    id: 'phone',
    title: 'Phone Field',
    description: 'Telephone number with prefix',
    icon: 'phone',
    formControlName: 'phone',
    configName: 'phoneConfig',
    validators: 'Validators.required',
    config: {
      label: 'Phone Number',
      placeholder: '(555) 123-4567',
      type: 'tel',
      icon: 'phone',
      prefix: '+1 ',
      hint: 'US phone numbers only',
      errorMessages: {
        required: 'Phone number is required'
      }
    }
  }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'label',
    decorator: '@Input()',
    description: 'Text label displayed above the input field',
    type: 'string',
    optional: true
  },
  {
    name: 'placeholder',
    decorator: '@Input()',
    description: 'Placeholder text shown when field is empty',
    type: 'string',
    optional: true
  },
  {
    name: 'type',
    decorator: '@Input()',
    description: 'HTML input type',
    type: "'text' | 'email' | 'password' | 'number' | 'tel'",
    defaultValue: "'text'"
  },
  {
    name: 'appearance',
    decorator: '@Input()',
    description: 'Material form field appearance style',
    type: "'fill' | 'outline'",
    defaultValue: "'fill'"
  },
  {
    name: 'icon',
    decorator: '@Input()',
    description: 'Material icon name displayed at the end of the field',
    type: 'string',
    optional: true
  },
  {
    name: 'prefix',
    decorator: '@Input()',
    description: 'Text displayed before the input value',
    type: 'string',
    optional: true
  },
  {
    name: 'suffix',
    decorator: '@Input()',
    description: 'Text displayed after the input value',
    type: 'string',
    optional: true
  },
  {
    name: 'hint',
    decorator: '@Input()',
    description: 'Helper text displayed below the field',
    type: 'string',
    optional: true
  },
  {
    name: 'errorMessages',
    decorator: '@Input()',
    description: 'Custom error messages for validators',
    type: 'Record<string, string>',
    optional: true
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  {
    icon: 'label',
    label: 'Clear Labels',
    text: 'Always provide descriptive labels that clearly indicate what information is expected.'
  },
  {
    icon: 'short_text',
    label: 'Helpful Placeholders',
    text: 'Use placeholders for examples (e.g., "john@example.com"), not instructions.'
  },
  {
    icon: 'verified',
    label: 'Validate Early',
    text: 'Show validation errors after the user interacts with the field (on blur or submit).'
  },
  {
    icon: 'accessibility',
    label: 'Accessibility First',
    text: 'Ensure all fields have labels and provide meaningful error messages.'
  },
  {
    icon: 'error_outline',
    label: 'Specific Errors',
    text: 'Provide actionable error messages. Instead of "Invalid", say "Must include @ symbol".'
  },
  {
    icon: 'info',
    label: 'Use Hints Wisely',
    text: 'Hints are perfect for format requirements or privacy notices.'
  },
  {
    icon: 'code',
    label: 'Always Use appFormInputConnector',
    text: 'When using formControlName, ALWAYS add appFormInputConnector directive for validator sync.'
  },
  {
    icon: 'palette',
    label: 'Consistent Style',
    text: 'Use the same appearance throughout your form for visual consistency.'
  }
];
