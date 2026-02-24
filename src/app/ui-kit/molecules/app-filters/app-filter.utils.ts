import {AppFilterCriterion, AppFilterOperator, AppFilterToggle, DEFAULT_FILTER_OPERATORS} from './app-filter.model';

export function formatCriterionDisplayValue(criterion: AppFilterCriterion): string {
  const { value, field, operator } = criterion;

  if (!operator.requiresValue) {
    return operator.label;
  }

  switch (field.type) {
    case 'select':
      return field.options?.find(o => String(o.value) === String(value))?.label ?? String(value);
    case 'boolean':
      return value === true || value === 'true' ? 'Sí' : 'No';
    case 'date':
      if (!value) return '';
      try {
        return new Date(value as string | number).toLocaleDateString('es-ES');
      } catch {
        return String(value);
      }
    case 'text':
      return `"${value}"`;
    default:
      return String(value ?? '');
  }
}

export function togglesToRecord(toggles: AppFilterToggle[]): Record<string, boolean> {
  return toggles.reduce<Record<string, boolean>>((acc, toggle) => {
    acc[toggle.key] = toggle.value;
    return acc;
  }, {});
}

export function togglesToCriteria(
  toggles: Record<string, boolean>,
  operators: AppFilterOperator[] = DEFAULT_FILTER_OPERATORS
): AppFilterCriterion[] {
  const eqOperator = operators.find(op => op.key === 'eq');

  if (!eqOperator) {
    return [];
  }

  return Object.entries(toggles)
    .filter(([, value]) => value === false)
    .map(([key]) => ({
      id: `toggle_${key}`,
      field: { key, label: key, type: 'boolean' as const },
      operator: eqOperator,
      value: false,
    }));
}

export function combineWithToggleCriteria(
  fieldCriteria: AppFilterCriterion[],
  toggles: Record<string, boolean>,
  operators?: AppFilterOperator[]
): AppFilterCriterion[] {
  const toggleCriteria = togglesToCriteria(toggles, operators);
  return [...fieldCriteria, ...toggleCriteria];
}
