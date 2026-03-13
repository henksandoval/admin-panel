import { Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox';
import { AppFormCheckboxNewConfig, AppFormCheckboxNewOptions, FORM_CHECKBOX_NEW_DEFAULT_ERROR_MESSAGES, FORM_CHECKBOX_NEW_DEFAULTS } from './app-form-checkbox.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule, AppCheckboxComponent],
  styleUrl: './app-form-checkbox.component.scss',
  template: `
    <div class="app-form-checkbox-wrapper">
      <app-checkbox
        [checked]="control().value"
        [color]="fullConfig().color"
        [size]="fullConfig().size"
        [labelPosition]="fullConfig().labelPosition"
        [indeterminate]="fullConfig().indeterminate"
        [disabled]="control().disabled"
        [required]="isRequired()"
        [ariaLabel]="fullConfig().ariaLabel"
        (changed)="onCheckboxChange($event)">
        <ng-content/>
      </app-checkbox>

      @if (errorState().shouldShow) {
        <div class="app-form-checkbox-error text-sm mt-1" role="alert" data-testid="form-checkbox-error">
          {{ errorState().message }}
        </div>
      }
    </div>
  `,
})
export class AppFormCheckboxComponent {
  readonly control = input.required<FormControl<boolean>>();
  readonly config = input<AppFormCheckboxNewOptions>({});

  private readonly controlEventTick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events
        .subscribe(() => this.controlEventTick.update(v => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected readonly fullConfig = computed<AppFormCheckboxNewConfig>(() => ({
    ...FORM_CHECKBOX_NEW_DEFAULTS,
    ...this.config()
  }) as AppFormCheckboxNewConfig);

  protected readonly isRequired = computed(() => {
    this.controlEventTick();
    return this.control().hasValidator(Validators.required) || this.control().hasValidator(Validators.requiredTrue);
  });

  protected readonly errorState = computed<ErrorState>(() => {
    this.controlEventTick();
    const ctrl = this.control();
    const shouldShow = ctrl.invalid && ctrl.touched;
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = ctrl.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages ?? {};
    const message = customMessages[errorKey] ?? FORM_CHECKBOX_NEW_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
    return { shouldShow: true, message };
  });

  protected onCheckboxChange(checked: boolean): void {
    this.control().setValue(checked);
    this.control().markAsTouched();
  }
}


