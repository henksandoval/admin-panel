import { defaultTableSort, calcLastPage } from './app-table.utils';

describe('defaultTableSort', () => {
  it('places null values at the end regardless of sort direction', () => {
    const data = [
      { name: 'Bob', age: null },
      { name: 'Alice', age: 25 },
    ] as unknown as { name: string; age: number }[];

    const asc = defaultTableSort(data, { active: 'age', direction: 'asc' });
    expect(asc[asc.length - 1].name).toBe('Bob');

    const desc = defaultTableSort(data, { active: 'age', direction: 'desc' });
    expect(desc[desc.length - 1].name).toBe('Bob');
  });

  it('does not mutate the original array', () => {
    const data = [{ name: 'Charlie' }, { name: 'Alice' }];
    const original = [...data];
    defaultTableSort(data, { active: 'name', direction: 'asc' });
    expect(data).toEqual(original);
  });
});

describe('calcLastPage', () => {
  it('returns 0 when there are no items', () => {
    expect(calcLastPage(0, 10)).toBe(0);
  });
});


