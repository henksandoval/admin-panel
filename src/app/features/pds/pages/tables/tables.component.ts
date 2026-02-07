import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import {
  AppTableConfig,
  AppTableSort,
  AppTableAction
} from '@shared/atoms/app-table/app-table.model';
import { AppTableFiltersComponent } from '@shared/molecules/app-table-filters/app-table-filters.component';
import { AppTableFilterValues, AppTableFiltersConfig } from '@shared/molecules/app-table-filters/app-table-filters.model';
import { AppTablePaginationComponent } from '@shared/atoms/app-table/app-table-pagination.component';
import { AppTablePaginationState, AppTablePageEvent, AppTablePaginationConfig } from '@shared/atoms/app-table/app-table-pagination.model';

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
  imports: [
    CommonModule,
    AppTableComponent,
    AppTableFiltersComponent,
    AppTablePaginationComponent
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Complete Table (Atoms Composition)</h2>
      
      <div class="table-container">
        <app-table-filters
          [config]="filtersConfig"
          [values]="filterValues()"
          (valuesChange)="onFiltersChange($event)">
        </app-table-filters>
        
        <app-table
          [config]="tableConfig"
          [data]="paginatedUsers()"
          [sort]="currentSort()"
          (sortChange)="onSortChange($event)"
          (rowClick)="onRowClick($event)"
          (actionClick)="onActionClick($event)">
        </app-table>
        
        <app-table-pagination
          [config]="paginationConfig"
          [state]="paginationState()"
          (pageChange)="onPageChange($event)">
        </app-table-pagination>
      </div>
      
      <div class="mt-4 p-4 bg-gray-50 rounded grid grid-cols-2 gap-4">
        <div>
          <strong>Filtros activos:</strong>
          <pre class="text-sm mt-2">{{ filterValues() | json }}</pre>
        </div>
        <div>
          <strong>Estado paginación:</strong>
          <pre class="text-sm mt-2">{{ paginationState() | json }}</pre>
        </div>
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
  // Mock data - más usuarios para probar paginación
  private readonly allUsers = signal<User[]>(this.generateMockUsers(47));

  // State signals
  currentSort = signal<AppTableSort>({ active: '', direction: '' });
  filterValues = signal<AppTableFilterValues>({});
  lastAction = signal<string>('');
  
  // Pagination state
  pageIndex = signal(0);
  pageSize = signal(10);
  
  simplePageIndex = signal(0);
  simplePageSize = signal(5);

  // === Configurations ===
  filtersConfig: AppTableFiltersConfig = {
    filters: [
      {
        key: 'name',
        label: 'Nombre',
        placeholder: 'Buscar por nombre...',
        type: 'text'
      },
      {
        key: 'role',
        label: 'Rol',
        type: 'select',
        options: [
          { value: 'Admin', label: 'Administrador' },
          { value: 'User', label: 'Usuario' },
          { value: 'Guest', label: 'Invitado' }
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
    showClearAll: true
  };

  paginationConfig: AppTablePaginationConfig = {
    pageSizeOptions: [5, 10, 25, 50],
    showFirstLastButtons: true,
    showPageSizeSelector: true
  };

  simplePaginationConfig: AppTablePaginationConfig = {
    pageSizeOptions: [5, 10, 20],
    showFirstLastButtons: false,
    itemsPerPageLabel: 'Mostrar:',
    ofLabel: '/'
  };

  private readonly actions: AppTableAction<User>[] = [
    { icon: 'edit', label: 'Editar', color: 'primary' },
    { icon: 'delete', label: 'Eliminar', color: 'warn', visible: (row) => !row.active }
  ];

  tableConfig: AppTableConfig<User> = {
    columns: [
      { key: 'id', header: 'ID', width: '70px', align: 'center' },
      { key: 'name', header: 'Nombre', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { key: 'role', header: 'Rol', sortable: true },
      { key: 'active', header: 'Estado', align: 'center', valueFormatter: (v) => v ? '✓' : '✗' },
      { key: 'createdAt', header: 'Creado', sortable: true, valueFormatter: (v: Date) => v.toLocaleDateString('es-ES') }
    ],
    actions: this.actions,
    trackByKey: 'id',
    stickyHeader: true,
    rowClass: (row) => row.active ? '' : 'opacity-50'
  };

  simpleTableConfig: AppTableConfig<User> = {
    columns: [
      { key: 'id', header: 'ID', width: '70px' },
      { key: 'name', header: 'Nombre' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Rol' }
    ],
    trackByKey: 'id'
  };

  // === Computed values ===
  
  // Filtrado + ordenamiento
  private filteredAndSortedUsers = computed(() => {
    let users = [...this.allUsers()];
    
    // Aplicar filtros
    const filters = this.filterValues();
    if (Object.keys(filters).length > 0) {
      users = users.filter(user => {
        return Object.entries(filters).every(([key, filterValue]) => {
          const userValue = user[key as keyof User];
          if (typeof filterValue === 'boolean') {
            return userValue === filterValue;
          }
          if (typeof filterValue === 'string' && typeof userValue === 'string') {
            return userValue.toLowerCase().includes(filterValue.toLowerCase());
          }
          return userValue === filterValue;
        });
      });
    }
    
    // Aplicar ordenamiento
    const sort = this.currentSort();
    if (sort.active && sort.direction) {
      users.sort((a, b) => {
        const aVal = a[sort.active as keyof User];
        const bVal = b[sort.active as keyof User];
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    return users;
  });

  // Datos paginados para la tabla completa
  paginatedUsers = computed(() => {
    const users = this.filteredAndSortedUsers();
    const start = this.pageIndex() * this.pageSize();
    return users.slice(start, start + this.pageSize());
  });

  // Estado de paginación
  paginationState = computed<AppTablePaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.filteredAndSortedUsers().length
  }));

  // Para la tabla simple
  simplePaginatedUsers = computed(() => {
    const users = this.allUsers();
    const start = this.simplePageIndex() * this.simplePageSize();
    return users.slice(start, start + this.simplePageSize());
  });

  simplePaginationState = computed<AppTablePaginationState>(() => ({
    pageIndex: this.simplePageIndex(),
    pageSize: this.simplePageSize(),
    totalItems: this.allUsers().length
  }));

  // === Event Handlers ===
  onFiltersChange(values: AppTableFilterValues): void {
    this.filterValues.set(values);
    this.pageIndex.set(0); // Reset a primera página al filtrar
    this.lastAction.set(`Filtros: ${JSON.stringify(values)}`);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.lastAction.set(`Ordenar: ${sort.active} ${sort.direction}`);
  }

  onPageChange(event: AppTablePageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.lastAction.set(`Página: ${event.pageIndex + 1}, Tamaño: ${event.pageSize}`);
  }

  onSimplePageChange(event: AppTablePageEvent): void {
    this.simplePageIndex.set(event.pageIndex);
    this.simplePageSize.set(event.pageSize);
  }

  onRowClick(row: User): void {
    this.lastAction.set(`Click en: ${row.name}`);
  }

  onActionClick(event: { action: AppTableAction<User>; row: User }): void {
    this.lastAction.set(`Acción "${event.action.label}" en ${event.row.name}`);
  }

  // === Helper ===
  private generateMockUsers(count: number): User[] {
    const roles = ['Admin', 'User', 'Guest'];
    const names = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofia', 'Miguel', 'Elena'];
    const surnames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez'];

    return Array.from({ length: count }, (_, i) => {
      const name = `${names[i % names.length]} ${surnames[i % surnames.length]}`;
      return {
        id: i + 1,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}${i}@example.com`,
        role: roles[i % roles.length],
        active: Math.random() > 0.3,
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };
    });
  }
}