import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppTableAction, AppTableConfig, AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { TableClientSideService, Employee } from './table-client-side.service';
import { AppTableClientSideComponent } from '@shared/organisms/app-table-client-side/app-table-client-side.component';
import { AppFiltersOutput, AppFilterValues } from '@shared/molecules/app-filters/app-filter.model';
import { AppPageEvent } from '@shared/atoms/app-pagination/app-pagination.model';

interface EmployeeViewModel {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  statusLabel: string;
  salary: number;
  salaryFormatted: string;
  hireDate: Date;
  hireDateFormatted: string;
}

@Component({
  selector: 'app-table-client-side-client-side-pds',
  standalone: true,
  imports: [MatSnackBarModule, AppTableClientSideComponent, MatButtonToggleModule, MatIconModule],
  providers: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './table-client-side.component.scss',
  templateUrl: './table-client-side.component.html'
})
export class TableClientSideComponent implements OnInit {
  private readonly service = inject(TableClientSideService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  readonly tableConfig = this.service.getTableConfig();
  readonly paginationConfig = this.service.getPaginationConfig();
  readonly filterMode = signal<'simple' | 'advanced'>('simple');
  readonly filtersConfig = this.service.getFiltersConfig();
  readonly advancedFiltersConfig = this.service.getAdvancedFiltersConfig();

  readonly toggleFilter = (data: EmployeeViewModel[], toggles: Record<string, boolean>): EmployeeViewModel[] => {
    let result = data;
    if (!toggles['showInactive']) {
      result = result.filter(e => e.status !== 'inactive');
    }
    return result;
  };

  readonly testTableConfig: AppTableConfig<EmployeeViewModel> = {
    columns: [
      { key: 'id', header: 'ID', width: '60px' },
      { key: 'name', header: 'Nombre' },
      { key: 'statusLabel', header: 'Estado' },
      { key: 'salaryFormatted', header: 'Salario' },
    ],
    trackByKey: 'id' as keyof EmployeeViewModel,
  };

  readonly isLoading = signal(true);
  readonly employees = signal<Employee[]>([]);

  readonly employeesViewModel = computed<EmployeeViewModel[]>(() =>
    this.employees().map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      statusLabel: this.service.statusLabels[emp.status],
      salary: emp.salary,
      salaryFormatted: this.currencyPipe.transform(emp.salary, 'EUR', 'symbol', '1.2-2') ?? '',
      hireDate: emp.hireDate,
      hireDateFormatted: this.datePipe.transform(emp.hireDate, 'dd/MM/yyyy') ?? '',
    }))
  );

  ngOnInit(): void {
    void this.service.fetchEmployees(18).then(data => {
      this.employees.set(data);
      this.isLoading.set(false);
    });
  }

  onSort(event: AppTableSort): void {
    this.snackBar.open(`Ordenar por: ${event.active} (${event.direction})`, '✕', { duration: 2500 });
  }

  onFilter(event: AppFilterValues): void {
    this.snackBar.open(`Filtros aplicados - ver consola`, '✕', { duration: 2500 });
    console.debug('[filter]', event);
  }

  onAdvancedSearch(output: AppFiltersOutput): void {
    this.snackBar.open(`Búsqueda avanzada aplicada ver consola`, '✕', { duration: 2500 });
    console.debug('[filter advanced]', output);
  }

  onPage(event: AppPageEvent): void {
    this.snackBar.open(`Página: ${event.pageIndex + 1} (items por página: ${event.pageSize})`, '✕', { duration: 2500 });
    console.debug('[page]', event);
  }

  onAction({ action, row }: { action: AppTableAction<EmployeeViewModel>; row: EmployeeViewModel }): void {
    this.snackBar.open(`${action.label}: ${row.name}`, '✕', { duration: 2500 });
  }
}
