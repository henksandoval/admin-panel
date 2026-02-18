import {
  Component,
  computed,
  input,
  output,
  signal,
  effect,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AppFiltersConfig, AppFilterToggle,
  AppFilterValues,
  FILTER_DEFAULTS,
} from '../app-filter.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker.component';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';
import {AppCheckboxComponent} from '@shared/atoms/app-checkbox/app-checkbox.component';
import {togglesToRecord} from '@shared/molecules/app-filters/app-filter.utils';

@Component({
  selector: 'app-simple-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AppFormInputComponent,
    AppFormSelectComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    AppFormDatepickerComponent,
    AppCheckboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-simple-filter.component.scss',
  templateUrl: './app-simple-filter.component.html'
})
export class AppSimpleFilterComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<AppFiltersConfig>();
  readonly values = input<AppFilterValues>({});

  valuesChange = output<AppFilterValues>();
  filterChange = output<{ key: string; value: unknown }>();
  toggleChange = output<Record<string, boolean>>();

  readonly appearance = computed(() => this.config().appearance ?? FILTER_DEFAULTS.appearance);
  readonly toggles = signal<AppFilterToggle[]>([]);
  readonly showClearAll = computed(() => this.config().showClearAll ?? FILTER_DEFAULTS.showClearAll);
  readonly clearAllLabel = computed(() => this.config().clearAllLabel ?? FILTER_DEFAULTS.clearAllLabel);
  private readonly debounceMs = computed(() => this.config().debounceMs ?? FILTER_DEFAULTS.debounceMs);

  private readonly formGroup = signal(new FormGroup<Record<string, FormControl>>({}));

  constructor() {
    effect(() => {
      this.toggles.set((this.config().toggles ?? []).map(t => ({ ...t })));
    });

    effect(() => {
      const externalValues = this.values();
      const form = this.formGroup();

      if (Object.keys(form.controls).length === 0) return;

      Object.keys(form.controls).forEach((key) => {
        const control = form.get(key);
        const externalValue = externalValues[key] ?? null;
        if (control && control.value !== externalValue) {
          control.setValue(externalValue, { emitEvent: false });
        }
      });
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const filters = this.config().fields;
    const initialValues = this.values();
    const controls: Record<string, FormControl> = {};

    filters.forEach((filter) => {
      controls[filter.key] = new FormControl(initialValues[filter.key] ?? null);
    });

    const form = new FormGroup(controls);
    this.formGroup.set(form);

    form.valueChanges
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((values) => this.valuesChange.emit(this.cleanValues(values)));
  }

  getControl(key: string): FormControl {
    return this.formGroup().get(key) as FormControl;
  }

  getSelectOptions(filter: { options?: { value: unknown; label: string }[] }): SelectOption[] {
    const resetOption: SelectOption = { value: null as unknown, label: '-- Todos --' };
    return [resetOption, ...(filter.options ?? [])];
  }

  hasAnyValue(): boolean {
    return Object.values(this.formGroup().value).some(
      (value) => value !== null && value !== undefined && value !== '',
    );
  }

  clearAll(): void {
    this.formGroup().reset();
    this.valuesChange.emit({});
  }

  onToggleChange(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );
    this.toggleChange.emit(togglesToRecord(this.toggles()));
  }

  private cleanValues(values: Record<string, unknown>): AppFilterValues {
    return Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      ),
    ) as AppFilterValues;
  }
}
