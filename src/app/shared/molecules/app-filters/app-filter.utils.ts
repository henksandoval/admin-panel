import { AppFilterCriterion, AppFilterToggle } from './app-filter.model';

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
