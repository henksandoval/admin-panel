import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppTableAction, AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { Employee, TableClientSideService } from './table-client-side.service';
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
  readonly useAdvancedFilters = signal(false);
  readonly isLoading = signal(true);
  readonly employees = signal<Employee[]>([]);
  private readonly service = inject(TableClientSideService);
  readonly tableConfig = this.service.getTableConfig();
  readonly paginationConfig = this.service.getPaginationConfig();
  readonly filtersConfig = computed(() => this.service.getFiltersConfig(this.useAdvancedFilters()));
  private readonly snackBar = inject(MatSnackBar);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);
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

  readonly toggleFilter = (data: EmployeeViewModel[], toggles: Record<string, boolean>): EmployeeViewModel[] => {
    let result = data;
    if (!toggles['showInactive']) {
      result = result.filter(e => e.status !== 'inactive');
    }
    return result;
  };

  ngOnInit(): void {
    void this.service.fetchEmployees(18).then(data => {
      this.employees.set(data);
      this.isLoading.set(false);
    });
  }

  onSort(event: AppTableSort): void {
    this.snackBar.open(`Ordenar por: ${event.active} (${event.direction})`, '✕', { duration: 2500 });
  }

  onFilters(filters: AppFilterValues | AppFiltersOutput): void {
    const mode = this.useAdvancedFilters() ? 'avanzada' : 'simple';
    this.snackBar.open(`Búsqueda ${mode} aplicada`, '✕', { duration: 2500 });
    console.debug('[filters]', filters);
  }

  onPage(event: AppPageEvent): void {
    this.snackBar.open(`Página: ${event.pageIndex + 1} (items por página: ${event.pageSize})`, '✕', { duration: 2500 });
    console.debug('[page]', event);
  }

  onAction({ action, row }: { action: AppTableAction<EmployeeViewModel>; row: EmployeeViewModel }): void {
    this.snackBar.open(`${action.label}: ${row.name}`, '✕', { duration: 2500 });
  }
}
