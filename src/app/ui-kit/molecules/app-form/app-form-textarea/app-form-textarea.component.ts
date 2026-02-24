import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  forwardRef,
  inject,
  input,
  isDevMode
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { APP_FORM_TEXTAREA_DEFAULTS, AppFormTextareaOptions } from './app-form-textarea.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if(fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }

      @if(fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }

      <textarea
        matInput
        [formControl]="internalControl"
        [rows]="fullConfig().rows"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
        [required]="isRequired"
        (blur)="handleBlur()"
        cdkTextareaAutosize
        [cdkAutosizeMinRows]="fullConfig().rows"
        [cdkAutosizeMaxRows]="fullConfig().maxRows">
      </textarea>

      @if(fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }

      @if(fullConfig().icon) {
        <mat-icon matSuffix>{{ fullConfig().icon }}</mat-icon>
      }

      @if(fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }

      @if(fullConfig().showErrors && errorState.shouldShow) {
        <mat-error>{{ errorState.message }}</mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormTextareaComponent),
      multi: true
    }
  ]
})
export class AppFormTextareaComponent implements ControlValueAccessor, AfterViewInit {
  readonly config = input<AppFormTextareaOptions>({});
  readonly fullConfig = computed(() => ({
    label: '',
    placeholder: '',
    hint: '',
    icon: '',
    prefix: '',
    suffix: '',
    ariaLabel: '',
    errorMessages: {},
    ...APP_FORM_TEXTAREA_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl('');
  public ngControl: NgControl | null = null;
  public isRequired = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;
  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required',
    minlength: 'The text is too short',
    maxlength: 'The text is too long',
    pattern: 'The format is not valid'
  };

  constructor() {
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
      });
  }

  public get errorState(): ErrorState {
    const control = this.ngControl?.control;
    const shouldShow = !!(control && control.invalid && (control.touched || control.dirty));
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = control.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages || {};
    const message = customMessages[errorKey] || this.defaultErrorMessages[errorKey] || 'Validation error';
    return { shouldShow: true, message };
  }

  ngAfterViewInit(): void {
    if (isDevMode() && !this.ngControl && !this.hasCheckedConnection) {
      console.warn(
        `⚠️ AppFormTextareaComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appFormTextareaConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-textarea formControlName="description" [config]="config" appFormTextareaConnector>\n` +
        `</app-form-textarea>\n\n` +
        `Sin la directiva, los validadores del FormGroup padre NO se sincronizarán con este componente.`
      );
      this.hasCheckedConnection = true;
    }
  }

  public connectControl(ngControl: NgControl): void {
    this.hasCheckedConnection = true;
    this.ngControl = ngControl;
    this.ngControl.valueAccessor = this;
    const parentControl = this.ngControl.control;

    if (parentControl) {
      this.isRequired = parentControl.hasValidator(Validators.required);
      this.internalControl.setValidators(parentControl.validator);
      this.internalControl.updateValueAndValidity({ emitEvent: false });

      parentControl.statusChanges.pipe(
        startWith(parentControl.status),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    }

    this.changeDetectorRef.detectChanges();
  }

  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.internalControl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }

  private onChange: (value: string | null) => void = () => {};

  private onTouched: () => void = () => {};
}
