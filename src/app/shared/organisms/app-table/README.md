# AppTable Component

## Uso Básico

### Client-Side

```typescript
import { AppTableComponent, AppTableOptions } from '@shared/organisms/app-table';

tableConfig: AppTableOptions<User> = {
  columns: [
    { key: 'id', header: 'ID', type: 'number' },
    { key: 'name', header: 'Nombre', sortable: true, filterable: true },
    { key: 'email', header: 'Email', sortable: true, filterable: true }
  ],
  pagination: { pageSize: 10 },
  showFilter: true
};
```

```html
<app-table [config]="tableConfig" [data]="users()"></app-table>
```

### Server-Side

```typescript
loadDataFn = async (request: AppTableDataRequest): Promise<AppTableDataResponse<User>> => {
  const response = await this.api.getUsers(request);
  return { data: response.data, total: response.total };
};
```

```html
<app-table [config]="tableConfig" [loadDataFn]="loadDataFn"></app-table>
```

## Configuración de Columnas

```typescript
columns: AppTableColumnConfig<User>[] = [
  {
    key: 'id',
    header: 'ID',
    type: 'number',
    width: '80px',
    align: 'center',
    sortable: true,
    sticky: 'start'
  },
  {
    key: 'status',
    header: 'Estado',
    cellClass: (row) => row.active ? 'text-success' : 'text-danger',
    valueFormatter: (value, row) => value ? 'Activo' : 'Inactivo'
  }
]
```

## Acciones

```typescript
actions: AppTableActionConfig<User>[] = [
  {
    icon: 'edit',
    label: 'Editar',
    color: 'primary',
    action: (row) => this.edit(row)
  },
  {
    icon: 'delete',
    label: 'Eliminar',
    color: 'warn',
    visible: (row) => row.canDelete,
    disabled: (row) => row.isProcessing,
    action: (row) => this.delete(row)
  }
]
```

## Selección

```typescript
selection: {
  enabled: true,
  mode: 'multiple',
  selectableRows: (row) => row.active
}
```

```html
<app-table 
  [config]="config" 
  [data]="data()"
  (selectionChange)="onSelectionChange($event)">
</app-table>
```

## Custom Cell Templates

```html
<app-table [config]="config" [data]="data()">
  <ng-template #cellTemplate let-row let-column="column">
    @if (column.key === 'avatar') {
      <img [src]="row.avatar" class="w-8 h-8 rounded-full">
    }
  </ng-template>
</app-table>
```

## Eventos

```typescript
(selectionChange)="onSelectionChange($event)"
(sortChange)="onSortChange($event)"
(pageChange)="onPageChange($event)"
(filterChange)="onFilterChange($event)"
(rowClickEvent)="onRowClick($event)"
```

## Características

- ✅ Paginación client/server side
- ✅ Sorting client/server side
- ✅ Filtering con debounce
- ✅ Selección single/multiple
- ✅ Acciones por fila
- ✅ Columnas sticky (start/end)
- ✅ Custom cell formatters
- ✅ Custom templates
- ✅ Responsive
- ✅ Loading state
- ✅ Empty state
- ✅ Row click events
- ✅ Dynamic row/cell classes
