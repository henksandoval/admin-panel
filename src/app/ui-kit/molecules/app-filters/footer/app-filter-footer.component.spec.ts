import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppFilterFooterComponent } from './app-filter-footer.component';

const toggles = [
  { key: 'active', label: 'Active', value: true },
  { key: 'archived', label: 'Archived', value: false },
];

describe('AppFilterFooterComponent', () => {
  let fixture: ComponentFixture<AppFilterFooterComponent>;
  let component: AppFilterFooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFilterFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFilterFooterComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('showFooter', () => {
    it('is true by default because showClearButton and showSearchButton default to true', () => {
      expect(component.showFooter()).toBe(true);
    });

    it('is false when all visibility options are off and no toggles', () => {
      fixture.componentRef.setInput('showClearButton', false);
      fixture.componentRef.setInput('showSearchButton', false);
      expect(component.showFooter()).toBe(false);
    });

    it('is true when buttons are hidden but toggles are present', () => {
      fixture.componentRef.setInput('showClearButton', false);
      fixture.componentRef.setInput('showSearchButton', false);
      fixture.componentRef.setInput('toggles', toggles);
      expect(component.showFooter()).toBe(true);
    });
  });

  describe('onToggleChange', () => {
    it('updates the correct toggle and emits the full record', () => {
      fixture.componentRef.setInput('toggles', toggles);
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.toggleChange, 'emit');

      component.onToggleChange('active', false);

      expect(component.internalToggles().find(t => t.key === 'active')!.value).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ active: false, archived: false }));
    });
  });

  describe('outputs', () => {
    it('emits clearClick when onClear is called', () => {
      const emitSpy = vi.spyOn(component.clearClick, 'emit');
      component.onClear();
      expect(emitSpy).toHaveBeenCalledOnce();
    });

    it('emits searchClick when onSearch is called', () => {
      const emitSpy = vi.spyOn(component.searchClick, 'emit');
      component.onSearch();
      expect(emitSpy).toHaveBeenCalledOnce();
    });
  });
});
