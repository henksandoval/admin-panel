import { CurrencyPipe, DatePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { EmployeeStatus, Employee, EMPLOYEE_STATUS_LABELS } from "../../contracts/employee.contract";
import { MockEmployeeService } from "../../mocks/mock-employee.service";

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
}

@Injectable()
export class TableClientSideService {
  private readonly mockEmployees = inject(MockEmployeeService);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  getEmployees(count: number): Observable<EmployeeViewModel[]> {
    return this.mockEmployees.getEmployees(count).pipe(
      map(employees => employees.map(emp => this.toViewModel(emp)))
    );
  }

  filterByToggles(data: EmployeeViewModel[], toggles: Record<string, boolean>): EmployeeViewModel[] {
    let result = data;
    if (!toggles['showInactive']) {
      result = result.filter(e => e.status !== 'inactive');
    }
    return result;
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
    };
  }
}