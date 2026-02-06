import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import {
  AppTableConfig,
  AppTableSort,
  AppTableAction
} from '@shared/atoms/app-table/app-table.model';
import { AppTableFiltersComponent } from '@shared/atoms/app-table/app-table-filters.component';
import { AppTableFilterValues, AppTableFiltersConfig } from '@shared/atoms/app-table/app-table-filters.model';

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
  imports: [CommonModule, AppTableComponent, AppTableFiltersComponent],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4 mt-8">Filters with Select Options</h2>
      
      <div class="table-container">
        <app-table-filters
          [config]="filtersConfigWithSelect"
          [values]="filterValuesWithSelect()"
          (valuesChange)="onFiltersWithSelectChange($event)">
        </app-table-filters>
        
        <app-table
          [config]="tableConfig"
          [data]="filteredUsersWithSelect()"
          [sort]="currentSort()"
          (sortChange)="onSortChange($event)"
          (actionClick)="onActionClick($event)">
        </app-table>
      </div>

      @if (lastAction()) {
        <div class="mt-4 p-4 bg-blue-50 rounded">
          <strong>Última acción:</strong> {{ lastAction() }}
        </div>
      }
      
      <div class="mt-4 p-4 bg-gray-50 rounded">
        <strong>Filtros activos:</strong>
        <pre class="text-sm mt-2">{{ filterValuesWithSelect() | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class TablesComponent {
  private readonly allUsers = signal<User[]>([
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
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana@example.com',
      role: 'Admin',
      active: true,
      createdAt: new Date('2024-04-05')
    },
    {
      id: 5,
      name: 'Pedro Sánchez',
      email: 'pedro@example.com',
      role: 'User',
      active: false,
      createdAt: new Date('2024-05-12')
    }
  ]);

  currentSort = signal<AppTableSort>({ active: '', direction: '' });
  filterValues = signal<AppTableFilterValues>({});
  filterValuesWithSelect = signal<AppTableFilterValues>({});
  lastAction = signal<string>('');

  // Configuración de filtros básicos (solo texto)
  filtersConfig: AppTableFiltersConfig = {
    filters: [
      {
        key: 'name',
        label: 'Nombre',
        placeholder: 'Buscar por nombre...',
        type: 'text'
      },
      {
        key: 'email',
        label: 'Email',
        placeholder: 'Buscar por email...',
        type: 'text'
      }
    ],
    debounceMs: 300,
    appearance: 'outline',
    showClearAll: true
  };

  // Configuración de filtros con select
  filtersConfigWithSelect: AppTableFiltersConfig = {
    filters: [
      {
        key: 'name',
        label: 'Nombre',
        placeholder: 'Buscar...',
        type: 'text'
      },
      {
        key: 'role',
        label: 'Rol',
        type: 'select',
        options: [
          { value: 'Admin', label: 'Administrador' },
          { value: 'User', label: 'Usuario' }
        ]
      },
      {
        key: 'active',
        label: 'Estado',
        type: 'select',
        options: [
          { value: true, label: 'Activo' },
          { value: false, label: 'Inactivo' }
        ]
      }
    ],
    debounceMs: 300,
    appearance: 'outline',
    showClearAll: true,
    clearAllLabel: 'Resetear filtros'
  };

  // Datos filtrados (client-side filtering)
  filteredUsers = computed(() => {
    const users = this.allUsers();
    const filters = this.filterValues();
    return this.applyFilters(users, filters);
  });

  filteredUsersWithSelect = computed(() => {
    const users = this.allUsers();
    const filters = this.filterValuesWithSelect();
    return this.applyFilters(users, filters);
  });

  private readonly actions: AppTableAction<User>[] = [
    {
      icon: 'edit',
      label: 'Editar',
      color: 'primary'
    },
    {
      icon: 'delete',
      label: 'Eliminar',
      color: 'warn',
      visible: (row) => !row.active
    }
  ];

  tableConfig: AppTableConfig<User> = {
    columns: [
      {
        key: 'id',
        header: 'ID',
        width: '80px',
        align: 'center',
        sticky: 'start'
      },
      {
        key: 'name',
        header: 'Nombre',
        sortable: true
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true
      },
      {
        key: 'role',
        header: 'Rol',
        sortable: true
      },
      {
        key: 'active',
        header: 'Estado',
        align: 'center',
        valueFormatter: (value) => value ? 'Activo' : 'Inactivo'
      },
      {
        key: 'createdAt',
        header: 'Fecha Creación',
        sortable: true,
        valueFormatter: (value: Date) => value.toLocaleDateString('es-ES')
      }
    ],
    actions: this.actions,
    trackByKey: 'id',
    stickyHeader: true,
    rowClass: (row) => row.active ? '' : 'opacity-50'
  };

  onFiltersChange(values: AppTableFilterValues): void {
    this.filterValues.set(values);
    this.lastAction.set(`Filtros cambiados: ${JSON.stringify(values)}`);
  }

  onFiltersWithSelectChange(values: AppTableFilterValues): void {
    this.filterValuesWithSelect.set(values);
    this.lastAction.set(`Filtros con select cambiados: ${JSON.stringify(values)}`);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.lastAction.set(`Sort: ${sort.active} ${sort.direction}`);
  }

  onRowClick(row: User): void {
    this.lastAction.set(`Row clicked: ${row.name}`);
  }

  onActionClick(event: { action: AppTableAction<User>; row: User }): void {
    this.lastAction.set(`Action "${event.action.label}" on ${event.row.name}`);
  }

  private applyFilters(users: User[], filters: AppTableFilterValues): User[] {
    if (Object.keys(filters).length === 0) {
      return users;
    }

    return users.filter(user => {
      return Object.entries(filters).every(([key, filterValue]) => {
        const userValue = user[key as keyof User];

        // Para selects con valores exactos (boolean, string específico)
        if (typeof filterValue === 'boolean' || (typeof filterValue === 'string' && filterValue === userValue)) {
          return userValue === filterValue;
        }

        // Para búsqueda de texto (contains)
        if (typeof filterValue === 'string' && typeof userValue === 'string') {
          return userValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return true;
      });
    });
  }
}