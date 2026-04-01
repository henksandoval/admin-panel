import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppPageEvent, AppPaginationConfig, AppPaginationState, PAGINATION_DEFAULTS, } from './app-pagination.model';
import { AppButtonComponent } from "@ui-atoms/app-button";
import { AppFormSelectComponent, SelectOption } from "@ui-molecules/app-form";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AppButtonComponent,
    AppFormSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-pagination.component.scss',
  templateUrl: './app-pagination.component.html'
})
export class AppPaginationComponent {
  readonly config = input<AppPaginationConfig>({});
  readonly state = input.required<AppPaginationState>();

  pageChange = output<AppPageEvent>();

  protected readonly pageSizeControl = new FormControl<number>(0);
  protected readonly showFirstLastButtons = computed(() => this.config()?.showFirstLastButtons ?? PAGINATION_DEFAULTS.showFirstLastButtons);
  protected readonly showPageSizeSelector = computed(() => this.config()?.showPageSizeSelector ?? PAGINATION_DEFAULTS.showPageSizeSelector);
  protected readonly itemsPerPageLabel = computed(() => this.config()?.itemsPerPageLabel ?? PAGINATION_DEFAULTS.itemsPerPageLabel);
  protected readonly firstPageLabel = computed(() => this.config()?.firstPageLabel ?? PAGINATION_DEFAULTS.firstPageLabel);
  protected readonly lastPageLabel = computed(() => this.config()?.lastPageLabel ?? PAGINATION_DEFAULTS.lastPageLabel);
  protected readonly previousPageLabel = computed(() => this.config()?.previousPageLabel ?? PAGINATION_DEFAULTS.previousPageLabel);
  protected readonly nextPageLabel = computed(() => this.config()?.nextPageLabel ?? PAGINATION_DEFAULTS.nextPageLabel);
  protected readonly isFirstPage = computed(() => this.state().pageIndex === 0);
  private readonly pageSizeOptions = computed(() => this.config()?.pageSizeOptions ?? PAGINATION_DEFAULTS.pageSizeOptions);
  protected readonly pageSizeSelectOptions = computed<SelectOption<number>[]>(() =>
    this.pageSizeOptions().map(size => ({
      value: size,
      label: size.toString()
    }))
  );
  private readonly totalPages = computed(() => {
    const { pageSize, totalItems } = this.state();
    return Math.ceil(totalItems / pageSize) || 1;
  });
  protected readonly isLastPage = computed(() => this.state().pageIndex >= this.totalPages() - 1);
  private readonly ofLabel = computed(() => this.config()?.ofLabel ?? PAGINATION_DEFAULTS.ofLabel);
  protected readonly rangeLabel = computed(() => {
    const { pageIndex, pageSize, totalItems } = this.state();
    if (totalItems === 0) return `0 ${this.ofLabel()} 0`;

    const startIndex = pageIndex * pageSize + 1;
    const endIndex = Math.min((pageIndex + 1) * pageSize, totalItems);
    return `${startIndex} - ${endIndex} ${this.ofLabel()} ${totalItems}`;
  });

  constructor() {
    effect(() => {
      const pageSize = this.state().pageSize;
      if (this.pageSizeControl.value !== pageSize) {
        this.pageSizeControl.setValue(pageSize, { emitEvent: false });
      }
    });

    effect((onCleanup) => {
      const sub = this.pageSizeControl.valueChanges.subscribe(newSize => {
        if (newSize !== null) this.onPageSizeChange(newSize);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected goToFirstPage(): void {
    if (!this.isFirstPage()) this.emitPageChange(0, this.state().pageSize);
  }

  protected goToPreviousPage(): void {
    if (!this.isFirstPage()) this.emitPageChange(this.state().pageIndex - 1, this.state().pageSize);
  }

  protected goToNextPage(): void {
    if (!this.isLastPage()) this.emitPageChange(this.state().pageIndex + 1, this.state().pageSize);
  }

  protected goToLastPage(): void {
    if (!this.isLastPage()) this.emitPageChange(this.totalPages() - 1, this.state().pageSize);
  }

  private onPageSizeChange(newPageSize: number): void {
    const { pageIndex, pageSize } = this.state();
    const currentFirstItemIndex = pageIndex * pageSize;
    const newPageIndex = Math.floor(currentFirstItemIndex / newPageSize);
    this.emitPageChange(newPageIndex, newPageSize);
  }

  private emitPageChange(pageIndex: number, pageSize: number): void {
    this.pageChange.emit({
      pageIndex,
      pageSize,
      previousPageIndex: this.state().pageIndex,
    });
  }
}
