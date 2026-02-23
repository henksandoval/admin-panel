import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { AppPaginationComponent } from '@shared/atoms/app-pagination/app-pagination.component';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppAdvancedFilterComponent } from '@shared/molecules/app-filters/advanced/app-advanced-filter.component';
import { AppFilterCriterion, AppFilterValues } from '@shared/molecules/app-filters/app-filter.model';
import { criteriaToValues } from '@shared/molecules/app-filters/criteria-evaluator.utils';
import { AppSimpleFilterComponent } from '@shared/molecules/app-filters/simple/app-simple-filter.component';
import { AppTableBase } from '../app-table-base';
import { AnyRecord } from '../app-table.model';
import { AppPageEvent } from '@shared/atoms/app-pagination/app-pagination.model';
import { AppTableServerParams, TABLE_SERVER_SIDE_DEFAULTS } from './app-table-server-side.model';

@Component({
  selector: 'app-table-server-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppSimpleFilterComponent,
    AppAdvancedFilterComponent,
    AppPaginationComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-server-side.component.scss',
  templateUrl: './app-table-server-side.component.html',
})
export class AppTableServerSideComponent<T extends AnyRecord> extends AppTableBase<T> {
  readonly data = input<T[]>([]);
  readonly totalItems = input<number>(0);

  filtersChange = output<AppFilterValues>();
  paramsChange = output<AppTableServerParams>();

  readonly filterValues = signal<AppFilterValues>({});

  readonly currentParams = computed<AppTableServerParams>(() => ({
    filters: this.filterValues(),
    sort: this.currentSort(),
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
  }));

  protected override totalItemCount(): number {
    return this.totalItems();
  }

  protected override skipBoundaryGuard(): boolean {
    return this.totalItems() === 0;
  }

  onFiltersChange(criteria: AppFilterCriterion[]): void {
    const values = criteriaToValues(criteria);
    this.filterValues.set(values);

    if (this.resetPageOnFilter()) {
      this.pageIndex.set(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
    }

    this.filtersChange.emit(values);
    this.emitParamsChange();
  }

  override onSortChange(sort: AppTableSort): void {
    super.onSortChange(sort);
    this.emitParamsChange();
  }

  override onPageChange(event: AppPageEvent): void {
    super.onPageChange(event);
    this.emitParamsChange();
  }

  private emitParamsChange(): void {
    this.paramsChange.emit(this.currentParams());
  }
}

