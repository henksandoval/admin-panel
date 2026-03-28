import { CurrencyPipe, DatePipe } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import {
  AppTableServerParams,
  AppTableServerResponse
} from "@ui-organisms/app-tables/server-side";
import { Observable } from "rxjs";
import { EMPLOYEE_STATUS_LABELS } from '@features/pds/shared';
import { Employee, EmployeeStatus } from '@features/pds/models';
import { generateEmployees } from "@features/pds/mocks/data/employees.data";

export interface EmployeeViewModel {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  statusLabel: string;
  salary: number;
  salaryFormatted: string;
  hireDate: Date;
  hireDateFormatted: string;
  isDeleted: boolean;
  isHidden: boolean;
}

@Injectable()
export class TableServerSideService {
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);
  private mockData: EmployeeViewModel[] = this.generateMockData(250);

  getEmployees(
    params: AppTableServerParams
  ): Observable<AppTableServerResponse<EmployeeViewModel>> {
    return new Observable((observer) => {
      setTimeout(() => {
        try {
          const filtered = this.applyFilters(this.mockData, params.filters);
          const sorted = this.applySort(filtered, params.sort);
          const paginated = this.applyPagination(sorted, params.pageIndex, params.pageSize);

          observer.next({
            data: paginated,
            total: filtered.length,
            page: params.pageIndex,
            pageSize: params.pageSize,
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1500);
    });
  }

  private applyFilters(
    data: EmployeeViewModel[],
    filters: Record<string, unknown>
  ): EmployeeViewModel[] {
    return data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;

        const itemValue = item[key as keyof EmployeeViewModel];

        if (typeof itemValue === 'string' && typeof value === 'string' && !this.isExactMatchField(key)) {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        return String(itemValue).toLowerCase() === String(value).toLowerCase();
      })
    );
  }

  private isExactMatchField(key: string): boolean {
    return ['status', 'department', 'id'].includes(key);
  }

  private applySort(
    data: EmployeeViewModel[],
    sort: { active: string; direction: string }
  ): EmployeeViewModel[] {
    if (!sort.active || !sort.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.active as keyof EmployeeViewModel];
      const bVal = b[sort.active as keyof EmployeeViewModel];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private applyPagination(
    data: EmployeeViewModel[],
    pageIndex: number,
    pageSize: number
  ): EmployeeViewModel[] {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }

  private generateMockData(count: number): EmployeeViewModel[] {
    return generateEmployees(count, 15).map(emp => this.toViewModel(emp));
  }

  private toViewModel(emp: Employee): EmployeeViewModel {
    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      statusLabel: EMPLOYEE_STATUS_LABELS[emp.status],
      salary: emp.salary,
      salaryFormatted: this.currencyPipe.transform(emp.salary, 'EUR', 'symbol', '1.2-2') ?? '',
      hireDate: emp.hireDate,
      hireDateFormatted: this.datePipe.transform(emp.hireDate, 'dd/MM/yyyy') ?? '',
      isDeleted: emp.isDeleted,
      isHidden: emp.isHidden,
    };
  }
}
