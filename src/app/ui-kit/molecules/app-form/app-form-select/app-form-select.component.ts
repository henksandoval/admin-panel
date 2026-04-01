import { Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  AppFormSelectConfig,
  AppFormSelectOptions,
  FORM_SELECT_DEFAULT_ERROR_MESSAGES,
  FORM_SELECT_DEFAULTS,
  SelectDensity,
  SelectOption
} from './app-form-select.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './app-form-select.component.html',
  styleUrl: './app-form-select.component.scss',
  host: {
    '[class]': 'densityClass()'
  }
})
export class AppFormSelectComponent<T = any> {
  readonly control = input.required<FormControl<T | T[] | null>>();
  readonly options = input.required<SelectOption<T>[]>();
  readonly config = input<AppFormSelectOptions>({});
  protected readonly fullConfig = computed<AppFormSelectConfig>(() => ({
    ...FORM_SELECT_DEFAULTS,
    ...this.config()
  }) as AppFormSelectConfig);
  protected readonly hasGroups = computed(() => {
    return this.options().some(opt => opt.group !== undefined);
  });
  protected readonly densityClass = computed(() => {
    const densityMap: Record<SelectDensity, string> = {
      0: 'app-form-select--density-0',
      '-1': 'app-form-select--density-n1',
      '-2': 'app-form-select--density-n2',
      '-3': 'app-form-select--density-n3',
    };
    return densityMap[this.fullConfig().density];
  });
  protected readonly groupedOptions = computed(() => {
    const groups = new Map<string, SelectOption<T>[]>();
    this.options().forEach(option => {
      const groupName = option.group ?? 'default';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });
    return Array.from(groups.entries()).map(([name, options]) => ({ name, options }));
  });
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
    const message = customMessages[errorKey] ?? FORM_SELECT_DEFAULT_ERROR_MESSAGES[errorKey] ?? 'Validation error';
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
