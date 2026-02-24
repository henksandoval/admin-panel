import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTableClientSideComponent } from './app-table-client-side.component';
import { AppFilterCriterion } from '@ui-molecules/app-filters/app-filter.model';

type Row = { id: number; name: string };

const tableConfig = {
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ],
};

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const containsCriterion = (field: string, value: string): AppFilterCriterion => ({
  id: '1',
  field: { key: field, label: field, type: 'text' },
  operator: { key: 'contains', label: 'contains', symbol: '~', applicableTo: ['text'], requiresValue: true },
  value,
});

describe('AppTableClientSideComponent', () => {
  let fixture: ComponentFixture<AppTableClientSideComponent<Row>>;
  let component: AppTableClientSideComponent<Row>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTableClientSideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTableClientSideComponent<Row>);
    fixture.componentRef.setInput('tableConfig', tableConfig);
    fixture.componentRef.setInput('data', rows);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('displayData', () => {
    it('returns all data when showPagination is false', () => {
      fixture.componentRef.setInput('showPagination', false);
      expect(component.displayData()).toEqual(rows);
    });

    it('slices data according to pageIndex and pageSize', () => {
      fixture.componentRef.setInput('showPagination', true);
      component.pageSize.set(2);
      component.pageIndex.set(1);
      expect(component.displayData()).toEqual([rows[2]]);
    });
  });

  describe('filtering', () => {
    it('filters data using the default evaluateCriteria when no filterFn is provided', () => {
      component.onFiltersChange([containsCriterion('name', 'li')]);
      // Alice (ali) and Charlie (li) match
      expect(component.displayData()).toEqual([rows[0], rows[2]]);
    });

    it('uses a custom filterFn when provided', () => {
      const customFn = (data: Row[]) => data.filter(r => r.id === 2);
      fixture.componentRef.setInput('filterFn', customFn);
      component.onFiltersChange([containsCriterion('name', 'anything')]);
      expect(component.displayData()).toEqual([rows[1]]);
    });
  });

  describe('onFiltersChange', () => {
    it('resets pageIndex to 0 and emits filtersChange when resetPageOnFilter is true', () => {
      const emitSpy = vi.spyOn(component.filtersChange, 'emit');
      component.pageIndex.set(2);
      const criteria = [containsCriterion('name', 'Alice')];

      component.onFiltersChange(criteria);

      expect(component.pageIndex()).toBe(0);
      expect(emitSpy).toHaveBeenCalledWith(criteria);
    });

    it('does not reset pageIndex when resetPageOnFilter is false', () => {
      fixture.componentRef.setInput('resetPageOnFilter', false);
      component.pageIndex.set(2);

      component.onFiltersChange([containsCriterion('name', 'Alice')]);

      expect(component.pageIndex()).toBe(2);
    });
  });

  describe('totalItemCount', () => {
    it('reflects the count of filtered data, not the raw input', () => {
      component.onFiltersChange([containsCriterion('name', 'li')]);
      // Alice + Charlie = 2
      expect(component.paginationState().totalItems).toBe(2);
    });
  });
});
