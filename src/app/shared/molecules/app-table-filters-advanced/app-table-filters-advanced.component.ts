import { Component, computed, effect, input, output, signal,
  ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '../../atoms/app-checkbox/app-checkbox.component';
import { AppFormSelectComponent } from '../../molecules/app-form-select/app-form-select.component';
import { AppFormSelectConnectorDirective } from '../../molecules/app-form-select/app-form-select-connector.directive';
import { AppFormInputComponent } from '../../molecules/app-form-input/app-form-input.component';
import { AppFormInputConnectorDirective } from '../../molecules/app-form-input/app-form-input-connector.directive';
import { AppFormDatepickerComponent } from '../../molecules/app-form-datepicker/app-form-datepicker.component';
import { AppFormDatepickerConnectorDirective } from '../../molecules/app-form-datepicker/app-form-datepicker-connector.directive';
import { SelectOption } from '../app-form-select/app-form-select.model';
import { AppTableFiltersAdvancedConfig, AppTableFiltersAdvancedOutput, AppTableFilterCriterion, AppTableFilterField,
  AppTableFilterOperator, AppTableFilterToggle, DEFAULT_FILTER_OPERATORS, TABLE_FILTERS_ADVANCED_DEFAULTS
} from './app-table-filters-advanced.model';

const BOOLEAN_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' }
];

@Component({
  selector: 'app-table-filters-advanced',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppFormSelectComponent,
    AppFormSelectConnectorDirective,
    AppFormInputComponent,
    AppFormInputConnectorDirective,
    AppFormDatepickerComponent,
    AppFormDatepickerConnectorDirective,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-table-filters-advanced.component.html',
  styleUrl: './app-table-filters-advanced.component.scss',
})
export class AppTableFiltersAdvancedComponent {
  config = input.required<AppTableFiltersAdvancedConfig>();
  initialCriteria = input<AppTableFilterCriterion[]>([]);

  search = output<AppTableFiltersAdvancedOutput>();
  criteriaChange = output<AppTableFilterCriterion[]>();
  toggleChange = output<Record<string, boolean>>();

  readonly criteria = signal<AppTableFilterCriterion[]>([]);
  readonly toggles = signal<AppTableFilterToggle[]>([]);
  readonly selectedField = signal<AppTableFilterField | null>(null);
  readonly selectedOperator = signal<AppTableFilterOperator | null>(null);

  builderForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly fieldOptions = computed(() =>
    this.config().fields.map(field => ({
      value: field.key,
      label: field.label
    }))
  );

  readonly operatorOptions = computed(() => {
    const field = this.selectedField();
    if (!field) return [];

    return DEFAULT_FILTER_OPERATORS
      .filter(op => op.applicableTo.includes(field.type))
      .map(op => ({ value: op.key, label: op.label }));
  });

  readonly valueOptions = computed(() => {
    const field = this.selectedField();
    return (field?.type === 'select' && field.options) || [];
  });

  readonly booleanOptions = BOOLEAN_OPTIONS;

  readonly canAddCriterion = computed(() => {
    const { field, operator, value } = this.builderForm.value;
    if (!field || !operator) return false;

    const op = this.selectedOperator();
    if (!op) return false;

    return !op.requiresValue || (value !== null && value !== undefined && value !== '');
  });

  readonly isNoValueOperator = computed(() => this.selectedOperator()?.requiresValue === false);

  readonly pillsAreaClasses = computed(() =>
    this.criteria().length === 0
      ? 'flex flex-wrap gap-2 p-3.5 min-h-[52px] items-center bg-surface-variant border-b border-outline-variant'
      : 'flex flex-wrap gap-2 p-3.5 min-h-[52px] items-center bg-surface border-b border-outline-variant'
  );

  readonly showClearButton = computed(() =>
    this.config().showClearButton ?? TABLE_FILTERS_ADVANCED_DEFAULTS.showClearButton
  );

  readonly showSearchButton = computed(() =>
    this.config().showSearchButton ?? TABLE_FILTERS_ADVANCED_DEFAULTS.showSearchButton
  );

