import { Injectable } from "@angular/core";
import {
  AppTableServerParams,
  AppTableServerResponse
} from "@shared/organisms/app-table-server-side/app-table-server-side.model";
import { Observable } from "rxjs";
import { Employee, EMPLOYEE_STATUS_LABELS } from "../../contracts/employee.contract";
import { generateEmployees } from "../../mocks/data/employees.data";

type EmployeeWithLabel = Employee & { statusLabel: string };

@Injectable({providedIn: 'root'})
export class TableServerSideService {
  private mockData: EmployeeWithLabel[] = this.generateMockData(250);

  getEmployees(
    params: AppTableServerParams
  ): Observable<AppTableServerResponse<EmployeeWithLabel>> {
    return new Observable((observer) => {
      setTimeout(() => {
        try {
          let filtered = [...this.mockData];

          Object.entries(params.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              filtered = filtered.filter((item) => {
                const itemValue = item[key as keyof EmployeeWithLabel];
                return String(itemValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              });
            }
          });

          if (params.sort.active && params.sort.direction) {
            filtered.sort((a, b) => {
              const aVal = a[params.sort.active as keyof EmployeeWithLabel];
              const bVal = b[params.sort.active as keyof EmployeeWithLabel];

              let comparison = 0;
              if (aVal < bVal) comparison = -1;
              if (aVal > bVal) comparison = 1;

              return params.sort.direction === 'asc' ? comparison : -comparison;
            });
          }

          const total = filtered.length;

          const start = params.pageIndex * params.pageSize;
          const end = start + params.pageSize;
          const page = filtered.slice(start, end);

          observer.next({
            data: page,
            total: total,
            page: params.pageIndex,
            pageSize: params.pageSize,
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 2500);
    });
  }

  private generateMockData(count: number): EmployeeWithLabel[] {
    return generateEmployees(count, 15).map(employee => ({
      ...employee,
      statusLabel: EMPLOYEE_STATUS_LABELS[employee.status]
    }));
  }
}
