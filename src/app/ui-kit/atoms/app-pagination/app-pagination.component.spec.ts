import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppPaginationComponent } from './app-pagination.component';

const defaultState = { pageIndex: 0, pageSize: 10, totalItems: 100 };

describe('AppPaginationComponent', () => {
  let fixture: ComponentFixture<AppPaginationComponent>;
  let component: AppPaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppPaginationComponent);
    fixture.componentRef.setInput('state', defaultState);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('rangeLabel', () => {
    it('returns 0 de 0 when totalItems is 0', () => {
      fixture.componentRef.setInput('state', { pageIndex: 0, pageSize: 10, totalItems: 0 });
      expect(component.rangeLabel()).toBe('0 de 0');
    });

    it('calculates the correct range for a middle page', () => {
      fixture.componentRef.setInput('state', { pageIndex: 1, pageSize: 10, totalItems: 100 });
      expect(component.rangeLabel()).toBe('11 - 20 de 100');
    });

    it('clamps end index to totalItems on the last page', () => {
      fixture.componentRef.setInput('state', { pageIndex: 2, pageSize: 10, totalItems: 25 });
      expect(component.rangeLabel()).toBe('21 - 25 de 25');
    });
  });

  describe('isFirstPage / isLastPage', () => {
    it('is first page when pageIndex is 0, last page when pageIndex equals totalPages - 1', () => {
      expect(component.isFirstPage()).toBe(true);
      expect(component.isLastPage()).toBe(false);

      fixture.componentRef.setInput('state', { pageIndex: 9, pageSize: 10, totalItems: 100 });
      expect(component.isFirstPage()).toBe(false);
      expect(component.isLastPage()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('emits correct pageChange event on goToNextPage and goToPreviousPage', () => {
      const emitSpy = vi.spyOn(component.pageChange, 'emit');

      component.goToNextPage();
      expect(emitSpy).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10, previousPageIndex: 0 });

      fixture.componentRef.setInput('state', { pageIndex: 1, pageSize: 10, totalItems: 100 });
      component.goToPreviousPage();
      expect(emitSpy).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 10, previousPageIndex: 1 });
    });

    it('does not emit when already on the first or last page', () => {
      const emitSpy = vi.spyOn(component.pageChange, 'emit');

      component.goToPreviousPage();
      component.goToFirstPage();
      expect(emitSpy).not.toHaveBeenCalled();

      fixture.componentRef.setInput('state', { pageIndex: 9, pageSize: 10, totalItems: 100 });
      component.goToNextPage();
      component.goToLastPage();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onPageSizeChange', () => {
    it('recalculates pageIndex to keep the current first item visible', () => {
      fixture.componentRef.setInput('state', { pageIndex: 2, pageSize: 10, totalItems: 100 });
      const emitSpy = vi.spyOn(component.pageChange, 'emit');

      component.onPageSizeChange(25);

      // First item on page 2 (index 2) with size 10 is item 20 → floor(20/25) = 0
      expect(emitSpy).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 25, previousPageIndex: 2 });
    });
  });
});
