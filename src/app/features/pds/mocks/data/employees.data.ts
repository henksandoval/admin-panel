import { EmployeeStatus, Employee, EMPLOYEE_DEPARTMENTS, EMPLOYEE_ROLES } from "../../contracts/employee.contract";

const FIRST_NAMES = [
  'Ana', 'Carlos', 'María', 'Juan', 'Laura', 'Pedro', 'Sofía', 'Diego',
  'Valentina', 'Andrés', 'Camila', 'Santiago', 'Isabella', 'Mateo', 'Lucía',
  'Daniel', 'Emma', 'Sebastián'
];

const LAST_NAMES = [
  'García', 'López', 'Rodríguez', 'Martínez', 'Sánchez', 'Fernández',
  'Gómez', 'Díaz', 'Torres', 'Ruiz', 'Vargas', 'Moreno', 'Castro',
  'Jiménez', 'Romero', 'Herrera', 'Mendoza', 'Ortiz'
];

const STATUSES: EmployeeStatus[] = ['active', 'inactive', 'vacation'];

function generateEmployee(id: number): Employee {
  const firstName = FIRST_NAMES[id % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(id / FIRST_NAMES.length) % LAST_NAMES.length];

  return {
    id,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@empresa.com`,
    department: EMPLOYEE_DEPARTMENTS[id % EMPLOYEE_DEPARTMENTS.length],
    role: EMPLOYEE_ROLES[id % EMPLOYEE_ROLES.length],
    status: STATUSES[id % STATUSES.length],
    salary: 30000 + (id % 5) * 10000 + Math.floor(id / 5) * 1000,
    hireDate: new Date(2020 + (id % 5), (id * 3) % 12, (id * 7) % 28 + 1),
  };
}

export function generateEmployees(count: number): Employee[] {
  return Array.from({length: count}, (_, i) => generateEmployee(i + 1));
}