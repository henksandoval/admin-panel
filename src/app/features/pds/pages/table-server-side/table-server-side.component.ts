import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppTableConfig } from '@shared/atoms/app-table/app-table.model';
import { AppPaginationConfig } from '@shared/atoms/app-pagination/app-pagination.model';
import { TableServerSideService } from './table-server-side.service';
import { Employee } from '../table-client-side/table-client-side.service';
import { AppFiltersConfig } from '@shared/molecules/app-filters/app-filter.model';
import { AppTableServerSideComponent } from '@shared/organisms/app-table-server-side/app-table-server-side.component';
import { AppTableServerParams } from '@shared/organisms/app-table-server-side/app-table-server-side.model';

@Component({
  selector: 'app-table-server-side-pds',
  standalone: true,
  imports: [AppTableServerSideComponent, MatSnackBarModule],
  template: `
    <div class="p-6">
      <h1 class="mat-headline-large mb-6">Tabla Server-Side - Ejemplo</h1>

      <app-table-server-side
        [tableConfig]="tableConfig"
        [data]="employees()"
        [totalItems]="totalEmployees()"
        [loading]="isLoading()"
        [filtersConfig]="filtersConfig"
        [paginationConfig]="paginationConfig"
        (paramsChange)="loadEmployees($event)"
        (rowClick)="onRowClick($event)"
      />
    </div>
  `,
})
export class TableServerSideComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private tableServerSideService = inject(TableServerSideService);

  readonly employees = signal<Employee[]>([]);
  readonly totalEmployees = signal(0);
  readonly isLoading = signal(false);

  readonly tableConfig: AppTableConfig<Employee> = {
    columns: [
      { key: 'id', header: 'ID', width: '60px', sortable: true },
      { key: 'name', header: 'Nombre', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { key: 'department', header: 'Departamento', sortable: true },
      { key: 'role', header: 'Rol' },
      { key: 'statusLabel', header: 'Estado', sortable: true },
      {
        key: 'salary',
        header: 'Salario',
        sortable: true,
        align: 'right',
        valueFormatter: (value) =>
          new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
          }).format(value),
      },
      {
        key: 'hireDate',
        header: 'Fecha Ingreso',
        sortable: true,
        valueFormatter: (value) =>
          new Intl.DateTimeFormat('es-ES').format(new Date(value)),
      },
    ],
    trackByKey: 'id',
    clickableRows: true,
  };

  readonly filtersConfig: AppFiltersConfig = {
    fields: [
      {
        key: 'name',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Buscar por nombre...',
      },
      {
        key: 'department',
        label: 'Departamento',
        type: 'select',
        placeholder: 'Todos los departamentos',
        options: [
          { value: 'Engineering', label: 'Ingeniería' },
          { value: 'Sales', label: 'Ventas' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'HR', label: 'Recursos Humanos' },
          { value: 'Finance', label: 'Finanzas' },
        ],
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        placeholder: 'Todos los estados',
        options: [
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
          { value: 'vacation', label: 'De vacaciones' },
        ],
      },
    ],
    debounceMs: 300,
    showClearAll: true,
  };

  readonly paginationConfig: AppPaginationConfig = {
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    showPageSizeSelector: true,
  };

  ngOnInit(): void {
    this.loadEmployees({
      filters: {},
      sort: { active: '', direction: '' },
      pageIndex: 0,
      pageSize: 10,
    });
  }

  loadEmployees(params: AppTableServerParams): void {
    this.isLoading.set(true);

    this.tableServerSideService
      .getEmployees(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.employees.set(response.data);
          this.totalEmployees.set(response.total);
        },
        error: (error) => {
          this.snackBar.open('Error al cargar empleados', 'Cerrar', {
            duration: 3000,
          });
          console.error('Error loading employees:', error);
        },
      });
  }

  onRowClick(employee: Employee): void {
    this.snackBar.open(
      `Seleccionado: ${employee.name} (${employee.email})`,
      'Cerrar',
      { duration: 2000 }
    );
  }
}



