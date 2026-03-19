export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  salary: number;
  hireDate: Date;
  isDeleted: boolean;
  isHidden: boolean;
}

export type EmployeeStatus = 'active' | 'inactive' | 'vacation';
