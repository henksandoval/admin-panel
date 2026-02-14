import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AppPaginationConfig,
  AppPaginationState,
  AppPageEvent,
  PAGINATION_DEFAULTS,
} from './app-pagination.model';
import { AppButtonComponent } from "../app-button/app-button.component";
import { AppFormSelectComponent } from "@shared/molecules/app-form/app-form-select/app-form-select.component";
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AppButtonComponent,
    AppFormSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-pagination.component.scss',
  template: `
    <div class="pagination-container">
      @if (showPageSizeSelector()) {
        <div class="page-size-selector">
          <span class="page-size-label">{{ itemsPerPageLabel() }}</span>
          <app-form-select
            class="page-size-select"
            [ngModel]="state().pageSize"
            (ngModelChange)="onPageSizeChange($event)"
            [options]="pageSizeSelectOptions()">
          </app-form-select>
        </div>
      }

      <div class="range-info">{{ rangeLabel() }}</div>

      <div class="navigation-buttons">
        @if (showFirstLastButtons()) {
          <app-button 
            [disabled]="isFirstPage()"
            [matTooltip]="firstPageLabel()"
            (click)="goToFirstPage()"
            iconBefore="first_page">
          </app-button>
        }

        <app-button
          [disabled]="isFirstPage()"
          [matTooltip]="previousPageLabel()"
          (click)="goToPreviousPage()"
          iconBefore="chevron_left">
      </app-button>

        <app-button
          [disabled]="isLastPage()"
          [matTooltip]="nextPageLabel()"
          (click)="goToNextPage()"
          iconBefore="chevron_right">
        </app-button>

        @if (showFirstLastButtons()) {
          <app-button
            [disabled]="isLastPage()"
            [matTooltip]="lastPageLabel()"
            (click)="goToLastPage()"
            iconBefore="last_page">
          </app-button>
        }
      </div>
    </div>
  `,
})
export class AppPaginationComponent {
  config = input<AppPaginationConfig>({});
  state = input.required<AppPaginationState>();

  pageChange = output<AppPageEvent>();

  pageSizeOptions = computed(() => this.config().pageSizeOptions ?? PAGINATION_DEFAULTS.pageSizeOptions);
  pageSizeSelectOptions = computed<SelectOption<number>[]>(() =>
    this.pageSizeOptions().map(size => ({
      value: size,
      label: size.toString()
    }))
  );
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