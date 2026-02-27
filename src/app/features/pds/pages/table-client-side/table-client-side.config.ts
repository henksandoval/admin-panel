import { AppTableConfig } from '@ui-atoms/app-table/app-table.model';
import { AppFiltersConfig } from '@ui-molecules/app-filters/app-filter.model';
import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUS_OPTIONS } from '../../contracts/employee.contract';
import { EmployeeViewModel } from './table-client-side.service';

export function getTableConfig(): AppTableConfig<EmployeeViewModel> {
  return {
    columns: [
      {key: 'id', header: '#', width: '60px', align: 'center', sortable: true},
      {key: 'name', header: $localize`:Table|Column header@@tableclient.col.name:Name`, minWidth: '160px', sortable: true},
      {key: 'email', header: $localize`:Table|Column header@@tableclient.col.email:Email`, sortable: true},
      {key: 'department', header: $localize`:Table|Column header@@tableclient.col.department:Department`, sortable: true},
      {key: 'role', header: $localize`:Table|Column header@@tableclient.col.role:Role`, sortable: true},
      {key: 'statusLabel', header: $localize`:Table|Column header@@tableclient.col.status:Status`, align: 'center', sortable: true},
      {key: 'salaryFormatted', header: $localize`:Table|Column header@@tableclient.col.salary:Salary`, align: 'right', sortable: true},
      {key: 'hireDateFormatted', header: $localize`:Table|Column header@@tableclient.col.hireDate:Hire date`, sortable: true},
      {key: 'isDeleted', isHidden: true},
      {key: 'isHidden', isHidden: true},
    ],
    actions: [
      {icon: 'edit', label: $localize`:Table|Row action@@tableclient.action.edit:Edit`, color: 'primary'},
      {icon: 'delete', label: $localize`:Table|Row action@@tableclient.action.delete:Delete`, color: 'warn', disabled: (row) => row.status === 'active'},
    ],
    trackByKey: 'id',
    stickyHeader: true,
  };
}

export function getFiltersConfig(useAdvanced: boolean): AppFiltersConfig {
  const departmentField = {
    key: 'department',
    label: $localize`:Table|Filter field label@@tableclient.col.department:Department`,
    type: 'select' as const,
    options: EMPLOYEE_DEPARTMENTS.map(d => ({value: d, label: d})),
  };

  const statusField = {
    key: 'status',
    label: $localize`:Table|Filter field label@@tableclient.col.status:Status`,
    type: 'select' as const,
    options: EMPLOYEE_STATUS_OPTIONS.map(opt => ({...opt})),
  };

  const hireDateField = {
    key: 'hireDate',
    label: $localize`:Table|Filter field label@@tableclient.col.hireDate:Hire date`,
    type: 'date' as const,
  };

  const toggles = [
    {key: 'isDeleted', label: $localize`:Table|Filter toggle@@tableclient.toggle.showDeleted:Show deleted`, value: false},
    {key: 'isHidden', label: $localize`:Table|Filter toggle@@tableclient.toggle.showHidden:Show hidden`, value: false},
  ];

  if (useAdvanced) {
    return {
      fields: [
        {key: 'id', label: $localize`:Table|Filter field label@@tableclient.field.id:ID`, type: 'number'},
        {key: 'name', label: $localize`:Table|Filter field label@@tableclient.col.name:Name`, type: 'text'},
        {key: 'email', label: $localize`:Table|Filter field label@@tableclient.col.email:Email`, type: 'text'},
        departmentField,
        statusField,
        hireDateField,
        {key: 'salary', label: $localize`:Table|Filter field label@@tableclient.col.salary:Salary`, type: 'number'},
      ],
      toggles,
    };
  }

  return {
    fields: [
      {key: 'id', label: $localize`:Table|Filter field label@@tableclient.field.id:ID`, type: 'number', placeholder: $localize`:Table|Filter placeholder@@tableclient.placeholder.id:Employee ID`},
      {key: 'name', label: $localize`:Table|Filter field label@@tableclient.col.name:Name`, type: 'text', placeholder: $localize`:Table|Filter placeholder@@tableclient.placeholder.name:Search by name...`},
      departmentField,
      statusField,
      hireDateField,
    ],
    toggles,
  };
}
