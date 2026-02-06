import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  TemplateRef,
  contentChild,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppTableOptions,
  AppTableConfig,
  AppTableColumnConfig,
  AppTableDataRequest,
  AppTableDataResponse,
  AppTableSortState,
  AppTableActionConfig
} from './app-table.model';
import { AppTableDataSource } from './app-table-datasource';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="app-table-container" [style.min-height]="fullConfig().minHeight" [style.max-height]="fullConfig().maxHeight">
      @if (fullConfig().showFilter) {
        <div class="app-table-filters">
          @for (column of filterableColumns(); track column.key) {
            <mat-form-field class="app-table-filter-field" appearance="outline">
              <mat-label>{{ column.header }}</mat-label>
              <input matInput [formControl]="getFilterControl(column.key)">
              @if (dataSource.filters()[column.key]) {
                <button matSuffix mat-icon-button (click)="clearFilter(column.key)">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>
          }
        </div>
      }

      <div class="app-table-wrapper">
        <table 
          mat-table 
          [dataSource]="dataSource.displayData()" 
          matSort 
          [matSortActive]="dataSource.sort().active"
          [matSortDirection]="dataSource.sort().direction"
          (matSortChange)="onSortChange($event)"
          [class.app-table-sticky-header]="fullConfig().stickyHeader">
          
          @if (fullConfig().selection?.enabled) {
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef [class.sticky-column-start]="true">
                @if (fullConfig().selection?.mode === 'multiple') {
                  <mat-checkbox
                    (change)="$event ? toggleAllRows() : null"
                    [checked]="isAllSelected()"
                    [indeterminate]="isSomeSelected()">
                  </mat-checkbox>
                }
              </th>
              <td mat-cell *matCellDef="let row" [class.sticky-column-start]="true">
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)"
                  [disabled]="!isRowSelectable(row)">
                </mat-checkbox>
              </td>
            </ng-container>
          }

          @for (column of visibleColumns(); track column.key) {
            <ng-container [matColumnDef]="column.key">
              <th 
                mat-header-cell 
                *matHeaderCellDef 
                [mat-sort-header]="column.sortable !== false ? column.key : ''"
                [disabled]="column.sortable === false"
                [class]="column.headerClass || ''"
                [style.width]="column.width"
                [style.min-width]="column.minWidth"
                [style.text-align]="column.align || 'left'"
                [class.sticky-column-start]="column.sticky === 'start'"
                [class.sticky-column-end]="column.sticky === 'end'">
                {{ column.header }}
              </th>
              <td 
                mat-cell 
                *matCellDef="let row" 
                [class]="getCellClass(column, row)"
                [style.width]="column.width"
                [style.min-width]="column.minWidth"
                [style.text-align]="column.align || 'left'"
                [class.sticky-column-start]="column.sticky === 'start'"
                [class.sticky-column-end]="column.sticky === 'end'">
                @if (column.type === 'custom') {
                  <ng-container 
                    *ngTemplateOutlet="cellTemplate(); context: { $implicit: row, column: column }">
                  </ng-container>
                } @else {
                  {{ formatCellValue(column, row) }}
                }
              </td>
            </ng-container>
          }

          @if (hasActions()) {
            <ng-container matColumnDef="actions">
              <th 
                mat-header-cell 
                *matHeaderCellDef 
                class="app-table-actions-header"
                [class.sticky-column-end]="true">
                Acciones
              </th>
              <td 
                mat-cell 
                *matCellDef="let row" 
                class="app-table-actions-cell"
                [class.sticky-column-end]="true">
                @for (action of getVisibleActions(row); track action.label) {
                  <button
                    mat-icon-button
                    [color]="action.color || 'primary'"
                    [disabled]="isActionDisabled(action, row)"
                    [matTooltip]="action.label"
                    (click)="onActionClick($event, action, row)">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
          <tr 
            mat-row 
            *matRowDef="let row; columns: displayedColumns();"
            [class]="getRowClass(row)"
            (click)="onRowClick(row)"
            [class.app-table-clickable-row]="!!fullConfig().rowClick">
          </tr>

          @if (dataSource.displayData().length === 0 && !dataSource.loading()) {
            <tr class="mat-row app-table-no-data">
              <td class="mat-cell" [attr.colspan]="displayedColumns().length">
                <div class="app-table-no-data-message">
                  {{ fullConfig().emptyMessage }}
                </div>
              </td>
            </tr>
          }
        </table>

        @if (dataSource.loading()) {
          <div class="app-table-loading-overlay">
            <mat-spinner diameter="50"></mat-spinner>
            <p>{{ fullConfig().loadingMessage }}</p>
          </div>
        }
      </div>

      @if (fullConfig().pagination) {
        <mat-paginator
          [length]="dataSource.total()"
          [pageSize]="dataSource.pageSize()"
          [pageIndex]="dataSource.page()"
          [pageSizeOptions]="fullConfig().pagination!.pageSizeOptions || [5, 10, 25, 50, 100]"
          [showFirstLastButtons]="fullConfig().pagination!.showFirstLastButtons ?? true"
          [hidePageSize]="fullConfig().pagination!.hidePageSize ?? false"
          (page)="onPageChange($event)">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .app-table-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow: hidden;
    }

    .app-table-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .app-table-filter-field {
      min-width: 200px;
      flex: 1 1 auto;
    }

    .app-table-wrapper {
      position: relative;
      overflow: auto;
      flex: 1 1 auto;
    }

    table {
      width: 100%;
    }

    .app-table-sticky-header th[mat-header-cell] {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: white;
    }

    .sticky-column-start {
      position: sticky;
      left: 0;
      z-index: 5;
      background-color: white;
    }

    .sticky-column-end {
      position: sticky;
      right: 0;
      z-index: 5;
      background-color: white;
    }

    .app-table-sticky-header .sticky-column-start,
    .app-table-sticky-header .sticky-column-end {
      z-index: 15;
    }

    .app-table-actions-header,
    .app-table-actions-cell {
      text-align: center;
      white-space: nowrap;
    }

    .app-table-clickable-row {
      cursor: pointer;
    }

    .app-table-clickable-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .app-table-no-data {
      height: 200px;
    }

    .app-table-no-data-message {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }

    .app-table-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 20;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .app-table-filters {
        flex-direction: column;
      }

      .app-table-filter-field {
        width: 100%;
      }
    }
  `]
})
export class AppTableComponent<T = any> implements AfterViewInit {
  config = input.required<AppTableOptions<T>>();
  
  data = input<T[]>([]);
  loadDataFn = input<(request: AppTableDataRequest) => Promise<AppTableDataResponse<T>>>();

  selectionChange = output<T[]>();
  sortChange = output<AppTableSortState>();
  pageChange = output<PageEvent>();
  filterChange = output<{ [key: string]: any }>();
  rowClickEvent = output<T>();

  cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  fullConfig = computed<AppTableConfig<T>>(() => ({
    dataMode: 'client',
    pagination: {
      pageSize: 10,
      pageSizeOptions: [5, 10, 25, 50, 100],
      showFirstLastButtons: true,
      hidePageSize: false
    },
    selection: {
      enabled: false,
      mode: 'multiple'
    },
    showFilter: false,
    filterDebounce: 300,
    stickyHeader: false,
    emptyMessage: 'No hay datos disponibles',
    loadingMessage: 'Cargando...',
    ...this.config()
  }));

  dataSource = new AppTableDataSource<T>();
  selection = new SelectionModel<T>(true, []);

  private filterControls = new Map<string, FormControl<string>>();

  visibleColumns = computed(() => 
    this.fullConfig().columns.filter(col => col.visible !== false)
  );

  filterableColumns = computed(() =>
    this.visibleColumns().filter(col => col.filterable !== false)
  );

  displayedColumns = computed(() => {
    const columns: string[] = [];
    
    if (this.fullConfig().selection?.enabled) {
      columns.push('select');
    }

    columns.push(...this.visibleColumns().map(col => col.key));

    if (this.hasActions()) {
      columns.push('actions');
    }

    return columns;
  });

  constructor() {
    effect(() => {
      const newData = this.data();
      this.dataSource.setData(newData);
    });

    effect(() => {
      const loadFn = this.loadDataFn();
      if (loadFn) {
        this.dataSource.setLoadDataFunction(loadFn);
        this.dataSource.loadData();
      }
    });

    effect(() => {
      const mode = this.fullConfig().dataMode;
      if (mode) {
        this.dataSource.setMode(mode);
      }
    });

    effect(() => {
      const pagination = this.fullConfig().pagination;
      if (pagination) {
        this.dataSource.setPageSize(pagination.pageSize);
      }
    });

    effect(() => {
      const selectionMode = this.fullConfig().selection?.mode;
      this.selection = new SelectionModel<T>(selectionMode === 'multiple', []);
    });

    this.selection.changed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectionChange.emit(this.selection.selected);
      });
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  getFilterControl(columnKey: string): FormControl<string> {
    if (!this.filterControls.has(columnKey)) {
      const control = new FormControl<string>('', { nonNullable: true });
      
      control.valueChanges
        .pipe(
          debounceTime(this.fullConfig().filterDebounce || 300),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(value => {
          this.dataSource.updateFilter(columnKey, value);
          this.filterChange.emit(this.dataSource.filters());
        });

      this.filterControls.set(columnKey, control);
    }
    return this.filterControls.get(columnKey)!;
  }

  clearFilter(columnKey: string): void {
    const control = this.getFilterControl(columnKey);
    control.setValue('');
  }

  onSortChange(sort: Sort): void {
    const sortState: AppTableSortState = {
      active: sort.active,
      direction: sort.direction
    };
    this.dataSource.setSort(sortState);
    this.sortChange.emit(sortState);
  }

  onPageChange(event: PageEvent): void {
    this.dataSource.setPage(event.pageIndex);
    this.dataSource.setPageSize(event.pageSize);
    this.pageChange.emit(event);
  }

  hasActions(): boolean {
    return !!this.fullConfig().actions && this.fullConfig().actions!.length > 0;
  }

  getVisibleActions(row: T): AppTableActionConfig<T>[] {
    const actions = this.fullConfig().actions || [];
    return actions.filter(action => 
      !action.visible || action.visible(row)
    );
  }

  isActionDisabled(action: AppTableActionConfig<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  onActionClick(event: Event, action: AppTableActionConfig<T>, row: T): void {
    event.stopPropagation();
    action.action(row);
  }

  formatCellValue(column: AppTableColumnConfig<T>, row: T): string {
    const value = (row as any)[column.key];
    
    if (column.valueFormatter) {
      return column.valueFormatter(value, row);
    }

    if (value === null || value === undefined) {
      return '';
    }

    switch (column.type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      default:
        return String(value);
    }
  }

  getCellClass(column: AppTableColumnConfig<T>, row: T): string {
    if (!column.cellClass) {
      return '';
    }
    return typeof column.cellClass === 'function' 
      ? column.cellClass(row) 
      : column.cellClass;
  }

  getRowClass(row: T): string {
    const config = this.fullConfig();
    if (!config.rowClass) {
      return '';
    }
    return typeof config.rowClass === 'function'
      ? config.rowClass(row)
      : config.rowClass;
  }

  onRowClick(row: T): void {
    const rowClickFn = this.fullConfig().rowClick;
    if (rowClickFn) {
      rowClickFn(row);
    }
    this.rowClickEvent.emit(row);
  }

  isAllSelected(): boolean {
    const selectableRows = this.dataSource.displayData().filter(row => this.isRowSelectable(row));
    return selectableRows.length > 0 && this.selection.selected.length === selectableRows.length;
  }

  isSomeSelected(): boolean {
    const selectableRows = this.dataSource.displayData().filter(row => this.isRowSelectable(row));
    return this.selection.selected.length > 0 && this.selection.selected.length < selectableRows.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      const selectableRows = this.dataSource.displayData().filter(row => this.isRowSelectable(row));
      this.selection.select(...selectableRows);
    }
  }

  isRowSelectable(row: T): boolean {
    const selectableRows = this.fullConfig().selection?.selectableRows;
    return selectableRows ? selectableRows(row) : true;
  }

  getSelectedRows(): T[] {
    return this.selection.selected;
  }

  clearSelection(): void {
    this.selection.clear();
  }
}
