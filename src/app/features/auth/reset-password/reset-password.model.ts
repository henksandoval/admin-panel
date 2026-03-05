import { FormControl } from '@angular/forms';

export interface ResetPasswordForm {
  password: FormControl<string>;
  confirm:  FormControl<string>;
}

export type ResetPasswordStatus = 'idle' | 'loading' | 'error' | 'success' | 'invalid-token';

export const RESET_PASSWORD_DEFAULTS = {
  status:            'idle' as ResetPasswordStatus,
  errorMessage:      '',
  passwordMinLength: 8,
} as const;

