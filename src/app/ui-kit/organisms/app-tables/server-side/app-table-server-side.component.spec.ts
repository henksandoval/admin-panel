import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTableServerSideComponent } from './app-table-server-side.component';

type Row = { id: number; name: string };

const tableConfig = {
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ],
};

const makeCriterion = (field: string, value: string) => ({
  id: '1',
  field: { key: field, label: field, type: 'text' as const },
  operator: { key: 'eq', label: 'eq', symbol: '=', applicableTo: ['text' as const], requiresValue: true },
  value,
});

describe('AppTableServerSideComponent', () => {
  let fixture: ComponentFixture<AppTableServerSideComponent<Row>>;
  let component: AppTableServerSideComponent<Row>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTableServerSideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTableServerSideComponent<Row>);
    fixture.componentRef.setInput('tableConfig', tableConfig);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('currentParams', () => {
    it('reflects the current filters, sort, pageIndex and pageSize', () => {
      const params = component.currentParams();
      expect(params.filters).toEqual({});
      expect(params.sort).toEqual({ active: '', direction: '' });
      expect(params.pageIndex).toBe(0);
      expect(params.pageSize).toBe(10);
    });
  });

  describe('onFiltersChange', () => {
    it('converts criteria to values, resets pageIndex, and emits both filtersChange and paramsChange', () => {
      const filtersEmit = vi.spyOn(component.filtersChange, 'emit');
      const paramsEmit = vi.spyOn(component.paramsChange, 'emit');
      component.pageIndex.set(3);

      component.onFiltersChange([makeCriterion('name', 'Alice')]);

      expect(component.pageIndex()).toBe(0);
      expect(filtersEmit).toHaveBeenCalledWith({ name: 'Alice' });
      expect(paramsEmit).toHaveBeenCalledWith(expect.objectContaining({ filters: { name: 'Alice' }, pageIndex: 0 }));
    });

    it('does not reset pageIndex when resetPageOnFilter is false', () => {
      fixture.componentRef.setInput('resetPageOnFilter', false);
      component.pageIndex.set(3);

      component.onFiltersChange([makeCriterion('name', 'Bob')]);

      expect(component.pageIndex()).toBe(3);
    });
  });

  describe('onSortChange', () => {
    it('emits paramsChange with the updated sort', () => {
      const paramsEmit = vi.spyOn(component.paramsChange, 'emit');
      const sort = { active: 'name', direction: 'asc' as const };

      component.onSortChange(sort);

      expect(paramsEmit).toHaveBeenCalledWith(expect.objectContaining({ sort }));
    });
  });

  describe('onPageChange', () => {
    it('emits paramsChange with the updated pageIndex and pageSize', () => {
      const paramsEmit = vi.spyOn(component.paramsChange, 'emit');

      component.onPageChange({ pageIndex: 2, pageSize: 25, previousPageIndex: 0 });

      expect(paramsEmit).toHaveBeenCalledWith(expect.objectContaining({ pageIndex: 2, pageSize: 25 }));
    });
  });

  describe('skipBoundaryGuard', () => {
    it('returns true when totalItems is 0 (prevents premature page reset)', () => {
      fixture.componentRef.setInput('totalItems', 0);
      expect((component as any).skipBoundaryGuard()).toBe(true);
    });

    it('returns false when totalItems is greater than 0', () => {
      fixture.componentRef.setInput('totalItems', 50);
      expect((component as any).skipBoundaryGuard()).toBe(false);
    });
  });
});
