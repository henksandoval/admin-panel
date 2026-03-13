import { Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AppFormTextareaNewConfig, AppFormTextareaNewOptions, FORM_TEXTAREA_NEW_DEFAULT_ERROR_MESSAGES, FORM_TEXTAREA_NEW_DEFAULTS } from './app-form-textarea.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, TextFieldModule],
  styleUrl: './app-form-textarea.component.scss',
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if (fullConfig().label) {
        <mat-label [attr.data-testid]="testId() ? testId() + '-label' : null">{{ fullConfig().label }}</mat-label>
      }
      @if (fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }
      <textarea
        matInput
        [formControl]="control()"
        [rows]="fullConfig().rows"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
        [attr.data-testid]="testId() ?? null"
        [required]="isRequired()"
        cdkTextareaAutosize
        [cdkAutosizeMinRows]="fullConfig().rows"
        [cdkAutosizeMaxRows]="fullConfig().maxRows"
      ></textarea>
      @if (fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }
      @if (fullConfig().icon) {
        <mat-icon matSuffix [attr.data-testid]="testId() ? testId() + '-icon' : null">{{ fullConfig().icon }}</mat-icon>
      }
      @if (fullConfig().hint) {
        <mat-hint [attr.data-testid]="testId() ? testId() + '-hint' : null">{{ fullConfig().hint }}</mat-hint>
      }
      @if (errorState().shouldShow) {
        <mat-error [attr.data-testid]="testId() ? testId() + '-error' : null">{{ errorState().message }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class AppFormTextareaComponent {
  readonly control = input.required<FormControl<string>>();
  readonly config = input<AppFormTextareaNewOptions>({});
  readonly testId = input<string>();

  private readonly controlEventTick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const sub = this.control().events
        .subscribe(() => this.controlEventTick.update(v => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected readonly fullConfig = computed<AppFormTextareaNewConfig>(() => ({
    ...FORM_TEXTAREA_NEW_DEFAULTS,
    ...this.config()
  }) as AppFormTextareaNewConfig);

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
    const message = customMessages[errorKey] ?? FORM_TEXTAREA_NEW_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
    return { shouldShow: true, message };
  });
}


