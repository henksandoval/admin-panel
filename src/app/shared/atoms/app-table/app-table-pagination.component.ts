import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AppTablePaginationConfig,
  AppTablePaginationState,
  AppTablePageEvent,
  PAGINATION_DEFAULTS,
} from './app-table-pagination.model';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app-table-pagination.component.scss'],
  template: `
    <div class="pagination-container">
      @if (showPageSizeSelector()) {
        <div class="page-size-selector">
          <span class="page-size-label">{{ itemsPerPageLabel() }}</span>
          <mat-form-field appearance="outline" class="page-size-field">
            <mat-select
              [value]="state().pageSize"
              (selectionChange)="onPageSizeChange($event.value)">
              @for (option of pageSizeOptions(); track option) {
                <mat-option [value]="option">{{ option }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      }

      <div class="range-info">{{ rangeLabel() }}</div>

      <div class="navigation-buttons">
        @if (showFirstLastButtons()) {
          <button
            mat-icon-button
            type="button"
            [disabled]="isFirstPage()"
            [matTooltip]="firstPageLabel()"
            (click)="goToFirstPage()">
            <mat-icon>first_page</mat-icon>
          </button>
        }

        <button
          mat-icon-button
          type="button"
          [disabled]="isFirstPage()"
          [matTooltip]="previousPageLabel()"
          (click)="goToPreviousPage()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <button
          mat-icon-button
          type="button"
          [disabled]="isLastPage()"
          [matTooltip]="nextPageLabel()"
          (click)="goToNextPage()">
          <mat-icon>chevron_right</mat-icon>
        </button>

        @if (showFirstLastButtons()) {
          <button
            mat-icon-button
            type="button"
            [disabled]="isLastPage()"
            [matTooltip]="lastPageLabel()"
            (click)="goToLastPage()">
            <mat-icon>last_page</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
})
export class AppTablePaginationComponent {
  config = input<AppTablePaginationConfig>({});
  state = input.required<AppTablePaginationState>();

  pageChange = output<AppTablePageEvent>();

  pageSizeOptions = computed(() => this.config().pageSizeOptions ?? PAGINATION_DEFAULTS.pageSizeOptions);
  showFirstLastButtons = computed(() => this.config().showFirstLastButtons ?? PAGINATION_DEFAULTS.showFirstLastButtons);
  showPageSizeSelector = computed(() => this.config().showPageSizeSelector ?? PAGINATION_DEFAULTS.showPageSizeSelector);
  itemsPerPageLabel = computed(() => this.config().itemsPerPageLabel ?? PAGINATION_DEFAULTS.itemsPerPageLabel);
  firstPageLabel = computed(() => this.config().firstPageLabel ?? PAGINATION_DEFAULTS.firstPageLabel);
  lastPageLabel = computed(() => this.config().lastPageLabel ?? PAGINATION_DEFAULTS.lastPageLabel);
  previousPageLabel = computed(() => this.config().previousPageLabel ?? PAGINATION_DEFAULTS.previousPageLabel);
  nextPageLabel = computed(() => this.config().nextPageLabel ?? PAGINATION_DEFAULTS.nextPageLabel);

  private ofLabel = computed(() => this.config().ofLabel ?? PAGINATION_DEFAULTS.ofLabel);

  totalPages = computed(() => {
    const { pageSize, totalItems } = this.state();
    return Math.ceil(totalItems / pageSize) || 1;
  });

  rangeLabel = computed(() => {
    const { pageIndex, pageSize, totalItems } = this.state();
    if (totalItems === 0) return `0 ${this.ofLabel()} 0`;

    const startIndex = pageIndex * pageSize + 1;
    const endIndex = Math.min((pageIndex + 1) * pageSize, totalItems);
    return `${startIndex} - ${endIndex} ${this.ofLabel()} ${totalItems}`;
  });

  isFirstPage = computed(() => this.state().pageIndex === 0);
  isLastPage = computed(() => this.state().pageIndex >= this.totalPages() - 1);

  onPageSizeChange(newPageSize: number): void {
    const { pageIndex, pageSize } = this.state();
    const currentFirstItemIndex = pageIndex * pageSize;
    const newPageIndex = Math.floor(currentFirstItemIndex / newPageSize);
    this.emitPageChange(newPageIndex, newPageSize);
  }

  goToFirstPage(): void {
    if (!this.isFirstPage()) this.emitPageChange(0, this.state().pageSize);
  }

  goToPreviousPage(): void {
    if (!this.isFirstPage()) this.emitPageChange(this.state().pageIndex - 1, this.state().pageSize);
  }

  goToNextPage(): void {
    if (!this.isLastPage()) this.emitPageChange(this.state().pageIndex + 1, this.state().pageSize);
  }

  goToLastPage(): void {
    if (!this.isLastPage()) this.emitPageChange(this.totalPages() - 1, this.state().pageSize);
  }

  private emitPageChange(pageIndex: number, pageSize: number): void {
    this.pageChange.emit({
      pageIndex,
      pageSize,
      previousPageIndex: this.state().pageIndex,
    });
  }
}