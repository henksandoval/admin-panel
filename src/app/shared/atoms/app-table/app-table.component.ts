import { ChangeDetectionStrategy, Component, computed, contentChild, input, output, TemplateRef, } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppTableAction, AppTableColumn, AppTableConfig, AppTableSort, TABLE_DEFAULTS, } from './app-table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app-table.component.scss'],
  template: `
    <div class="app-table-wrapper" [class.loading]="loading()">
      <table
        mat-table
        [dataSource]="data()"
        [trackBy]="trackByFn"
        matSort
        [matSortActive]="sort().active"
        [matSortDirection]="sort().direction"
        (matSortChange)="onSortChange($event)"
        [class]="tableClasses()">

        @for (column of columns(); track column.key) {
          <ng-container [matColumnDef]="column.key">
            <th
              mat-header-cell
              *matHeaderCellDef
              [mat-sort-header]="sortHeaderId(column)"
              [disabled]="!column.sortable"
              [class]="column.headerClass ?? ''"
              [style.width]="column.width"
              [style.min-width]="column.minWidth"
              [style.text-align]="column.align ?? 'left'"
              [class.sticky-start]="column.sticky === 'start'"
              [class.sticky-end]="column.sticky === 'end'">
              {{ column.header }}
            </th>
            <td
              mat-cell
              *matCellDef="let row"
              [class]="cellClasses()(column, row)"
              [style.width]="column.width"
              [style.min-width]="column.minWidth"
              [style.text-align]="column.align ?? 'left'">
              @if (resolvedCellTemplate()) {
                <ng-container
                  *ngTemplateOutlet="resolvedCellTemplate()!; context: { $implicit: row, column, value: getCellValue(column, row) }">
                </ng-container>
              } @else {
                {{ formatCellValue(column, row) }}
              }
            </td>
          </ng-container>
        }

        @if (hasActions()) {
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="app-table-actions-column sticky-end">
              Acciones
            </th>
            <td mat-cell *matCellDef="let row" class="app-table-actions-column sticky-end">
              @for (action of visibleActions(row); track action.label) {
                <button
                  mat-icon-button
                  [color]="action.color ?? 'primary'"
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
          *matRowDef="let row; columns: displayedColumns()"
          [class]="rowClasses()(row)"
          (click)="onRowClick(row)">
        </tr>
      </table>

      @if (!loading() && data().length === 0) {
        <div class="app-table-empty-state">
          <ng-content select="[emptyState]" />
          @if (!hasCustomEmptyState()) {
            <p>{{ emptyMessage() }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class AppTableComponent<T extends Record<string, any> = Record<string, any>> {
  readonly config = input.required<AppTableConfig<T>>();

  readonly data = input<T[]>([]);
  readonly sort = input<AppTableSort>({ active: '', direction: '' });
  readonly loading = input(false);

  sortChange = output<AppTableSort>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly cellTemplateRef = input<TemplateRef<any> | undefined>(undefined);
  readonly cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly resolvedCellTemplate = computed(
    () => this.cellTemplateRef() ?? this.cellTemplate()
  );
  readonly emptyStateContent = contentChild<TemplateRef<any>>('emptyState');

  readonly columns = computed(() => this.config().columns);
  readonly hasActions = computed(() => !!this.config().actions?.length);
  readonly hasCustomEmptyState = computed(() => !!this.emptyStateContent());
  readonly emptyMessage = computed(() => this.config().emptyMessage ?? TABLE_DEFAULTS.emptyMessage);
  readonly displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key);
    if (this.hasActions()) cols.push('actions');
    return cols;
  });
  readonly cellClasses = computed(() => (column: AppTableColumn<T>, row: T) => {
    const classes = ['app-table-cell'];
    if (column.sticky === 'start') classes.push('sticky-start');
    if (column.sticky === 'end') classes.push('sticky-end');

    if (column.cellClass) {
      const value = typeof column.cellClass === 'function' ? column.cellClass(row) : column.cellClass;
      if (value) classes.push(value);
    }
    return classes.join(' ');
  });
  private readonly stickyHeader = computed(() => this.config().stickyHeader ?? TABLE_DEFAULTS.stickyHeader);
  readonly tableClasses = computed(() => {
    const classes = ['app-table'];
    if (this.stickyHeader()) classes.push('sticky-header');
    return classes.join(' ');
  });
  private readonly clickableRows = computed(() => this.config().clickableRows ?? TABLE_DEFAULTS.clickableRows);
  readonly rowClasses = computed(() => (row: T) => {
    const classes = ['app-table-row'];
    if (this.clickableRows()) classes.push('clickable');

    const customClass = this.config().rowClass;
    if (customClass) {
      const value = typeof customClass === 'function' ? customClass(row) : customClass;
      if (value) classes.push(value);
    }
    return classes.join(' ');
  });

  trackByFn = (index: number, row: T): any => {
    const key = this.config().trackByKey;
    return key ? row[key] : index;
  };

  sortHeaderId(column: AppTableColumn<T>): string {
    return column.sortable ? column.key : '';
  }

  formatCellValue(column: AppTableColumn<T>, row: T): string {
    const value = row[column.key];
    if (column.valueFormatter) return column.valueFormatter(value, row);
    return value == null ? '' : String(value);
  }

  getCellValue(column: AppTableColumn<T>, row: T): any {
    return row[column.key];
  }

  visibleActions(row: T): AppTableAction<T>[] {
    return this.config().actions?.filter((a) => !a.visible || a.visible(row)) ?? [];
  }

  isActionDisabled(action: AppTableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({ active: sort.active, direction: sort.direction });
  }

  onRowClick(row: T): void {
    if (this.clickableRows()) this.rowClick.emit(row);
  }

  onActionClick(event: Event, action: AppTableAction<T>, row: T): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }
}
