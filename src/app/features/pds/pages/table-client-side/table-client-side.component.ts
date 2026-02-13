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
import { AppTableAction, AppTableConfig } from '@shared/atoms/app-table/app-table.model';
import { TableClientSideService, Employee } from './table-client-side.service';
import { AppTableClientSideComponent } from '@shared/molecules/app-table/app-table-client-side/app-table-client-side.component';
import { AppTableFiltersAdvancedConfig, AppTableFiltersAdvancedOutput } from '@shared/molecules/app-table/app-table-filters-advanced/app-table-filters-advanced.model';

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
  readonly filtersConfig = this.service.getFiltersConfig();
  readonly paginationConfig = this.service.getPaginationConfig();
  readonly filterMode = signal<'simple' | 'advanced'>('simple');
  readonly advancedFiltersConfig = this.service.getAdvancedFiltersConfig();

  readonly toggleFilter = (data: EmployeeViewModel[], toggles: Record<string, boolean>) => {
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
    this.service.fetchEmployees(18).then(data => {
      this.employees.set(data);
      this.isLoading.set(false);
    });
  }

  onSort(event: any): void {
    console.log('[sort]', event);
  }

  onFilter(event: any): void {
    console.log('[filter]', event);
  }

  onAdvancedSearch(output: AppTableFiltersAdvancedOutput): void {
    console.log('[filter advanced]', output);
  }

  onPage(event: any): void {
    console.log('[page]', event);
  }

  onAction({ action, row }: { action: AppTableAction<EmployeeViewModel>; row: EmployeeViewModel }): void {
    this.snackBar.open(`${action.label}: ${row.name}`, '✕', { duration: 2500 });
  }
}
