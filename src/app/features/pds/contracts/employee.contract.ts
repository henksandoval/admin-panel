export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  salary: number;
  hireDate: Date;
}

export type EmployeeStatus = 'active' | 'inactive' | 'vacation';

export const EMPLOYEE_STATUS_OPTIONS = [
  {value: 'active', label: 'Activo'},
  {value: 'inactive', label: 'Inactivo'},
  {value: 'vacation', label: 'Vacaciones'},
] as const;

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  vacation: 'Vacaciones',
};

export const EMPLOYEE_DEPARTMENTS = [
  'Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas'
] as const;

export const EMPLOYEE_ROLES = [
  'Junior', 'Mid', 'Senior', 'Lead', 'Manager'
] as const;