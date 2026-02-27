import { ChangeDetectionStrategy, Component, computed, input, output, signal, } from "@angular/core";
import { AppCardComponent } from "@ui-atoms/app-card/app-card.component";
import { AppPaginationComponent } from "@ui-atoms/app-pagination/app-pagination.component";
import { AppTableComponent } from "@ui-atoms/app-table/app-table.component";
import { AppAdvancedFilterComponent } from "@ui-molecules/app-filters/advanced/app-advanced-filter.component";
import { AppFilterCriterion } from "@ui-molecules/app-filters/app-filter.model";
import { evaluateCriteria } from "@ui-molecules/app-filters/criteria-evaluator.utils";
import { AppSimpleFilterComponent } from "@ui-molecules/app-filters/simple/app-simple-filter.component";
import { AppTableBase } from "../app-table-base";
import { AnyRecord } from "../app-table.model";
import { defaultTableSort } from "../app-table.utils";
import { AppTableFilterFn, AppTableSortFn, TABLE_CLIENT_SIDE_DEFAULTS } from "./app-table-client-side.model";

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
  templateUrl: './app-table-client-side.component.html'
})
export class AppTableClientSideComponent<T extends AnyRecord> extends AppTableBase<T> {
  readonly data = input<T[]>([]);
  readonly filterFn = input<AppTableFilterFn<T>>();
  readonly sortFn = input<AppTableSortFn<T>>();

  filtersChange = output<AppFilterCriterion[]>();

  readonly currentFilters = signal<AppFilterCriterion[]>([]);

  readonly advancedFiltersTitle = $localize`:Table|Advanced filters card title@@table.advancedFilters.title:Advanced filters`;

  private readonly filteredData = computed(() => {
    const data = this.data();
    const criteria = this.currentFilters();

    if (criteria.length === 0) return data;

    const customFn = this.filterFn();
    return customFn ? customFn(data, criteria) : evaluateCriteria(data, criteria);
  });

  private readonly sortedData = computed(() => {
    const data = this.filteredData();
    const sort = this.currentSort();

    if (!sort.active || !sort.direction) return data;

    const customFn = this.sortFn();
    return customFn ? customFn(data, sort) : defaultTableSort(data, sort);
  });

  readonly displayData = computed(() => {
    const data = this.sortedData();
    if (!this.showPagination()) return data;

    const start = this.pageIndex() * this.pageSize();
    return data.slice(start, start + this.pageSize());
  });

  onFiltersChange(criteria: AppFilterCriterion[]): void {
    this.currentFilters.set(criteria);

    if (this.resetPageOnFilter()) {
      this.pageIndex.set(TABLE_CLIENT_SIDE_DEFAULTS.initialPageIndex);
    }

    this.filtersChange.emit(criteria);
  }

  protected override totalItemCount(): number {
    return this.sortedData().length;
  }

  protected override skipBoundaryGuard(): boolean {
    return false;
  }
}
