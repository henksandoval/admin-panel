import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from "@angular/material/divider";
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppFilterFooterComponent } from '../footer/app-filter-footer.component';
import {
  AppFormDatepickerComponent
} from '@ui-molecules/app-form/app-form-datepicker';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormSelectComponent } from '@ui-molecules/app-form/app-form-select';
import { SelectOption } from '@ui-molecules/app-form/app-form-select';
import { CriterionDisplayPipe } from '../criterion-display.pipe';
import { AppFilterCriterion, AppFiltersConfig, DEFAULT_FILTER_OPERATORS, FILTER_DEFAULTS } from '../app-filter.model';
import { togglesToCriteria } from '../app-filter.utils';

const BOOLEAN_OPTIONS: SelectOption<boolean>[] = [
  { value: true,  label: $localize`:Filter|Boolean yes option@@filter.boolean.yes:Yes` },
  { value: false, label: $localize`:Filter|Boolean no option@@filter.boolean.no:No` },
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
    AppFormInputComponent,
    AppFormDatepickerComponent,
    CriterionDisplayPipe,
    MatDivider
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-advanced-filter.component.html',
  styleUrl: './app-advanced-filter.component.scss',
  providers: [CriterionDisplayPipe],
})
export class AppAdvancedFilterComponent {
  readonly config = input.required<AppFiltersConfig>();
  readonly initialCriteria = input<AppFilterCriterion[]>([]);

  criteriaChange = output<AppFilterCriterion[]>();

  protected readonly criteria = signal<AppFilterCriterion[]>([]);
  protected readonly currentToggles = signal<Record<string, boolean>>({});
  protected readonly booleanOptions = BOOLEAN_OPTIONS;
  protected readonly toggles = computed(() => this.config().toggles ?? []);
  readonly operators = computed(() =>
    this.config().operators ?? DEFAULT_FILTER_OPERATORS
  );
  protected readonly fieldOptions = computed(() =>
    this.config().fields.map(f => ({ value: f.key, label: f.label }))
  );
  protected readonly hasCriteria = computed(() => this.criteria().length > 0);
  protected readonly showClearButton = computed(() => this.config().showClearButton ?? FILTER_DEFAULTS.showClearButton);
  protected readonly showSearchButton = computed(() => this.config().showSearchButton ?? FILTER_DEFAULTS.showSearchButton);
  protected readonly criteriaAreaClasses = computed(() => {
    const classes = ['app-filters-advanced-criteria'];
    if (this.hasCriteria()) {
      classes.push('app-filters-advanced-criteria--active');
    }
    return classes.join(' ');
  });
  private readonly fb = inject(FormBuilder);
  protected readonly builderForm = this.fb.nonNullable.group({
    field: ['', Validators.required],
    operator: ['', Validators.required],
    value: '',
  });
  private readonly destroyRef = inject(DestroyRef);
  private criterionCounter = 0;
  private readonly formState = toSignal(this.builderForm.valueChanges, {
    initialValue: this.builderForm.getRawValue(),
  });
  protected readonly selectedField = computed(() => {
    const key = this.formState().field;
    return key ? this.config().fields.find(f => f.key === key) ?? null : null;
  });
  protected readonly operatorOptions = computed(() => {
    const field = this.selectedField();
    if (!field) return [];
    return this.operators()
      .filter(op => op.applicableTo.includes(field.type))
      .map(op => ({ value: op.key, label: op.label }));
  });
  protected readonly valueOptions = computed(() => {
    const field = this.selectedField();
    return field?.type === 'select' && field.options ? field.options : [];
  });
  protected readonly selectedFieldType = computed(() => this.selectedField()?.type ?? null);
  readonly selectedOperator = computed(() => {
    const key = this.formState().operator;
    return key ? this.operators().find(o => o.key === key) ?? null : null;
  });
  protected readonly isNoValueOperator = computed(() => this.selectedOperator()?.requiresValue === false);

  protected readonly fieldLabel = computed(() =>
    $localize`:Filter|Field selector label@@filter.form.field:Field`
  );
  protected readonly operatorLabel = computed(() =>
    $localize`:Filter|Operator selector label@@filter.form.operator:Operator`
  );
  protected readonly valueLabel = computed(() =>
    $localize`:Filter|Value input label@@filter.form.value:Value`
  );
  protected readonly dateLabel = computed(() =>
    $localize`:Filter|Date input label@@filter.form.date:Date`
  );

  protected readonly canAddCriterion = computed(() => {
    const operator = this.selectedOperator();
    if (!this.selectedField() || !operator) return false;
    if (!operator.requiresValue) return true;
    const value = this.formState().value;
    return value !== null && value !== undefined && value !== '';
  });
  private readonly autoSearch = computed(() => this.config().autoSearch ?? FILTER_DEFAULTS.autoSearch);
  private readonly maxCriteria = computed(() => this.config().maxCriteria ?? FILTER_DEFAULTS.maxCriteria);
  private readonly criterionDisplay = inject(CriterionDisplayPipe);

  constructor() {
    this.setupFormCascade();

    effect(() => {
      const initial = this.initialCriteria();
      if (initial.length > 0) {
        this.criteria.set([...initial]);
      }
    });
  }

  protected addCriterion(): void {
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
    this.emitAllCriteria();
    this.emitAutoSearch();
  }

  protected getRemoveLabel(criterion: AppFilterCriterion): string {
    const displayValue = this.criterionDisplay.transform(criterion);
    const criteria = `${criterion.field.label} ${criterion.operator.symbol} ${displayValue}`;
    return $localize`:Filter|Remove criterion button@@filter.pill.remove:Remove filter: ${criteria}:criteria:`;
  }

  protected removeCriterion(id: string): void {
    this.criteria.update(current => current.filter(c => c.id !== id));
    this.emitAllCriteria();
    this.emitAutoSearch();
  }

  protected clearAllCriteria(): void {
    this.criteria.set([]);
    this.criteriaChange.emit(togglesToCriteria(this.currentToggles(), this.operators()));
    this.emitAutoSearch();
  }

  protected emitSearch(): void {
    this.emitAllCriteria();
  }

  protected onToggleChange(togglesRecord: Record<string, boolean>): void {
    this.currentToggles.set(togglesRecord);
    this.emitAllCriteria();
    this.emitAutoSearch();
  }

  private setupFormCascade(): void {
    this.builderForm.controls.field.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        this.builderForm.controls.operator.reset();
        this.builderForm.controls.value.reset();
      });

    this.builderForm.controls.operator.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((key: string): void => {
        const op = this.operators().find(o => o.key === key);
        if (op && !op.requiresValue) {
          this.builderForm.controls.value.reset();
        }
      });
  }

  private emitAutoSearch(): void {
    if (this.autoSearch()) {
      this.emitAllCriteria();
    }
  }

  private emitAllCriteria(): void {
    const toggleCriteria = togglesToCriteria(this.currentToggles(), this.operators());
    this.criteriaChange.emit([...this.criteria(), ...toggleCriteria]);
  }
}
