import {
  Component, ChangeDetectionStrategy, computed, effect, input,
  output, signal, inject, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { togglesToRecord } from '../app-filter.utils';
import { createDefaultComputed } from '../app-filter-defaults.utils';
import { MatDivider } from "@angular/material/divider";
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppFilterFooterComponent } from '../footer/app-filter-footer.component';
import { AppFormDatepickerConnectorDirective } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker-connector.directive';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker.component';
import { AppFormInputConnectorDirective } from '@shared/molecules/app-form/app-form-input/app-form-input-connector.directive';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';
import { AppFormSelectConnectorDirective } from '@shared/molecules/app-form/app-form-select/app-form-select-connector.directive';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';
import { CriterionDisplayPipe } from '../criterion-display.pipe';
import { AppFiltersConfig, AppFiltersOutput, AppFilterCriterion, DEFAULT_FILTER_OPERATORS } from '../app-filter.model';

const BOOLEAN_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
];

@Component({
  selector: 'app-filters-advanced',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    AppButtonComponent,
    AppFilterFooterComponent,
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
  templateUrl: './app-advanced-filter.component.html',
  styleUrl: './app-advanced-filter.component.scss',
})
export class AppAdvancedFilterComponent {
  readonly config = input.required<AppFiltersConfig>();
  readonly initialCriteria = input<AppFilterCriterion[]>([]);

  searchApplied = output<AppFiltersOutput>();
  criteriaChange = output<AppFilterCriterion[]>();
  toggleChange = output<Record<string, boolean>>();

  readonly criteria = signal<AppFilterCriterion[]>([]);
  readonly booleanOptions = BOOLEAN_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private criterionCounter = 0;

  readonly toggles = computed(() => this.config().toggles ?? []);

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

  readonly showClearButton = createDefaultComputed(this.config, 'showClearButton');
  readonly showSearchButton = createDefaultComputed(this.config, 'showSearchButton');
  private readonly autoSearch = createDefaultComputed(this.config, 'autoSearch');
  private readonly maxCriteria = createDefaultComputed(this.config, 'maxCriteria');

  readonly criteriaAreaClasses = computed(() => {
    const classes = ['app-filters-advanced-criteria'];
    if (this.hasCriteria()) {
      classes.push('app-filters-advanced-criteria--active');
    }
    return classes.join(' ');
  });

  constructor() {
    this.setupFormCascade();


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

  emitSearch(): void {
    this.searchApplied.emit({
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

  onToggleChange(togglesRecord: Record<string, boolean>): void {
    this.toggleChange.emit(togglesRecord);
    this.emitAutoSearch();
  }

  private emitAutoSearch(): void {
    if (this.autoSearch()) {
      this.emitSearch();
    }
  }
}
