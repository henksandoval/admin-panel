import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Employee } from '../models/employee.model';
import { generateEmployees } from "./data/employees.data";
import { MockHttpService } from "./mock-http.service";

@Injectable()
export class MockEmployeeService {
  private readonly mockHttp = inject(MockHttpService);

  getEmployees(count: number): Observable<Employee[]> {
    return this.mockHttp.request(generateEmployees(count));
  }
}
