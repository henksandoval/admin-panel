import { FormControl } from '@angular/forms';

export interface RegisterForm {
  displayName: FormControl<string>;
  email:       FormControl<string>;
  password:    FormControl<string>;
  confirm:     FormControl<string>;
}

export type RegisterStatus = 'idle' | 'loading' | 'error' | 'success';

export const REGISTER_DEFAULTS = {
  status:            'idle' as RegisterStatus,
  errorMessage:      '',
  passwordMinLength: 8,
} as const;

