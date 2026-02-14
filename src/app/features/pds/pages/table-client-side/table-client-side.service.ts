import { Injectable } from '@angular/core';
import { AppTableConfig } from '@shared/atoms/app-table/app-table.model';
import { AppTablePaginationConfig } from '@shared/atoms/app-table/app-table-pagination.model';
import { AppTableFiltersConfig } from '@shared/molecules/app-table/app-table-filters-simple/app-table-filters.model';
import { AppTableFiltersAdvancedConfig } from '@shared/molecules/app-table/app-table-filters-advanced/app-table-filters-advanced.model';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  salary: number;
  hireDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TableClientSideService {
  private readonly firstNames = ['Ana', 'Carlos', 'María', 'Juan', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Valentina', 'Andrés', 'Camila', 'Santiago', 'Isabella', 'Mateo', 'Lucía', 'Daniel', 'Emma', 'Sebastián'];
  private readonly lastNames = ['García', 'López', 'Rodríguez', 'Martínez', 'Sánchez', 'Fernández', 'Gómez', 'Díaz', 'Torres', 'Ruiz', 'Vargas', 'Moreno', 'Castro', 'Jiménez', 'Romero', 'Herrera', 'Mendoza', 'Ortiz'];
  private readonly departments = ['Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas'];
  private readonly roles = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];
  private readonly statuses: Array<'active' | 'inactive' | 'vacation'> = ['active', 'inactive', 'vacation'];

  readonly statusLabels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'Vacaciones',
  };

  fetchEmployees(count: number = 18): Promise<Employee[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateEmployees(count));
      }, 800);
    });
  }

  generateEmployees(count: number): Employee[] {
    return Array.from({ length: count }, (_, i) => this.generateEmployee(i + 1));
  }

  private generateEmployee(id: number): Employee {
    const firstName = this.firstNames[id % this.firstNames.length];
    const lastName = this.lastNames[Math.floor(id / this.firstNames.length) % this.lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@empresa.com`;
    const department = this.departments[id % this.departments.length];
    const role = this.roles[id % this.roles.length];
    const status = this.statuses[id % this.statuses.length];
    const salary = 30000 + (id % 5) * 10000 + Math.floor(id / 5) * 1000;
    const hireDate = new Date(2020 + (id % 5), (id * 3) % 12, (id * 7) % 28 + 1);

    return { id, name, email, department, role, status, salary, hireDate };
  }

  getTableConfig(): AppTableConfig<any> {
    return {
      columns: [
        { key: 'id', header: '#', width: '60px', align: 'center', sortable: true },
        { key: 'name', header: 'Nombre', minWidth: '160px', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'department', header: 'Departamento', sortable: true },
        { key: 'role', header: 'Rol', sortable: true },
        { key: 'statusLabel', header: 'Estado', align: 'center', sortable: true },
        { key: 'salaryFormatted', header: 'Salario', align: 'right', sortable: true },
        { key: 'hireDateFormatted', header: 'Fecha contratación', sortable: true },
      ],
      actions: [
        { icon: 'edit', label: 'Editar', color: 'primary' },
        { icon: 'delete', label: 'Eliminar', color: 'warn', disabled: (row) => row.status === 'active' },
      ],
      trackByKey: 'id',
      stickyHeader: true,
    };
  }

  getFiltersConfig(): AppTableFiltersConfig {
    return {
      filters: [
        { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...' },
        { key: 'id', label: 'ID', type: 'number', placeholder: 'ID del empleado' },
        { key: 'department', label: 'Departamento', type: 'select', options: this.departments.map(d => ({ value: d, label: d })) },
        { key: 'status', label: 'Estado', type: 'select', options: [
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
          { value: 'vacation', label: 'Vacaciones' },
        ]},
        { key: 'hireDate', label: 'Fecha contratación', type: 'date', placeholder: 'DD/MM/YYYY' },
      ],
      showClearAll: true,
      appearance: 'outline',
    };
  }

  getAdvancedFiltersConfig(): AppTableFiltersAdvancedConfig {
    return {
      fields: [
        { key: 'name', label: 'Nombre', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'department', label: 'Departamento', type: 'select', options: this.departments.map(d => ({ value: d, label: d })) },
        { key: 'salary', label: 'Salario', type: 'number' },
        {
          key: 'status', label: 'Estado', type: 'select', options: [
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'vacation', label: 'Vacaciones' },
          ]
        },
        { key: 'hireDate', label: 'Fecha contratación', type: 'date' },
      ],
      toggles: [
        { key: 'showInactive', label: 'Mostrar inactivos', value: false },
      ],
      maxCriteria: 10,
      showClearButton: true,
      showSearchButton: true,
    };
  } 

  getPaginationConfig(): AppTablePaginationConfig {
    return {
      pageSizeOptions: [5, 10, 20],
      showFirstLastButtons: true,
    };
  }
}
