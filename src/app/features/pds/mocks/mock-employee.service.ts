import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Employee } from '@features/pds/models';
import { MockHttpService } from "./mock-http.service";
import { generateEmployees } from "./data/employees.data";

@Injectable()
export class MockEmployeeService {
  private readonly mockHttp = inject(MockHttpService);

  getEmployees(count: number): Observable<Employee[]> {
    return this.mockHttp.request(generateEmployees(count));
  }
}
