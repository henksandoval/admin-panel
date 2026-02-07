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
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppTableFiltersConfig, AppTableFilterValues } from './app-table-filters.model';

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filters-container">
      <div class="filters-fields">
        @for (filter of config().filters; track filter.key) {
          <mat-form-field 
            [appearance]="config().appearance ?? 'outline'"
            [style.width]="filter.width ?? 'auto'"
            class="filter-field">
            
            <mat-label>{{ filter.label }}</mat-label>
            
            @switch (filter.type ?? 'text') {
              @case ('text') {
                <input
                  matInput
                  [formControl]="getControl(filter.key)"
                  [placeholder]="filter.placeholder ?? ''"
                  type="text">
              }
              
              @case ('number') {
                <input
                  matInput
                  [formControl]="getControl(filter.key)"
                  [placeholder]="filter.placeholder ?? ''"
                  type="number">
              }
              
              @case ('select') {
                <mat-select [formControl]="getControl(filter.key)">
                  <mat-option [value]="null">-- Todos --</mat-option>
                  @for (option of filter.options ?? []; track option.value) {
                    <mat-option [value]="option.value">
                      {{ option.label }}
                    </mat-option>
                  }
                </mat-select>
              }
              
              @case ('date') {
                <input
                  matInput
                  [formControl]="getControl(filter.key)"
                  [matDatepicker]="picker"
                  [placeholder]="filter.placeholder ?? 'DD/MM/YYYY'">
                <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              }
            }
            
            @if (hasValue(filter.key)) {
              <button
                matSuffix
                mat-icon-button
                type="button"
                matTooltip="Limpiar"
                (click)="clearFilter(filter.key, $event)">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        }
      </div>
      
      @if (config().showClearAll && hasAnyValue()) {
        <button
          mat-stroked-button
          type="button"
          class="clear-all-button"
          (click)="clearAll()">
          <mat-icon>filter_alt_off</mat-icon>
          {{ config().clearAllLabel ?? 'Limpiar filtros' }}
        </button>
      }
    </div>
  `,
  styles: [`
    .filters-container {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--mat-sys-surface-container-low, rgba(0, 0, 0, 0.02));
      border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.12));
    }

    .filters-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      flex: 1;
    }

    .filter-field {
      min-width: 180px;
      flex: 1 1 auto;
      max-width: 280px;
    }

    .clear-all-button {
      align-self: center;
      white-space: nowrap;
    }

    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    @media (max-width: 768px) {
      .filters-container {
        flex-direction: column;
      }

      .filters-fields {
        width: 100%;
      }

      .filter-field {
        max-width: none;
        width: 100%;
      }

      .clear-all-button {
        width: 100%;
      }
    }
  `]
})
export class AppTableFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // === Inputs ===
  config = input.required<AppTableFiltersConfig>();
  values = input<AppTableFilterValues>({});

  // === Outputs ===
  valuesChange = output<AppTableFilterValues>();
  filterChange = output<{ key: string; value: any }>();

  // === Internal State ===
  private formGroup = signal<FormGroup>(new FormGroup({}));
  private initialized = signal(false);

  // === Computed ===
  private currentValues = computed(() => {
    const form = this.formGroup();
    return form ? form.value : {};
  });

  constructor() {
    // Sincronizar valores externos con el form
    effect(() => {
      const externalValues = this.values();
      const form = this.formGroup();
      
      if (this.initialized() && form) {
        Object.keys(form.controls).forEach(key => {
          const control = form.get(key);
          const externalValue = externalValues[key] ?? null;
          
          if (control && control.value !== externalValue) {
            control.setValue(externalValue, { emitEvent: false });
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const filters = this.config().filters;
    const initialValues = this.values();
    const group: Record<string, FormControl> = {};

    filters.forEach(filter => {
      const initialValue = initialValues[filter.key] ?? null;
      group[filter.key] = new FormControl(initialValue);
    });

    const form = new FormGroup(group);
    this.formGroup.set(form);

    // Configurar debounce y subscripción
    const debounceMs = this.config().debounceMs ?? 300;

    form.valueChanges
      .pipe(
        debounceTime(debounceMs),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(values => {
        const cleanedValues = this.cleanValues(values);
        this.valuesChange.emit(cleanedValues);
      });

    this.initialized.set(true);
  }

  getControl(key: string): FormControl {
    const form = this.formGroup();
    return (form?.get(key) as FormControl) ?? new FormControl();
  }

  hasValue(key: string): boolean {
    const value = this.getControl(key).value;
    return value !== null && value !== undefined && value !== '';
  }

  hasAnyValue(): boolean {
    const form = this.formGroup();
    if (!form) return false;
    
    return Object.values(form.value).some(
      value => value !== null && value !== undefined && value !== ''
    );
  }

  clearFilter(key: string, event?: Event): void {
    event?.stopPropagation();
    
    const control = this.getControl(key);
    control.setValue(null);
    
    this.filterChange.emit({ key, value: null });
  }

  clearAll(): void {
    const form = this.formGroup();
    if (form) {
      form.reset();
      this.valuesChange.emit({});
    }
  }

  private cleanValues(values: Record<string, any>): AppTableFilterValues {
    const cleaned: AppTableFilterValues = {};
    
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }
}