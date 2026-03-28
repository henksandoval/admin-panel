import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppTableServerSideComponent } from '@ui-organisms/app-tables/server-side';
import { AppTableServerParams } from '@ui-organisms/app-tables/server-side';
import { getFiltersConfig, getPaginationConfig, getTableConfig } from './table-server-side.config';
import { EmployeeViewModel, TableServerSideService } from './table-server-side.service';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { MockHttpService, MockEmployeeService } from '@features/pds/mocks';

@Component({
  selector: 'app-table-server-side-pds',
  standalone: true,
  imports: [AppTableServerSideComponent, MatSnackBarModule, MatButtonToggleModule, MatIconModule, AppPageLayoutComponent, AppSlotContainerDirective],
  providers: [CurrencyPipe, DatePipe, MockHttpService, MockEmployeeService, TableServerSideService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './table-server-side.component.scss',
  templateUrl: './table-server-side.component.html',
})
export class TableServerSideComponent implements OnInit {
  readonly useAdvancedFilters = signal(false);
  readonly employees = signal<EmployeeViewModel[]>([]);
  readonly totalEmployees = signal(0);
  readonly isLoading = signal(false);
  readonly tableConfig = getTableConfig();
  readonly filtersConfig = computed(() => getFiltersConfig(this.useAdvancedFilters()));
  readonly paginationConfig = getPaginationConfig();
  private readonly service = inject(TableServerSideService);
  private readonly snackBar = inject(MatSnackBar);

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
          this.snackBar.open(
            $localize`:Table|Load error snackbar@@tableserver.notify.loadError:Error loading employees`,
            '✕',
            { duration: 3000 },
          );
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
    const msg = $localize`:Table|Row click snackbar@@tableserver.notify.rowClick:Selected: ${employee.name}:name: (${employee.email}:email:)`;
    this.snackBar.open(msg, '✕', { duration: 2500 });
  }
}
