import { Component, ChangeDetectionStrategy, computed, effect, input,
 output, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppTableFiltersAdvancedConfig, AppTableFiltersAdvancedOutput, AppTableFilterCriterion, AppTableFilterToggle,
  DEFAULT_FILTER_OPERATORS, FILTER_DEFAULTS } from '../app-table-filters-advanced.model';
import { togglesToRecord } from '../app-table-filters-advanced.utils';
import { MatDivider } from "@angular/material/divider";
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFormDatepickerConnectorDirective } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker-connector.directive';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker.component';
import { AppFormInputConnectorDirective } from '@shared/molecules/app-form/app-form-input/app-form-input-connector.directive';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';
import { AppFormSelectConnectorDirective } from '@shared/molecules/app-form/app-form-select/app-form-select-connector.directive';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';
import { CriterionDisplayPipe } from '../criterion-display.pipe';

const BOOLEAN_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
];

@Component({
  selector: 'app-table-filters-advanced',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppFormSelectComponent,
    AppFormSelectConnectorDirective,
    AppFormInputComponent,
    AppFormInputConnectorDirective,
    AppFormDatepickerComponent,
    AppFormDatepickerConnectorDirective,
    CriterionDisplayPipe,
    MatDivider
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
  readonly booleanOptions = BOOLEAN_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private criterionCounter = 0;

  readonly builderForm = this.fb.nonNullable.group({
    field: ['', Validators.required],
    operator: ['', Validators.required],
    value: '',
  });

  private readonly formState = toSignal(this.builderForm.valueChanges, {
    initialValue: this.builderForm.getRawValue(),
  });

  readonly operators = computed(() =>
    this.config().operators ?? DEFAULT_FILTER_OPERATORS
  );

  readonly fieldOptions = computed(() =>
    this.config().fields.map(f => ({ value: f.key, label: f.label }))
  );

  readonly selectedField = computed(() => {
    const key = this.formState().field;
    return key ? this.config().fields.find(f => f.key === key) ?? null : null;
  });

  readonly selectedOperator = computed(() => {
    const key = this.formState().operator;
    return key ? this.operators().find(o => o.key === key) ?? null : null;
  });

  readonly operatorOptions = computed(() => {
    const field = this.selectedField();
    if (!field) return [];
    return this.operators()
      .filter(op => op.applicableTo.includes(field.type))
      .map(op => ({ value: op.key, label: op.label }));
  });

  readonly valueOptions = computed(() => {
    const field = this.selectedField();
    return field?.type === 'select' && field.options ? field.options : [];
  });

  readonly selectedFieldType = computed(() => this.selectedField()?.type ?? null);
  readonly isNoValueOperator = computed(() => this.selectedOperator()?.requiresValue === false);
  readonly hasCriteria = computed(() => this.criteria().length > 0);

  readonly canAddCriterion = computed(() => {
    const operator = this.selectedOperator();
    if (!this.selectedField() || !operator) return false;
    if (!operator.requiresValue) return true;
    const value = this.formState().value;
    return value !== null && value !== undefined && value !== '';
  });

  readonly showClearButton = computed(() => this.config().showClearButton ?? FILTER_DEFAULTS.showClearButton);
  readonly showSearchButton = computed(() => this.config().showSearchButton ?? FILTER_DEFAULTS.showSearchButton);
  private readonly autoSearch = computed(() => this.config().autoSearch ?? FILTER_DEFAULTS.autoSearch);
  private readonly maxCriteria = computed(() => this.config().maxCriteria ?? FILTER_DEFAULTS.maxCriteria);

  readonly criteriaAreaClasses = computed(() => {
    const classes = ['app-table-filters-advanced-criteria'];
    if (this.hasCriteria()) {
      classes.push('app-table-filters-advanced-criteria--active');
    }
    return classes.join(' ');
  });

  constructor() {
    this.setupFormCascade();

    effect(() => {
      this.toggles.set((this.config().toggles ?? []).map(t => ({ ...t })));
    });

    effect(() => {
      const initial = this.initialCriteria();
      if (initial.length > 0) {
        this.criteria.set([...initial]);
      }
    });
  }

  addCriterion(): void {
    const field = this.selectedField();
    const operator = this.selectedOperator();

    if (!field || !operator || !this.canAddCriterion()) return;
    if (this.criteria().length >= this.maxCriteria()) return;

    this.criteria.update(current => [...current, {
      id: `criterion_${++this.criterionCounter}`,
      field,
      operator,
      value: this.builderForm.controls.value.value,
    }]);

    this.builderForm.reset();
    this.criteriaChange.emit(this.criteria());
    this.emitAutoSearch();
  }

  removeCriterion(id: string): void {
    this.criteria.update(current => current.filter(c => c.id !== id));
    this.criteriaChange.emit(this.criteria());
    this.emitAutoSearch();
  }

  clearAllCriteria(): void {
    this.criteria.set([]);
    this.criteriaChange.emit(this.criteria());
    this.emitAutoSearch();
  }

  onToggleChange(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );
    this.toggleChange.emit(togglesToRecord(this.toggles()));
    this.emitAutoSearch();
  }

  emitSearch(): void {
    this.search.emit({
      criteria: this.criteria(),
      toggles: togglesToRecord(this.toggles()),
    });
  }

  private setupFormCascade(): void {
    this.builderForm.controls.field.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.builderForm.controls.operator.reset();
        this.builderForm.controls.value.reset();
      });

    this.builderForm.controls.operator.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(key => {
        const op = this.operators().find(o => o.key === key);
        if (op && !op.requiresValue) {
          this.builderForm.controls.value.reset();
        }
      });
  }

  private emitAutoSearch(): void {
    if (this.autoSearch()) {
      this.emitSearch();
    }
  }
}
