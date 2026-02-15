import { Component, ChangeDetectionStrategy, input, output, contentChild, TemplateRef, signal, computed, effect } from "@angular/core";
import { AppCardComponent } from "@shared/atoms/app-card/app-card.component";
import { AppPaginationComponent } from "@shared/atoms/app-pagination/app-pagination.component";
import { AppPaginationConfig, AppPageEvent, AppPaginationState } from "@shared/atoms/app-pagination/app-pagination.model";
import { AppTableComponent } from "@shared/atoms/app-table/app-table.component";
import { AppTableConfig, AppTableSort, AppTableAction } from "@shared/atoms/app-table/app-table.model";
import { AppAdvancedFilterComponent } from "@shared/molecules/app-filters/advanced/app-advanced-filter.component";
import { AppFiltersConfig, AppFilterValues, AppFiltersOutput, AppFilterCriterion } from "@shared/molecules/app-filters/app-filter.model";
import { evaluateCriteria } from "@shared/molecules/app-filters/criteria-evaluator";
import { AppSimpleFilterComponent } from "@shared/molecules/app-filters/simple/app-simple-filter.component";
import { AppTableFilterFn, AppTableCriteriaFilterFn, AppTableToggleFilterFn, AppTableSortFn } from "./app-table-client-side.model";


@Component({
  selector: 'app-table-client-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppSimpleFilterComponent,
    AppAdvancedFilterComponent,
    AppPaginationComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-client-side.component.scss',
  template: `
    <div class="app-client-side-table">
      @if (filtersConfig() && !filtersAdvancedConfig()) {
        <app-table-filters
          [config]="filtersConfig()!"
          [values]="simpleFilterValues()"
          (valuesChange)="onSimpleFiltersChange($event)">
        </app-table-filters>
      }

      @if (filtersAdvancedConfig()) {
        <app-card
          title="Filtros avanzados"
          icon="filter_alt"
          [isExpandable]="true"
          [expanded]="false"
          class="mb-4">
          <app-filters-advanced
            [config]="filtersAdvancedConfig()!"
            (search)="onAdvancedSearch($event)">
          </app-filters-advanced>
        </app-card>
      }

      <app-table
        [config]="tableConfig()"
        [data]="displayData()"
        [sort]="currentSort()"
        [loading]="loading()"
        [cellTemplateRef]="projectedCellTemplate()"
        (sortChange)="onSortChange($event)"
        (rowClick)="rowClick.emit($event)"
        (actionClick)="actionClick.emit($event)">
        <ng-content />
      </app-table>

      @if (paginationConfig()) {
        <app-pagination
          [config]="paginationConfig()!"
          [state]="paginationState()"
          (pageChange)="onPageChange($event)">
        </app-pagination>
      }
    </div>
  `,
})
export class AppTableClientSideComponent<T extends Record<string, any> = Record<string, any>> {
  // ── Inputs de configuración ──
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly filtersAdvancedConfig = input<AppFiltersConfig>();
  readonly paginationConfig = input<AppPaginationConfig>();

  // ── Inputs de datos ──
  readonly data = input<T[]>([]);
  readonly loading = input(false);

  // ── Inputs de funciones custom ──
  readonly filterFn = input<AppTableFilterFn<T>>();
  readonly criteriaFilterFn = input<AppTableCriteriaFilterFn<T>>();
  readonly toggleFilterFn = input<AppTableToggleFilterFn<T>>();
  readonly sortFn = input<AppTableSortFn<T>>();

  // ── Outputs ──
  sortChange = output<AppTableSort>();
  filterChange = output<AppFilterValues>();
  advancedSearch = output<AppFiltersOutput>();
  pageChange = output<AppPageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // ── Estado interno ──
  readonly projectedCellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly simpleFilterValues = signal<AppFilterValues>({});
  readonly advancedCriteria = signal<AppFilterCriterion[]>([]);
  readonly activeToggles = signal<Record<string, boolean>>({});
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  // ── Pipeline de datos ──

  /**
   * Paso 1: Aplicar toggles (e.g., mostrar/ocultar inactivos).
   */
  private readonly afterToggleFilter = computed(() => {
    const data = this.data();
    const toggles = this.activeToggles();

    if (!Object.keys(toggles).length) return data;

    const customFn = this.toggleFilterFn();
    return customFn ? customFn(data, toggles) : data;
  });

  /**
   * Paso 2: Aplicar filtros (simples O avanzados, nunca ambos).
   * Los criterios avanzados tienen prioridad si existen.
   */
  private readonly filteredData = computed(() => {
    const data = this.afterToggleFilter();
    const criteria = this.advancedCriteria();
    const simpleFilters = this.simpleFilterValues();

    if (criteria.length > 0) {
      const customFn = this.criteriaFilterFn();
      return customFn ? customFn(data, criteria) : evaluateCriteria(data, criteria);
    }

    const activeSimple = Object.entries(simpleFilters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!activeSimple.length) return data;

    const customFn = this.filterFn();
    return customFn
      ? customFn(data, simpleFilters)
      : this.defaultSimpleFilter(data, simpleFilters);
  });

  /**
   * Paso 3: Ordenar.
   */
  private readonly sortedData = computed(() => {
    const data = this.filteredData();
    const sort = this.currentSort();

    if (!sort.active || !sort.direction) return data;

    const customFn = this.sortFn();
    return customFn ? customFn(data, sort) : this.defaultSort(data, sort);
  });

  /**
   * Paso 4: Paginar.
   */
  readonly displayData = computed(() => {
    const data = this.sortedData();
    if (!this.paginationConfig()) return data;

    const start = this.pageIndex() * this.pageSize();
    return data.slice(start, start + this.pageSize());
  });

  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.sortedData().length,
  }));

  private readonly boundaryGuard = effect(() => {
    const totalItems = this.sortedData().length;
    const pageSize = this.pageSize();
    const currentPage = this.pageIndex();
    const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);

    if (currentPage > lastPage) {
      this.pageIndex.set(lastPage);
    }
  });

  // ── Handlers ──

  onSimpleFiltersChange(values: AppFilterValues): void {
    this.simpleFilterValues.set(values);
    this.advancedCriteria.set([]); // limpiar criterios avanzados
    this.activeToggles.set({});
    this.pageIndex.set(0);
    this.filterChange.emit(values);
  }

  onAdvancedSearch(advancedOutput: AppFiltersOutput): void {
    this.advancedCriteria.set(advancedOutput.criteria);
    this.activeToggles.set(advancedOutput.toggles);
    this.simpleFilterValues.set({}); // limpiar filtros simples
    this.pageIndex.set(0);
    this.advancedSearch.emit(advancedOutput);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.sortChange.emit(sort);
  }

  onPageChange(event: AppPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  // ── Filtro simple por defecto ──

  private defaultSimpleFilter(data: T[], filters: AppFilterValues): T[] {
    const active = Object.entries(filters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!active.length) return data;

    return data.filter(item =>
      active.every(([key, filterValue]) => {
        const itemValue: unknown = item[key];
        if (itemValue === null || itemValue === undefined) return false;

        if (filterValue instanceof Date && itemValue instanceof Date) {
          return itemValue.getTime() === filterValue.getTime();
        }

        return String(itemValue)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      }),
    );
  }

  // ── Ordenamiento por defecto ──

  private defaultSort(data: T[], sort: AppTableSort): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.active as keyof T];
      const bVal = b[sort.active as keyof T];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}