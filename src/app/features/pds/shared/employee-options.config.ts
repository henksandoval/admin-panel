import { EmployeeStatus } from '@features/pds/models';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: $localize`:Employee|Status label@@employee.status.active:Active`,
  inactive: $localize`:Employee|Status label@@employee.status.inactive:Inactive`,
  vacation: $localize`:Employee|Status label@@employee.status.vacation:Vacation`,
};

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: EMPLOYEE_STATUS_LABELS.active },
  { value: 'inactive', label: EMPLOYEE_STATUS_LABELS.inactive },
  { value: 'vacation', label: EMPLOYEE_STATUS_LABELS.vacation },
] as const;

export const EMPLOYEE_DEPARTMENTS = [
  $localize`:Employee|Department@@employee.department.engineering:Engineering`,
  $localize`:Employee|Department@@employee.department.marketing:Marketing`,
  $localize`:Employee|Department@@employee.department.sales:Sales`,
  $localize`:Employee|Department@@employee.department.hr:HR`,
  $localize`:Employee|Department@@employee.department.finance:Finance`,
] as const;

export const EMPLOYEE_ROLES = [
  $localize`:Employee|Role@@employee.role.junior:Junior`,
  $localize`:Employee|Role@@employee.role.mid:Mid`,
  $localize`:Employee|Role@@employee.role.senior:Senior`,
  $localize`:Employee|Role@@employee.role.lead:Lead`,
  $localize`:Employee|Role@@employee.role.manager:Manager`,
] as const;
