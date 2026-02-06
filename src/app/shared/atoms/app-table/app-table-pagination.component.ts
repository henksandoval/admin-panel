// app-table-pagination.component.ts
import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AppTablePaginationConfig,
  AppTablePaginationState,
  AppTablePageEvent
} from './app-table-pagination.model';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagination-container">
      @if (config().showPageSizeSelector !== false) {
        <div class="page-size-selector">
          <span class="page-size-label">
            {{ config().itemsPerPageLabel ?? 'Items por página:' }}
          </span>
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

      <div class="range-info">
        {{ rangeLabel() }}
      </div>

      <div class="navigation-buttons">
        @if (config().showFirstLastButtons !== false) {
          <button
            mat-icon-button
            type="button"
            [disabled]="isFirstPage()"
            [matTooltip]="config().firstPageLabel ?? 'Primera página'"
            (click)="goToFirstPage()">
            <mat-icon>first_page</mat-icon>
          </button>
        }

        <button
          mat-icon-button
          type="button"
          [disabled]="isFirstPage()"
          [matTooltip]="config().previousPageLabel ?? 'Página anterior'"
          (click)="goToPreviousPage()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <button
          mat-icon-button
          type="button"
          [disabled]="isLastPage()"
          [matTooltip]="config().nextPageLabel ?? 'Página siguiente'"
          (click)="goToNextPage()">
          <mat-icon>chevron_right</mat-icon>
        </button>

        @if (config().showFirstLastButtons !== false) {
          <button
            mat-icon-button
            type="button"
            [disabled]="isLastPage()"
            [matTooltip]="config().lastPageLabel ?? 'Última página'"
            (click)="goToLastPage()">
            <mat-icon>last_page</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1.5rem;
      padding: 0.75rem 1rem;
      background-color: var(--mat-sys-surface-container-low, rgba(0, 0, 0, 0.02));
      border-top: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.12));
      flex-wrap: wrap;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-size-label {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
      white-space: nowrap;
    }

    .page-size-field {
      width: 70px;
    }

    :host ::ng-deep .page-size-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    :host ::ng-deep .page-size-field .mat-mdc-text-field-wrapper {
      padding: 0 8px;
    }

    :host ::ng-deep .page-size-field .mat-mdc-form-field-infix {
      padding: 8px 0;
      min-height: 36px;
    }

    .range-info {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
      white-space: nowrap;
    }

    .navigation-buttons {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .navigation-buttons button {
      color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
    }

    .navigation-buttons button:disabled {
      color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.26));
    }

    @media (max-width: 600px) {
      .pagination-container {
        justify-content: center;
        gap: 1rem;
      }

      .page-size-selector {
        order: 2;
        width: 100%;
        justify-content: center;
      }

      .range-info {
        order: 1;
      }

      .navigation-buttons {
        order: 3;
      }
    }
  `]
})
export class AppTablePaginationComponent {
  // === Inputs ===
  config = input<AppTablePaginationConfig>({});
  state = input.required<AppTablePaginationState>();

  // === Outputs ===
  pageChange = output<AppTablePageEvent>();

  // === Computed ===
  pageSizeOptions = computed(() => {
    return this.config().pageSizeOptions ?? [10, 25, 50, 100];
  });

  totalPages = computed(() => {
    const { pageSize, totalItems } = this.state();
    return Math.ceil(totalItems / pageSize) || 1;
  });

  rangeLabel = computed(() => {
    const { pageIndex, pageSize, totalItems } = this.state();
    const pageLabel = this.config().pageLabel ?? 'Página';
    const ofLabel = this.config().ofLabel ?? 'de';

    if (totalItems === 0) {
      return `0 ${ofLabel} 0`;
    }

    const startIndex = pageIndex * pageSize + 1;
    const endIndex = Math.min((pageIndex + 1) * pageSize, totalItems);

    return `${startIndex} - ${endIndex} ${ofLabel} ${totalItems}`;
  });

  isFirstPage = computed(() => {
    return this.state().pageIndex === 0;
  });

  isLastPage = computed(() => {
    const { pageIndex } = this.state();
    return pageIndex >= this.totalPages() - 1;
  });

  // === Actions ===
  onPageSizeChange(newPageSize: number): void {
    const currentState = this.state();
    const currentFirstItemIndex = currentState.pageIndex * currentState.pageSize;
    const newPageIndex = Math.floor(currentFirstItemIndex / newPageSize);

    this.emitPageChange(newPageIndex, newPageSize);
  }

  goToFirstPage(): void {
    if (!this.isFirstPage()) {
      this.emitPageChange(0, this.state().pageSize);
    }
  }

  goToPreviousPage(): void {
    if (!this.isFirstPage()) {
      this.emitPageChange(this.state().pageIndex - 1, this.state().pageSize);
    }
  }

  goToNextPage(): void {
    if (!this.isLastPage()) {
      this.emitPageChange(this.state().pageIndex + 1, this.state().pageSize);
    }
  }

  goToLastPage(): void {
    if (!this.isLastPage()) {
      this.emitPageChange(this.totalPages() - 1, this.state().pageSize);
    }
  }

  private emitPageChange(newPageIndex: number, newPageSize: number): void {
    this.pageChange.emit({
      pageIndex: newPageIndex,
      pageSize: newPageSize,
      previousPageIndex: this.state().pageIndex
    });
  }
}