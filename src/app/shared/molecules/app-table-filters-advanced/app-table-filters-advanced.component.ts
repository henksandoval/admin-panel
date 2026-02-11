import { Component, computed, effect, input, output, signal, WritableSignal,
  ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppTableFiltersAdvancedConfig, AppTableFiltersAdvancedOutput, AppTableFilterCriterion, AppTableFilterField,
  AppTableFilterOperator, AppTableFilterToggle, DEFAULT_FILTER_OPERATORS, TABLE_FILTERS_ADVANCED_DEFAULTS
} from './app-table-filters-advanced.model';

@Component({
  selector: 'app-table-filters-advanced',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-filters-advanced.component.scss',
  template: `
    <div class="app-filters-advanced">
      <div
        class="app-filters-pills"
        [class.has-pills]="criteria().length > 0">
        @if (criteria().length === 0) {
          <span class="app-filters-pills-placeholder">
            <mat-icon>filter_list</mat-icon>
            No hay filtros aplicados
          </span>
        } @else {
          @for (criterion of criteria(); track criterion.id) {
            <div
              class="app-filter-pill"
              [attr.data-type]="criterion.field.type">
              <span class="app-filter-pill-field">{{ criterion.field.label }}</span>
              <span class="app-filter-pill-operator">{{ criterion.operator.symbol }}</span>
              <span class="app-filter-pill-value">{{ criterion.displayValue }}</span>
              <button
                type="button"
                class="app-filter-pill-remove"
                (click)="removeCriterion(criterion.id)"
                [attr.aria-label]="'Eliminar filtro ' + criterion.field.label">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        }
      </div>

      <div class="app-filters-builder">
        <form [formGroup]="builderForm" class="app-filters-builder-row">
          <span class="app-filters-builder-label">Agregar filtro:</span>

          <div class="app-filters-builder-field">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Campo</mat-label>
              <mat-select
                formControlName="field"
                (selectionChange)="onFieldChange()">
                @for (field of availableFields(); track field.key) {
                  <mat-option [value]="field.key">{{ field.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="app-filters-builder-field">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Operador</mat-label>
              <mat-select
                formControlName="operator"
                (selectionChange)="onOperatorChange()">
                @for (op of availableOperators(); track op.key) {
                  <mat-option [value]="op.key">{{ op.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="app-filters-builder-field value-field">
            @if (selectedField() && !isNoValueOperator()) {
              @switch (selectedField()!.type) {
                @case ('select') {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Valor</mat-label>
                    <mat-select formControlName="value">
                      @for (opt of selectedField()!.options || []; track opt.value) {
                        <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                }
                @case ('date') {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Fecha</mat-label>
                    <input
                      matInput
                      [matDatepicker]="picker"
                      formControlName="value">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                }
                @case ('number') {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Valor</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="value"
                      placeholder="Ingrese un número">
                  </mat-form-field>
                }
                @case ('boolean') {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Valor</mat-label>
                    <mat-select formControlName="value">
                      <mat-option [value]="true">Sí</mat-option>
                      <mat-option [value]="false">No</mat-option>
                    </mat-select>
                  </mat-form-field>
                }
                @default {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Valor</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="value"
                      placeholder="Ingrese un valor">
                  </mat-form-field>
                }
              }
            }
          </div>

          <button
            mat-raised-button
            color="primary"
            type="button"
            [disabled]="!canAddCriterion()"
            (click)="addCriterion()">
            <mat-icon>add</mat-icon>
            Agregar
          </button>
        </form>
      </div>

      @if (hasToggles() || showActions()) {
        <div class="app-filters-footer">
          <div class="app-filters-toggles">
            @for (toggle of toggles(); track toggle.key) {
              <label class="app-filter-toggle">
                <mat-checkbox
                  [checked]="toggle.value"
                  (change)="onToggleChange(toggle.key, $event.checked)">
                  <span class="toggle-label">{{ toggle.label }}</span>
                </mat-checkbox>
              </label>
            }
          </div>

          <div class="app-filters-actions">
            @if (showClearButton() && criteria().length > 0) {
              <button
                mat-stroked-button
                type="button"
                (click)="clearAllCriteria()">
                <mat-icon>restart_alt</mat-icon>
                Limpiar filtros
              </button>
            }

            @if (showSearchButton()) {
              <button
                mat-raised-button
                color="primary"
                type="button"
                (click)="emitSearch()">
                <mat-icon>search</mat-icon>
                Buscar
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AppTableFiltersAdvancedComponent {
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

  readonly availableFields = computed(() => this.config().fields || []);

  readonly availableOperators = computed(() => {
    const field = this.selectedField();
    if (!field) return [];

    return this.operators.filter(op =>
      op.applicableTo.includes(field.type)
    );
  });

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

  constructor(private fb: FormBuilder) {
    this.initializeForm();

    effect(() => {
      this.initializeToggles();
      this.loadInitialCriteria();
    });
  }

  private initializeForm(): void {
    const destroyRef = inject(DestroyRef);

    this.builderForm = this.fb.group({
      field: ['', Validators.required],
      operator: ['', Validators.required],
      value: [''],
    });

    this.builderForm.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(value => {
        this.formValue.set(value);
      });
  }

  private initializeToggles(): void {
    const configToggles = this.config().toggles || [];
    this.toggles.set(configToggles.map(t => ({ ...t })));
  }

  private loadInitialCriteria(): void {
    const initial = this.initialCriteria();
    if (initial?.length) {
      this.criteria.set([...initial]);
    }
  }

  onFieldChange(): void {
    const fieldKey = this.builderForm.value.field;
    const field = this.availableFields().find(f => f.key === fieldKey) || null;
    this.selectedField.set(field);

    this.builderForm.patchValue({ operator: '', value: '' });
    this.selectedOperator.set(null);
  }

  onOperatorChange(): void {
    const opKey = this.builderForm.value.operator;
    const op = this.operators.find(o => o.key === opKey) || null;
    this.selectedOperator.set(op);

    if (op && !op.requiresValue) {
      this.builderForm.patchValue({ value: '' });
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
    return `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
