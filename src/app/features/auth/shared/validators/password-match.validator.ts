import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm  = control.get('confirm');

  if (!password || !confirm) return null;
  if (confirm.value === '') return null;

  return password.value === confirm.value ? null : { passwordMismatch: true };
}

