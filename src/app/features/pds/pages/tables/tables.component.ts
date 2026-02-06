import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTableComponent } from '@shared/organisms/app-table';
import {
  AppTableOptions,
  AppTableColumnConfig,
  AppTableActionConfig,
  AppTableDataRequest,
  AppTableDataResponse
} from '@shared/organisms/app-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, AppTableComponent],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Client-Side Example</h2>
      <app-table [config]="clientTableConfig" [data]="users()"></app-table>

      <h2 class="text-2xl font-bold mb-4 mt-8">Server-Side Example</h2>
      <app-table 
        [config]="serverTableConfig" 
        [loadDataFn]="loadServerData"
        (selectionChange)="onSelectionChange($event)">
      </app-table>
    </div>
  `
})
export class TablesComponent {
  users = signal<User[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'Admin',
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      role: 'User',
      active: true,
      createdAt: new Date('2024-02-20')
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      role: 'User',
      active: false,
      createdAt: new Date('2024-03-10')
    }
  ]);

  columns: AppTableColumnConfig<User>[] = [
    {
      key: 'id',
      header: 'ID',
      type: 'number',
      width: '80px',
      align: 'center',
      sticky: 'start'
    },
    {
      key: 'name',
      header: 'Nombre',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      header: 'Email',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'role',
      header: 'Rol',
      type: 'text',
      sortable: true,
      filterable: true,
      cellClass: (row) => row.role === 'Admin' ? 'font-bold text-primary' : ''
    },
    {
      key: 'active',
      header: 'Activo',
      type: 'boolean',
      align: 'center',
      sortable: true,
      valueFormatter: (value) => value ? '✓' : '✗'
    },
    {
      key: 'createdAt',
      header: 'Fecha Creación',
      type: 'date',
      sortable: true,
      valueFormatter: (value: Date) => value.toLocaleDateString('es-ES')
    }
  ];

  actions: AppTableActionConfig<User>[] = [
    {
      icon: 'edit',
      label: 'Editar',
      color: 'primary',
      action: (row) => this.editUser(row)
    },
    {
      icon: 'delete',
      label: 'Eliminar',
      color: 'warn',
      visible: (row) => !row.active,
      action: (row) => this.deleteUser(row)
    },
    {
      icon: 'visibility',
      label: 'Ver detalles',
      action: (row) => this.viewUser(row)
    }
  ];

  clientTableConfig: AppTableOptions<User> = {
    columns: this.columns,
    actions: this.actions,
    dataMode: 'client',
    pagination: {
      pageSize: 10,
      pageSizeOptions: [5, 10, 25, 50]
    },
    selection: {
      enabled: true,
      mode: 'multiple',
      selectableRows: (row) => row.active
    },
    showFilter: true,
    filterDebounce: 300,
    stickyHeader: true,
    maxHeight: '600px',
    rowClick: (row) => console.log('Row clicked:', row),
    rowClass: (row) => row.active ? '' : 'opacity-50'
  };

  serverTableConfig: AppTableOptions<User> = {
    columns: this.columns,
    actions: this.actions,
    dataMode: 'server',
    pagination: {
      pageSize: 10,
      pageSizeOptions: [10, 25, 50, 100]
    },
    selection: {
      enabled: true,
      mode: 'multiple'
    },
    showFilter: true,
    stickyHeader: true
  };

  loadServerData = async (request: AppTableDataRequest): Promise<AppTableDataResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredUsers = [...this.users()];

    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        filteredUsers = filteredUsers.filter(user => {
          const userValue = String((user as any)[key]).toLowerCase();
          const filterValue = String(value).toLowerCase();
          return userValue.includes(filterValue);
        });
      });
    }

    if (request.sort?.active && request.sort.direction) {
      filteredUsers.sort((a, b) => {
        const aValue = (a as any)[request.sort!.active];
        const bValue = (b as any)[request.sort!.active];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return request.sort!.direction === 'asc' ? comparison : -comparison;
      });
    }

    const total = filteredUsers.length;
    const start = request.page * request.pageSize;
    const data = filteredUsers.slice(start, start + request.pageSize);

    return { data, total };
  };

  editUser(user: User): void {
    console.log('Editar usuario:', user);
  }

  deleteUser(user: User): void {
    console.log('Eliminar usuario:', user);
  }

  viewUser(user: User): void {
    console.log('Ver usuario:', user);
  }

  onSelectionChange(selected: User[]): void {
    console.log('Selección cambiada:', selected);
  }
}
