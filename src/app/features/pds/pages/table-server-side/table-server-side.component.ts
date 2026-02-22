import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppTableServerSideComponent } from '@shared/organisms/app-table-server-side/app-table-server-side.component';
import { AppTableServerParams } from '@shared/organisms/app-table-server-side/app-table-server-side.model';
import { MockHttpService } from '../../mocks/mock-http.service';
import { MockEmployeeService } from '../../mocks/mock-employee.service';
import { getTableConfig, getFiltersConfig, getPaginationConfig } from './table-server-side.config';
import { TableServerSideService, EmployeeViewModel } from './table-server-side.service';

@Component({
  selector: 'app-table-server-side-pds',
  standalone: true,
  imports: [AppTableServerSideComponent, MatSnackBarModule, MatButtonToggleModule, MatIconModule],
  providers: [CurrencyPipe, DatePipe, MockHttpService, MockEmployeeService, TableServerSideService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './table-server-side.component.scss',
  templateUrl: './table-server-side.component.html',
})
export class TableServerSideComponent implements OnInit {
  private readonly service = inject(TableServerSideService);
  private readonly snackBar = inject(MatSnackBar);

  readonly useAdvancedFilters = signal(false);
  readonly employees = signal<EmployeeViewModel[]>([]);
  readonly totalEmployees = signal(0);
  readonly isLoading = signal(false);

  readonly tableConfig = getTableConfig();
  readonly filtersConfig = computed(() => getFiltersConfig(this.useAdvancedFilters()));
  readonly paginationConfig = getPaginationConfig();

  ngOnInit(): void {
    this.onParamsChange({
      filters: {},
      sort: { active: '', direction: '' },
      pageIndex: 0,
      pageSize: 10,
    });
  }

  onParamsChange(params: AppTableServerParams): void {
    this.isLoading.set(true);

    this.service
      .getEmployees(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.employees.set(response.data);
          this.totalEmployees.set(response.total);
        },
        error: () => {
          this.snackBar.open('Error al cargar empleados', '✕', {
            duration: 3000,
          });
        },
      });
  }

  /**
   * Nota: TypeScript actualmente tiene limitaciones infiriendo el tipo genérico T desde
   * output<T>() en componentes genéricos. El tipo EmployeeViewModel es correcto en runtime
   * gracias al $any() en el template. Los errores de linter son falsos positivos.
   * Ref: https://github.com/angular/angular/issues/49110
   */
  onRowClick(employee: EmployeeViewModel): void {
    this.snackBar.open(
      `Seleccionado: ${employee.name} (${employee.email})`,
      '✕',
      { duration: 2500 }
    );
  }
}



