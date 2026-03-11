import { AppTableConfig } from '@ui-atoms/app-table/app-table.model';
import { AppFiltersConfig } from '@ui-molecules/app-filters/app-filter.model';
import { AppPaginationConfig } from '@ui-atoms/app-pagination/app-pagination.model';
import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUS_OPTIONS } from '../../contracts/employee.contract';
import { EmployeeViewModel } from './table-server-side.service';

export function getTableConfig(): AppTableConfig<EmployeeViewModel> {
  return {
    columns: [
      { key: 'id', header: '#', width: '60px', align: 'center', sortable: true },
      { key: 'name', header: $localize`:Table|Column header@@employee.col.name:Name`, minWidth: '160px', sortable: true },
      { key: 'email', header: $localize`:Table|Column header@@employee.col.email:Email`, sortable: true },
      { key: 'department', header: $localize`:Table|Column header@@employee.col.department:Department`, sortable: true },
      { key: 'role', header: $localize`:Table|Column header@@employee.col.role:Role`, sortable: true },
      { key: 'statusLabel', header: $localize`:Table|Column header@@employee.col.status:Status`, align: 'center', sortable: true },
      { key: 'salaryFormatted', header: $localize`:Table|Column header@@employee.col.salary:Salary`, align: 'right', sortable: true },
      { key: 'hireDateFormatted', header: $localize`:Table|Column header@@employee.col.hireDate:Hire date`, sortable: true },
    ],
    trackByKey: 'id',
    stickyHeader: true,
    maxHeight: '560px',
    clickableRows: true,
  };
}

export function getFiltersConfig(useAdvanced: boolean): AppFiltersConfig {
  const departmentField = {
    key: 'department',
    label: $localize`:Table|Filter field label@@employee.col.department:Department`,
    type: 'select' as const,
    options: EMPLOYEE_DEPARTMENTS.map(d => ({ value: d, label: d })),
  };

  const statusField = {
    key: 'status',
    label: $localize`:Table|Filter field label@@employee.col.status:Status`,
    type: 'select' as const,
    options: EMPLOYEE_STATUS_OPTIONS.map(opt => ({ ...opt })),
  };

  const hireDateField = {
    key: 'hireDate',
    label: $localize`:Table|Filter field label@@employee.col.hireDate:Hire date`,
    type: 'date' as const,
  };

  const toggles = [
    { key: 'isDeleted', label: $localize`:Table|Filter toggle@@employee.toggle.showDeleted:Show deleted`, value: false },
    { key: 'isHidden', label: $localize`:Table|Filter toggle@@employee.toggle.showHidden:Show hidden`, value: false },
  ];

  if (useAdvanced) {
    return {
      fields: [
        { key: 'id', label: $localize`:Table|Filter field label@@employee.field.id:ID`, type: 'number' },
        { key: 'name', label: $localize`:Table|Filter field label@@employee.col.name:Name`, type: 'text' },
        { key: 'email', label: $localize`:Table|Filter field label@@employee.col.email:Email`, type: 'text' },
        departmentField,
        statusField,
        hireDateField,
        { key: 'salary', label: $localize`:Table|Filter field label@@employee.col.salary:Salary`, type: 'number' },
      ],
      toggles
    };
  }

  return {
    fields: [
      { key: 'id', label: $localize`:Table|Filter field label@@employee.field.id:ID`, type: 'number', placeholder: $localize`:Table|Filter placeholder@@employee.placeholder.id:Employee ID` },
      { key: 'name', label: $localize`:Table|Filter field label@@employee.col.name:Name`, type: 'text', placeholder: $localize`:Table|Filter placeholder@@employee.placeholder.name:Search by name...` },
      departmentField,
      statusField,
      hireDateField,
    ],
    toggles,
  };
}

export function getPaginationConfig(): AppPaginationConfig {
  return {
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLastButtons: true,
    showPageSizeSelector: true,
  };
}
