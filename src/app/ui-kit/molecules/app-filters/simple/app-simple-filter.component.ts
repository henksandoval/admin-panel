import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AppFilterCriterion,
  AppFiltersConfig,
  AppFilterValues,
  DEFAULT_FILTER_OPERATORS,
  DEFAULT_OPERATOR_BY_TYPE,
  FILTER_DEFAULTS
} from '../app-filter.model';
import { AppFilterFooterComponent } from '../footer/app-filter-footer.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AppFormDatepickerComponent
} from '@ui-molecules/app-form/app-form-datepicker';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormSelectComponent } from '@ui-molecules/app-form/app-form-select';
import { SelectOption } from '@ui-molecules/app-form/app-form-select';
import { togglesToCriteria } from '../app-filter.utils';

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
  readonly config = input.required<AppFiltersConfig>();
  readonly values = input<AppFilterValues>({});

  criteriaChange = output<AppFilterCriterion[]>();

  readonly appearance = computed(() => this.config().appearance ?? FILTER_DEFAULTS.appearance);
  readonly showClearButton = computed(() => this.config().showClearButton ?? FILTER_DEFAULTS.showClearButton);
  readonly showSearchButton = computed(() => this.config().showSearchButton ?? FILTER_DEFAULTS.showSearchButton);
  readonly toggles = computed(() => this.config().toggles ?? []);
  readonly currentToggles = signal<Record<string, boolean>>({});

  private readonly destroyRef = inject(DestroyRef);
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

  getControl(key: string): FormControl {
    return this.formGroup().get(key) as FormControl;
  }

  getSelectOptions(filter: { options?: { value: unknown; label: string }[] }): SelectOption[] {
    const resetOption: SelectOption = { value: null as unknown, label: $localize`:Filter|Reset/all option in select@@filter.select.allOption:-- All --` };
    return [resetOption, ...(filter.options ?? [])];
  }

  onToggleChange(togglesRecord: Record<string, boolean>): void {
    this.currentToggles.set(togglesRecord);
    this.emitAllCriteria();
  }

  emitSearch(): void {
    this.emitAllCriteria();
  }

  clearAllCriteria(): void {
    this.formGroup().reset();
    this.criteriaChange.emit(togglesToCriteria(this.currentToggles()));
  }

  private emitAllCriteria(): void {
    const cleaned = this.cleanValues(this.formGroup().getRawValue());
    const fieldCriteria = this.valuesToCriteria(cleaned);
    const toggleCriteria = togglesToCriteria(this.currentToggles());
    this.criteriaChange.emit([...fieldCriteria, ...toggleCriteria]);
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
      .subscribe(() => {
        this.emitAllCriteria();
      });
  }

  private cleanValues(values: Record<string, unknown>): AppFilterValues {
    return Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      ),
    ) as AppFilterValues;
  }

  private valuesToCriteria(values: AppFilterValues): AppFilterCriterion[] {
    const fields = this.config().fields;

    return Object.entries(values).map(([key, value]) => {
      const field = fields.find(f => f.key === key)!;
      const operatorKey = field.defaultOperator ?? DEFAULT_OPERATOR_BY_TYPE[field.type];
      const operator = DEFAULT_FILTER_OPERATORS.find(op => op.key === operatorKey)!;

      return {
        id: `simple_${key}`,
        field,
        operator,
        value,
      };
    });
  }
}
