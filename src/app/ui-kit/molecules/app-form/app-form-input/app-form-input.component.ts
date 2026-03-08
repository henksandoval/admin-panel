import { Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AppFormInputConfig, AppFormInputOptions, FORM_INPUT_DEFAULT_ERROR_MESSAGES, FORM_INPUT_DEFAULTS } from './app-form-input.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  styleUrl: './app-form-input.component.scss',
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if (fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }
      @if (fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }
      <input
        matInput
        [type]="fullConfig().type"
        [formControl]="control()"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
        [attr.data-testid]="testId() ?? null"
        [required]="isRequired()"
      >
      @if (fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }
      @if (fullConfig().icon) {
        <mat-icon matSuffix [ngClass]="{ 'app-form-input-icon-clickable': isIconClickable() }" (click)="onIconClick($event)">{{ fullConfig().icon }}</mat-icon>
      }
      @if (fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }
      @if (errorState().shouldShow) {
        <mat-error>{{ errorState().message }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class AppFormInputComponent {
  readonly control = input.required<FormControl<string>>();
  readonly config = input<AppFormInputOptions>({});
  readonly testId = input<string>();

  private readonly controlEventTick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events
        .subscribe(() => this.controlEventTick.update(v => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly fullConfig = computed<AppFormInputConfig>(() => ({
    ...FORM_INPUT_DEFAULTS,
    ...this.config()
  }) as AppFormInputConfig);

  readonly isRequired = computed(() => {
    this.controlEventTick();
    return this.control().hasValidator(Validators.required);
  });

  readonly errorState = computed<ErrorState>(() => {
    this.controlEventTick();
    const ctrl = this.control();
    const shouldShow = ctrl.invalid && ctrl.touched;
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = ctrl.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages ?? {};
    const message = customMessages[errorKey] ?? FORM_INPUT_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
    return { shouldShow: true, message };
  });

  readonly isIconClickable = computed(() => {
    return !!this.fullConfig().icon && !!this.fullConfig().onIconClick;
  });

  onIconClick(event: MouseEvent): void {
    if (this.isIconClickable()) {
      this.fullConfig().onIconClick?.(event);
    }
  }
}
