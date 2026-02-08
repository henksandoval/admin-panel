import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppTableConfig, AppTableAction } from '@shared/atoms/app-table/app-table.model';
import { AppTableFiltersConfig } from '@shared/molecules/app-table-filters/app-table-filters.model';
import { AppTablePaginationConfig } from '@shared/atoms/app-table/app-table-pagination.model';
import { AppTableCompleteComponent } from '@shared/molecules/app-table-component/app-table-complete.component';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  salary: number;
}

const DEPARTMENTS = ['Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas'];

const EMPLOYEES: Employee[] = [
  { id: 1,  name: 'Ana García',        email: 'ana.garcia@empresa.com',        department: 'Ingeniería', role: 'Senior',  status: 'active',   salary: 52000 },
  { id: 2,  name: 'Carlos López',      email: 'carlos.lopez@empresa.com',      department: 'Marketing',  role: 'Lead',    status: 'active',   salary: 61000 },
  { id: 3,  name: 'María Rodríguez',   email: 'maria.rodriguez@empresa.com',   department: 'Ventas',     role: 'Junior',  status: 'vacation', salary: 32000 },
  { id: 4,  name: 'Juan Martínez',     email: 'juan.martinez@empresa.com',     department: 'RRHH',       role: 'Manager', status: 'active',   salary: 68000 },
  { id: 5,  name: 'Laura Sánchez',     email: 'laura.sanchez@empresa.com',     department: 'Finanzas',   role: 'Senior',  status: 'inactive', salary: 55000 },
  { id: 6,  name: 'Pedro Fernández',   email: 'pedro.fernandez@empresa.com',   department: 'Ingeniería', role: 'Mid',     status: 'active',   salary: 42000 },
  { id: 7,  name: 'Sofía Gómez',       email: 'sofia.gomez@empresa.com',       department: 'Marketing',  role: 'Junior',  status: 'active',   salary: 30000 },
  { id: 8,  name: 'Diego Díaz',        email: 'diego.diaz@empresa.com',        department: 'Ventas',     role: 'Senior',  status: 'vacation', salary: 53000 },
  { id: 9,  name: 'Valentina Torres',  email: 'valentina.torres@empresa.com',  department: 'Ingeniería', role: 'Lead',    status: 'active',   salary: 64000 },
  { id: 10, name: 'Andrés Ruiz',       email: 'andres.ruiz@empresa.com',       department: 'Finanzas',   role: 'Mid',     status: 'inactive', salary: 44000 },
  { id: 11, name: 'Camila Vargas',     email: 'camila.vargas@empresa.com',     department: 'RRHH',       role: 'Junior',  status: 'active',   salary: 31000 },
  { id: 12, name: 'Santiago Moreno',   email: 'santiago.moreno@empresa.com',   department: 'Ingeniería', role: 'Manager', status: 'active',   salary: 72000 },
  { id: 13, name: 'Isabella Castro',   email: 'isabella.castro@empresa.com',   department: 'Marketing',  role: 'Senior',  status: 'active',   salary: 56000 },
  { id: 14, name: 'Mateo Jiménez',     email: 'mateo.jimenez@empresa.com',     department: 'Ventas',     role: 'Mid',     status: 'inactive', salary: 40000 },
  { id: 15, name: 'Lucía Romero',      email: 'lucia.romero@empresa.com',      department: 'Finanzas',   role: 'Lead',    status: 'active',   salary: 63000 },
  { id: 16, name: 'Daniel Herrera',    email: 'daniel.herrera@empresa.com',    department: 'Ingeniería', role: 'Senior',  status: 'vacation', salary: 54000 },
  { id: 17, name: 'Emma Mendoza',      email: 'emma.mendoza@empresa.com',      department: 'RRHH',       role: 'Mid',     status: 'active',   salary: 43000 },
  { id: 18, name: 'Sebastián Ortiz',   email: 'sebastian.ortiz@empresa.com',   department: 'Marketing',  role: 'Manager', status: 'active',   salary: 70000 },
];

@Component({
  selector: 'app-tables-pds',
  standalone: true,
  imports: [CurrencyPipe, MatSnackBarModule, AppTableCompleteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tables.component.scss',
  template: `
    <div class="pds-page">
      <h1>Directorio de empleados</h1>

      <app-table-complete
        [tableConfig]="tableConfig"
        [filtersConfig]="filtersConfig"
        [paginationConfig]="paginationConfig"
        [data]="employees"
        (sortChange)="onSort($event)"
        (filterChange)="onFilter($event)"
        (pageChange)="onPage($event)"
        (actionClick)="onAction($event)">

        <ng-template #cellTemplate let-row let-col="column" let-value="value">
          @switch (col.key) {
            @case ('status') {
              <span class="badge" [class]="'badge--' + value">
                {{ statusLabel[value] }}
              </span>
            }
            @case ('salary') {
              <span class="salary">{{ value | currency:'EUR':'symbol':'1.0-0' }}</span>
            }
            @default {
              {{ value }}
            }
          }
        </ng-template>

      </app-table-complete>
    </div>
  `,
})
export class TablesComponent {
  private snackBar = inject(MatSnackBar);

  readonly employees = EMPLOYEES;

  readonly statusLabel: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'Vacaciones',
  };

  readonly tableConfig: AppTableConfig<Employee> = {
    columns: [
      { key: 'id',         header: '#',            width: '60px', align: 'center', sortable: true },
      { key: 'name',       header: 'Nombre',       minWidth: '160px', sortable: true },
      { key: 'email',      header: 'Email',        sortable: true },
      { key: 'department', header: 'Departamento', sortable: true },
      { key: 'role',       header: 'Rol',          sortable: true },
      { key: 'status',     header: 'Estado',       align: 'center', sortable: true },
      { key: 'salary',     header: 'Salario',      align: 'right', sortable: true },
    ],
    actions: [
      { icon: 'edit',   label: 'Editar',   color: 'primary' },
      { icon: 'delete', label: 'Eliminar', color: 'warn', disabled: (row) => row.status === 'active' },
    ],
    trackByKey: 'id',
    stickyHeader: true,
  };

  readonly filtersConfig: AppTableFiltersConfig = {
    filters: [
      { key: 'name',       label: 'Nombre',        type: 'text',   placeholder: 'Buscar por nombre...' },
      { key: 'department', label: 'Departamento',   type: 'select', options: DEPARTMENTS.map(d => ({ value: d, label: d })) },
      { key: 'status',     label: 'Estado',         type: 'select', options: [
          { value: 'active',   label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
          { value: 'vacation', label: 'Vacaciones' },
        ]},
    ],
    showClearAll: true,
    appearance: 'outline',
  };

  readonly paginationConfig: AppTablePaginationConfig = {
    pageSizeOptions: [5, 10],
    showFirstLastButtons: true,
  };

  onSort(event: any): void {
    console.log('[sort]', event);
  }

  onFilter(event: any): void {
    console.log('[filter]', event);
  }

  onPage(event: any): void {
    console.log('[page]', event);
  }

  onAction({ action, row }: { action: AppTableAction<Employee>; row: Employee }): void {
    this.snackBar.open(`${action.label}: ${row.name}`, '✕', { duration: 2500 });
  }
}