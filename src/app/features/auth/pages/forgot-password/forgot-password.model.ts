import { FormControl } from '@angular/forms';

export interface ForgotPasswordForm {
  email: FormControl<string>;
}

export type ForgotPasswordStatus = 'idle' | 'loading' | 'error' | 'success';

export const FORGOT_PASSWORD_DEFAULTS = {
  status:       'idle' as ForgotPasswordStatus,
  errorMessage: '',
} as const;
