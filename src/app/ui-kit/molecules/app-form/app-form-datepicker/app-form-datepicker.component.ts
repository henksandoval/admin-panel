import { Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AppFormDatepickerConfig, AppFormDatepickerOptions, FORM_DATEPICKER_DEFAULT_ERROR_MESSAGES, FORM_DATEPICKER_DEFAULTS } from './app-form-datepicker.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-datepicker',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatPrefix, MatInput, MatSuffix, MatIcon, MatHint, MatError, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],
  styleUrl: './app-form-datepicker.component.scss',
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if (fullConfig().label) {
        <mat-label data-testid="datepicker-label">{{ fullConfig().label }}</mat-label>
      }
      @if (fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }
      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="control()"
        [placeholder]="fullConfig().placeholder"
        [min]="fullConfig().minDate"
        [max]="fullConfig().maxDate"
        [attr.aria-label]="fullConfig().ariaLabel"
        [attr.data-testid]="testId() ?? null"
        [required]="isRequired()"
      >
      @if (fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }
      @if (fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }
      <mat-datepicker-toggle matIconSuffix [for]="picker" data-testid="datepicker-toggle"></mat-datepicker-toggle>
      <mat-datepicker #picker [startView]="fullConfig().startView"></mat-datepicker>
      @if (fullConfig().hint) {
        <mat-hint data-testid="datepicker-hint">{{ fullConfig().hint }}</mat-hint>
      }
      @if (errorState().shouldShow) {
        <mat-error data-testid="datepicker-error">{{ errorState().message }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class AppFormDatepickerComponent {
  readonly control = input.required<FormControl<Date | null>>();
  readonly config = input<AppFormDatepickerOptions>({});
  readonly testId = input<string>();

  private readonly controlEventTick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events
        .subscribe(() => this.controlEventTick.update(v => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected readonly fullConfig = computed<AppFormDatepickerConfig>(() => ({
    ...FORM_DATEPICKER_DEFAULTS,
    ...this.config()
  }) as AppFormDatepickerConfig);

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
    const message = customMessages[errorKey] ?? FORM_DATEPICKER_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
    return { shouldShow: true, message };
  });
}
