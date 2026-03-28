import { FormControl } from '@angular/forms';

export interface LoginForm {
  email:    FormControl<string>;
  password: FormControl<string>;
}

export type LoginStatus = 'idle' | 'loading' | 'error';

export const LOGIN_DEFAULTS = {
  status:           'idle' as LoginStatus,
  errorMessage:     '',
  passwordMinLength: 8,
  rememberMe:       false,
} as const;
