import { Component, computed, input, output, contentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppTableConfig, AppTableColumn, AppTableAction, AppTableSort } from './app-table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-table-wrapper">
      <table
        mat-table
        [dataSource]="data()"
        [trackBy]="trackByFn"
        matSort
        [matSortActive]="sort().active"
        [matSortDirection]="sort().direction"
        (matSortChange)="onSortChange($event)"
        [class.sticky-header]="config().stickyHeader">

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
              [class]="cellClass(column, row)"
              [style.width]="column.width"
              [style.min-width]="column.minWidth"
              [style.text-align]="column.align ?? 'left'"
              [class.sticky-start]="column.sticky === 'start'"
              [class.sticky-end]="column.sticky === 'end'">
              @if (cellTemplate()) {
                <ng-container
                  *ngTemplateOutlet="cellTemplate()!; context: { $implicit: row, column, value: getCellValue(column, row) }">
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
              class="actions-column sticky-end">
              Acciones
            </th>
            <td
              mat-cell
              *matCellDef="let row"
              class="actions-column sticky-end">
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
          [class]="rowClass(row)"
          [class.clickable]="config().clickableRows"
          (click)="onRowClick(row)">
        </tr>
      </table>

      @if (data().length === 0) {
        <div class="empty-state">
          <ng-content select="[emptyState]">
          </ng-content>
          @if (!hasCustomEmptyState()) {
            <p>{{ config().emptyMessage ?? 'No hay datos disponibles' }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .app-table-wrapper {
      overflow: auto;
      width: 100%;
    }

    table {
      width: 100%;
    }

    .sticky-header th {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--mat-sys-surface, white);
    }

    .sticky-start {
      position: sticky;
      left: 0;
      z-index: 5;
      background: var(--mat-sys-surface, white);
    }

    .sticky-end {
      position: sticky;
      right: 0;
      z-index: 5;
      background: var(--mat-sys-surface, white);
    }

    .actions-column {
      text-align: center;
      white-space: nowrap;
    }

    .clickable {
      cursor: pointer;
    }

    .clickable:hover {
      background: var(--mat-sys-surface-variant, rgba(0, 0, 0, 0.04));
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.54));
    }
  `]
})
export class AppTableComponent<T extends Record<string, any> = Record<string, any>> {
  // === Inputs ===
  config = input.required<AppTableConfig<T>>();
  data = input<T[]>([]);
  sort = input<AppTableSort>({ active: '', direction: '' });
  loading = input<boolean>(false);

  // === Outputs ===
  sortChange = output<AppTableSort>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // === Content ===
  cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  emptyStateContent = contentChild<TemplateRef<any>>('emptyState');

  // === Computed ===
  columns = computed(() => this.config().columns);

  displayedColumns = computed(() => {
    const cols = this.columns().map(c => c.key);
    if (this.hasActions()) {
      cols.push('actions');
    }
    return cols;
  });

  // === Methods ===
  hasActions(): boolean {
    const actions = this.config().actions;
    return !!actions && actions.length > 0;
  }

  hasCustomEmptyState(): boolean {
    return !!this.emptyStateContent();
  }

  trackByFn = (index: number, row: T): any => {
    const key = this.config().trackByKey;
    return key ? row[key] : index;
  };

  sortHeaderId(column: AppTableColumn<T>): string {
    return column.sortable ? column.key : '';
  }

  getCellValue(column: AppTableColumn<T>, row: T): any {
    return row[column.key];
  }

  formatCellValue(column: AppTableColumn<T>, row: T): string {
    const value = this.getCellValue(column, row);

    if (column.valueFormatter) {
      return column.valueFormatter(value, row);
    }

    if (value == null) {
      return '';
    }

    return String(value);
  }

  cellClass(column: AppTableColumn<T>, row: T): string {
    if (!column.cellClass) {
      return '';
    }
    return typeof column.cellClass === 'function'
      ? column.cellClass(row)
      : column.cellClass;
  }

  rowClass(row: T): string {
    const rc = this.config().rowClass;
    if (!rc) {
      return '';
    }
    return typeof rc === 'function' ? rc(row) : rc;
  }

  visibleActions(row: T): AppTableAction<T>[] {
    const actions = this.config().actions ?? [];
    return actions.filter(a => !a.visible || a.visible(row));
  }

  isActionDisabled(action: AppTableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction
    });
  }

  onRowClick(row: T): void {
    if (this.config().clickableRows) {
      this.rowClick.emit(row);
    }
  }

  onActionClick(event: Event, action: AppTableAction<T>, row: T): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }
}