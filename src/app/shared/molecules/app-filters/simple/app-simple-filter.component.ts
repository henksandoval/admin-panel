import {
  Component,
  input,
  output,
  signal,
  effect,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  computed,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AppFiltersConfig,
  AppFilterValues,
  FILTER_DEFAULTS
} from '../app-filter.model';
import { AppFilterFooterComponent } from '../footer/app-filter-footer.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker.component';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';

@Component({
  selector: 'app-simple-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AppFormInputComponent,
    AppFormSelectComponent,
    AppFilterFooterComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    AppFormDatepickerComponent,
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
  readonly showClearButton = computed(() => this.config().showClearButton ?? FILTER_DEFAULTS.showClearButton);
  readonly showSearchButton = computed(() => this.config().showSearchButton ?? FILTER_DEFAULTS.showSearchButton);
  readonly toggles = computed(() => this.config().toggles ?? []);

  private readonly debounceMs = computed(() => this.config().debounceMs ?? FILTER_DEFAULTS.debounceMs);
  private readonly formGroup = signal(new FormGroup<Record<string, FormControl>>({}));

  constructor() {
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

  onToggleChange(togglesRecord: Record<string, boolean>): void {
    this.toggleChange.emit(togglesRecord);
  }

  emitSearch(): void {
  }

  clearAllCriteria(): void {
    this.formGroup().reset();
    this.valuesChange.emit({});
  }

  private cleanValues(values: Record<string, unknown>): AppFilterValues {
    return Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      ),
    ) as AppFilterValues;
  }
}
