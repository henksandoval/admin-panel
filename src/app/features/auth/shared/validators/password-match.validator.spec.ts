import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { passwordMatchValidator } from './password-match.validator';

const VALID_PASSWORD = 'Abc12345';

function buildFormGroup(password: string, confirmValue: string): FormGroup {
  return new FormGroup({
    password: new FormControl(password),
    confirm: new FormControl(confirmValue),
  });
}

describe('passwordMatchValidator', () => {
  it('returns null when passwords match', () => {
    const group = buildFormGroup(VALID_PASSWORD, VALID_PASSWORD);

    expect(passwordMatchValidator(group)).toBeNull();
  });

  it('returns passwordMismatch error when passwords are different', () => {
    const group = buildFormGroup(VALID_PASSWORD, 'Different1');

    expect(passwordMatchValidator(group)).toEqual({ passwordMismatch: true });
  });

  it('returns null when confirm is empty to avoid premature validation errors', () => {
    const group = buildFormGroup(VALID_PASSWORD, '');

    expect(passwordMatchValidator(group)).toBeNull();
  });
});
