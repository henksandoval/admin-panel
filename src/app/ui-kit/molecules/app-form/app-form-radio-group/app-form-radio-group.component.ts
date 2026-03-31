import { Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { AppRadioComponent } from '@ui-atoms/app-radio';
import {
  AppFormRadioGroupConfig,
  AppFormRadioGroupOptions,
  FORM_RADIO_GROUP_DEFAULT_ERROR_MESSAGES,
  FORM_RADIO_GROUP_DEFAULTS,
  RadioOption
} from './app-form-radio-group.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-radio-group',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, AppRadioComponent],
  styleUrl: './app-form-radio-group.component.scss',
  template: `
    <div class="app-form-radio-group-wrapper" data-testid="radio-group-wrapper">
      @if (fullConfig().label) {
        <label class="app-form-radio-group-label mat-label-large" data-testid="radio-group-label">
          {{ fullConfig().label }}
          @if (isRequired()) {
            <span data-testid="radio-group-required-indicator">*</span>
          }
        </label>
      }

      <mat-radio-group
        class="app-form-radio-group-options"
        data-testid="radio-group"
        [class.app-form-radio-group-layout-horizontal]="fullConfig().layout === 'horizontal'"
        [formControl]="control()">
        @for (option of options(); track option.value) {
          <app-radio
            [attr.data-testid]="'radio-option-' + option.value"
            [value]="option.value"
            [disabled]="option.disabled || false">
            {{ option.label }}
          </app-radio>
        }
      </mat-radio-group>

      @if (fullConfig().hint) {
        <div class="app-form-radio-group-hint mat-label-small" data-testid="radio-group-hint">{{ fullConfig().hint }}</div>
      }

      @if (errorState().shouldShow) {
        <div class="app-form-radio-group-error mat-label-large" role="alert" data-testid="radio-group-error">
          {{ errorState().message }}
        </div>
      }
    </div>
  `,
})
export class AppFormRadioGroupComponent<T = any> {
  readonly control = input.required<FormControl<T | null>>();
  readonly options = input.required<RadioOption<T>[]>();
  readonly config = input<AppFormRadioGroupOptions>({});
  protected readonly fullConfig = computed<AppFormRadioGroupConfig>(() => ({
    ...FORM_RADIO_GROUP_DEFAULTS,
    ...this.config()
  }) as AppFormRadioGroupConfig);
  private readonly controlEventTick = signal(0);
  protected readonly isRequired = computed(() => {
    this.controlEventTick();
    return this.control().hasValidator(Validators.required);
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
    const message = customMessages[errorKey] ?? FORM_RADIO_GROUP_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
    return { shouldShow: true, message };
  });

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events
        .subscribe(() => this.controlEventTick.update(v => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
