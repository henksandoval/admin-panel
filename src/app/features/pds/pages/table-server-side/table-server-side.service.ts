import {Injectable} from "@angular/core";
import { AppTableServerParams, AppTableServerResponse } from "@shared/organisms/app-table-server-side/app-table-server-side.model";
import {Observable} from "rxjs";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  statusLabel: string;
  salary: number;
  hireDate: Date;
}

@Injectable({providedIn: 'root'})
export class TableServerSideService {
  private readonly statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'De vacaciones',
  };

  private mockData: Employee[] = this.generateMockData(250);

  getEmployees(
    params: AppTableServerParams
  ): Observable<AppTableServerResponse<Employee>> {
    return new Observable((observer) => {
      setTimeout(() => {
        try {
          let filtered = [...this.mockData];

          Object.entries(params.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              filtered = filtered.filter((item) => {
                const itemValue = item[key as keyof Employee];
                return String(itemValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              });
            }
          });

          if (params.sort.active && params.sort.direction) {
            filtered.sort((a, b) => {
              const aVal = a[params.sort.active as keyof Employee];
              const bVal = b[params.sort.active as keyof Employee];

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

  private generateMockData(count: number): Employee[] {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const roles = [
      'Manager',
      'Senior',
      'Mid-level',
      'Junior',
      'Lead',
      'Director',
    ];
    const statuses: Array<'active' | 'inactive' | 'vacation'> = [
      'active',
      'inactive',
      'vacation',
    ];

    return Array.from({length: count}, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        id: i + 1,
        name: `Empleado ${i + 1}`,
        email: `empleado${i + 1}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        status,
        statusLabel: this.statusLabels[status],
        salary: Math.floor(Math.random() * 100000) + 30000,
        hireDate: new Date(
          2020 + Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
      };
    });
  }
}
