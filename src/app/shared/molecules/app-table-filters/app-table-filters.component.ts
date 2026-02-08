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
import { AppFormInputComponent } from '@shared/molecules/app-form-input/app-form-input.component';
import { AppFormSelectComponent } from '@shared/molecules/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form-select/app-form-select.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  AppTableFiltersConfig,
  AppTableFilterValues,
  FILTERS_DEFAULTS,
} from './app-table-filters.model';

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,

    // PDS
    AppFormInputComponent,
    AppFormSelectComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app-table-filters.component.scss'],
  template: `
    <div class="filters-container">
      <div class="filters-fields">
        @for (filter of config().filters; track filter.key) {
          <div
            class="filter-field"
            [style.width]="filter.width ?? 'auto'">

            @switch (filter.type ?? 'text') {
              @case ('text') {
                <app-form-input
                  [formControl]="getControl(filter.key)"
                  [config]="{
                    type: 'text',
                    label: filter.label,
                    placeholder: filter.placeholder ?? '',
                    appearance: appearance()
                  }">
                </app-form-input>
              }

              @case ('number') {
                <app-form-input
                  [formControl]="getControl(filter.key)"
                  [config]="{
                    type: 'number',
                    label: filter.label,
                    placeholder: filter.placeholder ?? '',
                    appearance: appearance()
                  }">
                </app-form-input>
              }

              @case ('select') {
                <app-form-select
                  [formControl]="getControl(filter.key)"
                  [options]="getSelectOptions(filter)"
                  [config]="{
                    label: filter.label,
                    appearance: appearance()
                  }">
                </app-form-select>
              }

              @case ('date') {
                <mat-form-field [appearance]="appearance()" class="w-full">
                  <mat-label>{{ filter.label }}</mat-label>
                  <input
                    matInput
                    [formControl]="getControl(filter.key)"
                    [matDatepicker]="picker"
                    [placeholder]="filter.placeholder ?? 'DD/MM/YYYY'" />
                  <mat-datepicker-toggle [for]="picker" />
                  <mat-datepicker #picker />
                </mat-form-field>
              }
            }
          </div>
        }
      </div>

      @if (showClearAll() && hasAnyValue()) {
        <button
          mat-stroked-button
          type="button"
          class="clear-all-button"
          (click)="clearAll()">
          <mat-icon>filter_alt_off</mat-icon>
          {{ clearAllLabel() }}
        </button>
      }
    </div>
  `,
})
export class AppTableFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  config = input.required<AppTableFiltersConfig>();
  values = input<AppTableFilterValues>({});

  valuesChange = output<AppTableFilterValues>();
  filterChange = output<{ key: string; value: any }>();

  appearance = computed(() => this.config().appearance ?? FILTERS_DEFAULTS.appearance);
  showClearAll = computed(() => this.config().showClearAll ?? FILTERS_DEFAULTS.showClearAll);
  clearAllLabel = computed(() => this.config().clearAllLabel ?? FILTERS_DEFAULTS.clearAllLabel);
  private debounceMs = computed(() => this.config().debounceMs ?? FILTERS_DEFAULTS.debounceMs);

  private formGroup = signal(new FormGroup<Record<string, FormControl>>({}));

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
    const filters = this.config().filters;
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

  getSelectOptions(filter: { options?: { value: any; label: string }[] }): SelectOption[] {
    const resetOption: SelectOption = { value: null as any, label: '-- Todos --' };
    return [resetOption, ...(filter.options ?? [])];
  }

  hasAnyValue(): boolean {
    return Object.values(this.formGroup().value).some(
      (value) => value !== null && value !== undefined && value !== '',
    );
  }

  hasValue(key: string): boolean {
    const value = this.getControl(key)?.value;
    return value !== null && value !== undefined && value !== '';
  }

  clearFilter(key: string, event?: Event): void {
    event?.stopPropagation();
    this.getControl(key).setValue(null);
    this.filterChange.emit({ key, value: null });
  }

  clearAll(): void {
    this.formGroup().reset();
    this.valuesChange.emit({});
  }

  private cleanValues(values: Record<string, any>): AppTableFilterValues {
    return Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      ),
    );
  }
}