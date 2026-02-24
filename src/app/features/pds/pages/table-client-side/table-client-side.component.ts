import { CurrencyPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from "@angular/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AppPageEvent } from "@ui-atoms/app-pagination/app-pagination.model";
import { AppTableAction, AppTableSort } from "@ui-atoms/app-table/app-table.model";
import { AppToggleGroupComponent } from "@ui-atoms/app-toggle-group/app-toggle-group.component";
import { ToggleOption } from "@ui-atoms/app-toggle-group/app-toggle-group.model";
import { AppFilterCriterion } from "@ui-molecules/app-filters/app-filter.model";
import { AppTableClientSideComponent } from "@ui-organisms/app-tables/client-side/app-table-client-side.component";
import { MockEmployeeService } from "../../mocks/mock-employee.service";
import { MockHttpService } from "../../mocks/mock-http.service";
import { getFiltersConfig, getTableConfig } from "./table-client-side.config";
import { EmployeeViewModel, TableClientSideService } from "./table-client-side.service";

const FILTER_MODE_OPTIONS: ToggleOption[] = [
  { value: 'false', label: 'Filtros Simples', icon: 'filter_list' },
  { value: 'true',  label: 'Filtros Avanzados', icon: 'tune' },
];

@Component({
  selector: 'app-table-client-side-client-side-pds',
  standalone: true,
  imports: [MatSnackBarModule, AppTableClientSideComponent, AppToggleGroupComponent],
  providers: [CurrencyPipe, DatePipe, MockHttpService, MockEmployeeService, TableClientSideService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './table-client-side.component.scss',
  templateUrl: './table-client-side.component.html'
})
export class TableClientSideComponent implements OnInit {
  readonly filterModeOptions = FILTER_MODE_OPTIONS;
  readonly filterModeValue = signal('false');
  readonly useAdvancedFilters = computed(() => this.filterModeValue() === 'true');
  readonly isLoading = signal(true);
  readonly employees = signal<EmployeeViewModel[]>([]);
  readonly tableConfig = getTableConfig();
  readonly filtersConfig = computed(() => getFiltersConfig(this.useAdvancedFilters()));
  private readonly service = inject(TableClientSideService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.service.getEmployees(45).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSortChange(event: AppTableSort): void {
    this.snackBar.open(`Ordenar por: ${event.active} (${event.direction})`, '✕', { duration: 2500 });
  }

  onFiltersChange(_filters: AppFilterCriterion[]): void {
    const mode = this.useAdvancedFilters() ? 'avanzada' : 'simple';
    this.snackBar.open(`Búsqueda ${mode} aplicada`, '✕', { duration: 2500 });
  }

  onPageChange(event: AppPageEvent): void {
    this.snackBar.open(`Página: ${event.pageIndex + 1} (items por página: ${event.pageSize})`, '✕', { duration: 2500 });
  }

  onActionClick({ action, row }: { action: AppTableAction<EmployeeViewModel>; row: EmployeeViewModel }): void {
    this.snackBar.open(`${action.label}: ${row.name}`, '✕', { duration: 2500 });
  }
}

