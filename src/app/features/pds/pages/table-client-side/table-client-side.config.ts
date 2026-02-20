import {AppTableConfig} from '@shared/atoms/app-table/app-table.model';
import {AppPaginationConfig} from '@shared/atoms/app-pagination/app-pagination.model';
import {AppFiltersConfig} from '@shared/molecules/app-filters/app-filter.model';
import { Employee, EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUS_OPTIONS } from '../../contracts/employee.contract';

export function getTableConfig(): AppTableConfig<Employee> {
  return {
    columns: [
      {key: 'id', header: '#', width: '60px', align: 'center', sortable: true},
      {key: 'name', header: 'Nombre', minWidth: '160px', sortable: true},
      {key: 'email', header: 'Email', sortable: true},
      {key: 'department', header: 'Departamento', sortable: true},
      {key: 'role', header: 'Rol', sortable: true},
      {key: 'statusLabel', header: 'Estado', align: 'center', sortable: true},
      {key: 'salaryFormatted', header: 'Salario', align: 'right', sortable: true},
      {key: 'hireDateFormatted', header: 'Fecha contratación', sortable: true},
    ],
    actions: [
      {icon: 'edit', label: 'Editar', color: 'primary'},
      {icon: 'delete', label: 'Eliminar', color: 'warn', disabled: (row) => row.status === 'active'},
    ],
    trackByKey: 'id',
    stickyHeader: true,
  };
}

export function getFiltersConfig(useAdvanced: boolean): AppFiltersConfig {
  const departmentField = {
    key: 'department',
    label: 'Departamento',
    type: 'select' as const,
    options: EMPLOYEE_DEPARTMENTS.map(d => ({value: d, label: d})),
  };

  const statusField = {
    key: 'status',
    label: 'Estado',
    type: 'select' as const,
    options: EMPLOYEE_STATUS_OPTIONS.map(opt => ({...opt})),
  };

  const hireDateField = {
    key: 'hireDate',
    label: 'Fecha contratación',
    type: 'date' as const,
  };

  const toggles = [
    {key: 'showDeleted', label: 'Mostrar eliminados', value: false},
    {key: 'showInactive', label: 'Mostrar inactivos', value: false},
  ];

  if (useAdvanced) {
    return {
      fields: [
        {key: 'id', label: 'Identificador', type: 'number'},
        {key: 'name', label: 'Nombre', type: 'text'},
        {key: 'email', label: 'Email', type: 'text'},
        departmentField,
        statusField,
        hireDateField,
        {key: 'salary', label: 'Salario', type: 'number'},
      ],
      toggles,
    };
  }

  return {
    fields: [
      {key: 'id', label: 'ID', type: 'number', placeholder: 'ID del empleado'},
      {key: 'name', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre...'},
      departmentField,
      statusField,
      hireDateField,
    ],
    toggles,
  };
}

export function getPaginationConfig(): AppPaginationConfig {
  return {
    pageSizeOptions: [5, 10, 20],
    showFirstLastButtons: true,
  };
}