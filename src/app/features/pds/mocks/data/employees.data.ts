import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_ROLES } from '../../shared/employee-options.config';
import { Employee, EmployeeStatus } from '../../models/employee.model';

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

/**
 * Retorna un elemento aleatorio de un array
 */
function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Retorna un número aleatorio entre min y max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retorna una fecha aleatoria entre dos fechas
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmployee(id: number, isDeleted = false, isHidden = false): Employee {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);

  return {
    id,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${id}@empresa.com`,
    department: randomItem(EMPLOYEE_DEPARTMENTS),
    role: randomItem(EMPLOYEE_ROLES),
    status: randomItem(STATUSES),
    salary: randomInt(30000, 120000),
    hireDate: randomDate(new Date(2018, 0, 1), new Date()),
    isDeleted,
    isHidden
  };
}

export function generateEmployees(count: number, deletedPercentage = 20, hiddenPercentage = 10): Employee[] {
  return Array.from({length: count}, (_, i) => {
    const shouldBeDeleted = Math.random() * 100 < deletedPercentage;
    const shouldBeHidden = Math.random() * 100 < hiddenPercentage;
    return generateEmployee(i + 1, shouldBeDeleted, shouldBeHidden);
  });
}
