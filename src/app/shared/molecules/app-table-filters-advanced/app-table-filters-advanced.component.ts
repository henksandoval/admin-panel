import { Component, computed, effect, input, output, signal, WritableSignal,
  ChangeDetectionStrategy, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '../../atoms/app-checkbox/app-checkbox.component';
import { AppFormSelectComponent } from '../../molecules/app-form-select/app-form-select.component';
import { AppFormInputComponent } from '../../molecules/app-form-input/app-form-input.component';
import { AppFormDatepickerComponent } from '../../molecules/app-form-datepicker/app-form-datepicker.component';
import { AppTableFiltersAdvancedConfig, AppTableFiltersAdvancedOutput, AppTableFilterCriterion, AppTableFilterField,
  AppTableFilterOperator, AppTableFilterToggle, DEFAULT_FILTER_OPERATORS, TABLE_FILTERS_ADVANCED_DEFAULTS
} from './app-table-filters-advanced.model';

@Component({
  selector: 'app-table-filters-advanced',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    AppButtonComponent,
    AppCheckboxComponent,
    AppFormSelectComponent,
    AppFormInputComponent,
    AppFormDatepickerComponent,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-table-filters-advanced.component.html',
  styleUrl: './app-table-filters-advanced.component.scss',
})
export class AppTableFiltersAdvancedComponent implements OnInit {
  config = input.required<AppTableFiltersAdvancedConfig>();
  initialCriteria = input<AppTableFilterCriterion[]>([]);

  search = output<AppTableFiltersAdvancedOutput>();
  criteriaChange = output<AppTableFilterCriterion[]>();
  toggleChange = output<Record<string, boolean>>();

  readonly criteria: WritableSignal<AppTableFilterCriterion[]> = signal([]);
  readonly toggles: WritableSignal<AppTableFilterToggle[]> = signal([]);
  readonly selectedField: WritableSignal<AppTableFilterField | null> = signal(null);
  readonly selectedOperator: WritableSignal<AppTableFilterOperator | null> = signal(null);
  readonly formValue: WritableSignal<any> = signal({});

  builderForm!: FormGroup;

  private readonly operators = DEFAULT_FILTER_OPERATORS;
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly CRITERION_ID_PREFIX = 'criterion_';

  readonly availableFields = computed(() => this.config().fields || []);

  readonly fieldOptions = computed(() =>
    this.availableFields().map(field => ({
      value: field.key,
      label: field.label
    }))
  );

  readonly availableOperators = computed(() => {
    const field = this.selectedField();
    if (!field) return [];

    return this.operators.filter(op =>
      op.applicableTo.includes(field.type)
    );
  });

  readonly operatorOptions = computed(() =>
    this.availableOperators().map(op => ({
      value: op.key,
      label: op.label
    }))
  );

  readonly valueOptions = computed(() => {
    const field = this.selectedField();
    if (!field || field.type !== 'select') return [];
    return field.options || [];
  });

  readonly booleanOptions = computed(() => [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ]);

  readonly canAddCriterion = computed(() => {
    const { field, operator, value } = this.formValue();

    if (!field || !operator) return false;

    const op = this.selectedOperator();
    if (!op) return false;

    if (!op.requiresValue) return true;

    return value !== null && value !== undefined && value !== '';
  });

  readonly isNoValueOperator = computed(() => {
    const op = this.selectedOperator();
    return op ? !op.requiresValue : false;
  });

  readonly hasToggles = computed(() => this.toggles().length > 0);

  readonly showActions = computed(() =>
    this.showClearButton() || this.showSearchButton()
  );

  readonly showClearButton = computed(() =>
    this.config().showClearButton ?? TABLE_FILTERS_ADVANCED_DEFAULTS.showClearButton
  );

  readonly showSearchButton = computed(() =>
    this.config().showSearchButton ?? TABLE_FILTERS_ADVANCED_DEFAULTS.showSearchButton
  );

  readonly autoSearch = computed(() =>
    this.config().autoSearch ?? TABLE_FILTERS_ADVANCED_DEFAULTS.autoSearch
  );

  readonly maxCriteria = computed(() =>
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

  ngOnInit(): void {}

  private initializeForm(): void {
    this.builderForm = this.fb.group({
      field: ['', Validators.required],
      operator: ['', Validators.required],
      value: [''],
    });

    this.builderForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.formValue.set(value);
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
    const field = this.availableFields().find(f => f.key === fieldKey) || null;
    this.selectedField.set(field);

    this.builderForm.patchValue({ operator: '', value: '' }, { emitEvent: false });
    this.selectedOperator.set(null);
  }

  private onOperatorChange(): void {
    const opKey = this.builderForm.value.operator;
    const op = this.operators.find(o => o.key === opKey) || null;
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
    const displayValue = this.formatDisplayValue(value, field, operator);

    const newCriterion: AppTableFilterCriterion = {
      id: this.generateId(),
      field: { ...field },
      operator: { ...operator },
      value: value,
      displayValue,
    };

    this.criteria.update(current => [...current, newCriterion]);
    this.resetBuilder();
    this.criteriaChange.emit(this.criteria());

    if (this.autoSearch()) {
      this.emitSearch();
    }
  }

  removeCriterion(id: string): void {
    this.criteria.update(current => current.filter(c => c.id !== id));
    this.criteriaChange.emit(this.criteria());

    if (this.autoSearch()) {
      this.emitSearch();
    }
  }

  clearAllCriteria(): void {
    this.criteria.set([]);
    this.criteriaChange.emit(this.criteria());

    if (this.autoSearch()) {
      this.emitSearch();
    }
  }

  onToggleChange(key: string, checked: boolean): void {
    this.toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );

    this.emitToggleChange();

    if (this.autoSearch()) {
      this.emitSearch();
    }
  }

  emitSearch(): void {
    const output: AppTableFiltersAdvancedOutput = {
      criteria: this.criteria(),
      toggles: this.getTogglesAsRecord(),
    };
    this.search.emit(output);
  }

  private emitToggleChange(): void {
    this.toggleChange.emit(this.getTogglesAsRecord());
  }

  private resetBuilder(): void {
    this.builderForm.reset({ field: '', operator: '', value: '' });
    this.selectedField.set(null);
    this.selectedOperator.set(null);
  }

  private generateId(): string {
    return `${this.CRITERION_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDisplayValue(
    value: any,
    field: AppTableFilterField,
    operator: AppTableFilterOperator
  ): string {
    if (!operator.requiresValue) {
      return operator.label;
    }

    if (field.type === 'select' && field.options) {
      const option = field.options.find(o => o.value == value);
      return option?.label || String(value);
    }

    if (field.type === 'boolean') {
      return value === true || value === 'true' ? 'Sí' : 'No';
    }

    if (field.type === 'date' && value) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('es-ES');
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