  private readonly autoSearch = computed(() =>
    this.config().autoSearch ?? TABLE_FILTERS_ADVANCED_DEFAULTS.autoSearch
  );

  private readonly maxCriteria = computed(() =>
    this.config().maxCriteria ?? TABLE_FILTERS_ADVANCED_DEFAULTS.maxCriteria
  );

  constructor() {
    this.initializeForm();

    effect(() => {
      const configToggles = this.config().toggles || [];
      this.toggles.set(configToggles.map(t => ({ ...t })));
    });

    effect(() => {
      const initial = this.initialCriteria();
      if (initial?.length) {
        this.criteria.set([...initial]);
      }
    });
  }

  private initializeForm(): void {
    this.builderForm = this.fb.group({
      field: ['', Validators.required],
      operator: ['', Validators.required],
      value: [''],
    });

    this.builderForm.get('field')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFieldChange());

    this.builderForm.get('operator')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onOperatorChange());
  }

  private onFieldChange(): void {
    const fieldKey = this.builderForm.value.field;
    const field = this.config().fields.find(f => f.key === fieldKey) || null;
    this.selectedField.set(field);

    this.builderForm.patchValue({ operator: '', value: '' }, { emitEvent: false });
    this.selectedOperator.set(null);
  }

  private onOperatorChange(): void {
    const opKey = this.builderForm.value.operator;
    const op = DEFAULT_FILTER_OPERATORS.find(o => o.key === opKey) || null;
    this.selectedOperator.set(op);

    if (op && !op.requiresValue) {
      this.builderForm.patchValue({ value: '' }, { emitEvent: false });
    }
  }

  addCriterion(): void {
    if (!this.canAddCriterion()) return;

    const field = this.selectedField();
    const operator = this.selectedOperator();
    if (!field || !operator) return;

    if (this.criteria().length >= this.maxCriteria()) {
      console.warn(`Máximo de ${this.maxCriteria()} criterios alcanzado`);
      return;
    }

    const value = this.builderForm.value.value;

    this.criteria.update(current => [...current, {
      id: this.generateId(),
      field,
      operator,
      value,
      displayValue: this.formatDisplayValue(value, field, operator),
    }]);

    this.builderForm.reset();
    this.selectedField.set(null);
    this.selectedOperator.set(null);

    this.criteriaChange.emit(this.criteria());
    this.triggerAutoSearch();
  }

  removeCriterion(id: string): void {
    this.criteria.update(current => current.filter(c => c.id !== id));
    this.criteriaChange.emit(this.criteria());
    this.triggerAutoSearch();
  }

  clearAllCriteria(): void {
    this.criteria.set([]);
    this.criteriaChange.emit(this.criteria());
    this.triggerAutoSearch();
  }

  onToggleChange(key: string, checked: boolean): void {
    this.toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );

    this.toggleChange.emit(this.getTogglesAsRecord());
    this.triggerAutoSearch();
  }

  emitSearch(): void {
    this.search.emit({
      criteria: this.criteria(),
      toggles: this.getTogglesAsRecord(),
    });
  }

  private triggerAutoSearch(): void {
    if (this.autoSearch()) {
      this.emitSearch();
    }
  }

  private generateId(): string {
    return `criterion_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private formatDisplayValue(value: any, field: AppTableFilterField, operator: AppTableFilterOperator): string {
    if (!operator.requiresValue) return operator.label;

    if (field.type === 'select' && field.options) {
      return field.options.find(o => o.value == value)?.label || String(value);
    }

    if (field.type === 'boolean') {
      return value === true || value === 'true' ? 'Sí' : 'No';
    }

    if (field.type === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString('es-ES');
      } catch {
        return String(value);
      }
    }

    if (field.type === 'text') {
      return `"${value}"`;
    }

    return String(value);
  }

  private getTogglesAsRecord(): Record<string, boolean> {
    return this.toggles().reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as Record<string, boolean>);
  }
}
