import { AppFilterCriterion, AppFilterValue } from "./app-filter.model";

export function evaluateCriteria<T extends Record<string, any>>(
  data: T[],
  criteria: AppFilterCriterion[]
): T[] {
  if (!criteria.length) return data;
  return data.filter(item => criteria.every(c => evaluateOne(item, c)));
}

function evaluateOne<T extends Record<string, any>>(
  item: T,
  criterion: AppFilterCriterion
): boolean {
  const raw = item[criterion.field.key];
  const target = criterion.value;
  const op = criterion.operator.key;

  if (op === 'is_null') {
    return raw === null || raw === undefined || raw === '';
  }
  if (op === 'is_not_null') {
    return raw !== null && raw !== undefined && raw !== '';
  }

  if (raw === null || raw === undefined) return false;

  switch (op) {
    case 'eq':
      return looseEquals(raw, target);
    case 'neq':
      return !looseEquals(raw, target);
    case 'contains':
      return normalizeString(raw).includes(normalizeString(target));
    case 'not_contains':
      return !normalizeString(raw).includes(normalizeString(target));
    case 'starts_with':
      return normalizeString(raw).startsWith(normalizeString(target));
    case 'ends_with':
      return normalizeString(raw).endsWith(normalizeString(target));
    case 'gt':
      return compareValues(raw, target) > 0;
    case 'gte':
      return compareValues(raw, target) >= 0;
    case 'lt':
      return compareValues(raw, target) < 0;
    case 'lte':
      return compareValues(raw, target) <= 0;
    default:
      return true;
  }
}

function normalizeString(value: unknown): string {
  return String(value ?? '').toLowerCase().trim();
}

function looseEquals(a: unknown, b: AppFilterValue): boolean {
  if (a instanceof Date && (b instanceof Date || typeof b === 'string')) {
    const bDate = b instanceof Date ? b : new Date(b);
    return a.getTime() === bDate.getTime();
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return String(a) === String(b);
  }
  return normalizeString(a) === normalizeString(b);
}

function compareValues(a: unknown, b: AppFilterValue): number {
  if (a instanceof Date) {
    const bTime = b instanceof Date ? b.getTime() : new Date(b as string).getTime();
    return a.getTime() - bTime;
  }
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return normalizeString(a).localeCompare(normalizeString(b));
}