import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppAdvancedFilterComponent } from './app-advanced-filter.component';
import { AppFiltersConfig, AppFilterCriterion } from '../app-filter.model';

const nameField = { key: 'name', label: 'Name', type: 'text' as const };
const ageField  = { key: 'age',  label: 'Age',  type: 'number' as const };

const config: AppFiltersConfig = {
  fields: [nameField, ageField],
};

const makeCriterion = (id: string): AppFilterCriterion => ({
  id,
  field: nameField,
  operator: { key: 'contains', label: 'Contiene', symbol: '∋', applicableTo: ['text'], requiresValue: true },
  value: 'Alice',
});

describe('AppAdvancedFilterComponent', () => {
  let fixture: ComponentFixture<AppAdvancedFilterComponent>;
  let component: AppAdvancedFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAdvancedFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppAdvancedFilterComponent);
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('operatorOptions', () => {
    it('returns only operators applicable to the selected field type', () => {
      component.builderForm.controls.field.setValue('name'); // text
      fixture.detectChanges();

      const keys = component.operatorOptions().map(o => o.value);
      expect(keys).toContain('contains');
      expect(keys).not.toContain('gt'); // 'gt' is not applicable to text
    });
  });

  describe('canAddCriterion', () => {
    it('is false when no field or operator is selected', () => {
      expect(component.canAddCriterion()).toBe(false);
    });

    it('is false when operator requiresValue but value is empty', () => {
      component.builderForm.setValue({ field: 'name', operator: 'contains', value: '' });
      expect(component.canAddCriterion()).toBe(false);
    });

    it('is true when operator requiresValue and value is set', () => {
      component.builderForm.setValue({ field: 'name', operator: 'contains', value: 'Alice' });
      expect(component.canAddCriterion()).toBe(true);
    });

    it('is true when operator does not requireValue even with empty value', () => {
      component.builderForm.setValue({ field: 'name', operator: 'is_null', value: '' });
      expect(component.canAddCriterion()).toBe(true);
    });
  });

  describe('addCriterion', () => {
    it('adds a criterion, resets the form, and emits criteriaChange', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      component.builderForm.setValue({ field: 'name', operator: 'contains', value: 'Alice' });

      component.addCriterion();

      expect(component.criteria().length).toBe(1);
      expect(component.criteria()[0]).toMatchObject({ field: nameField, value: 'Alice' });
      expect(component.builderForm.controls.value.value).toBe('');
      expect(emitSpy).toHaveBeenCalledOnce();
    });

    it('does not add beyond maxCriteria', () => {
      fixture.componentRef.setInput('config', { ...config, maxCriteria: 1 });
      component.criteria.set([makeCriterion('existing')]);
      component.builderForm.setValue({ field: 'name', operator: 'contains', value: 'Bob' });

      component.addCriterion();

      expect(component.criteria().length).toBe(1);
    });
  });

  describe('removeCriterion', () => {
    it('removes only the criterion with the matching id and emits', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      component.criteria.set([makeCriterion('a'), makeCriterion('b')]);

      component.removeCriterion('a');

      expect(component.criteria().map(c => c.id)).toEqual(['b']);
      expect(emitSpy).toHaveBeenCalledOnce();
    });
  });

  describe('clearAllCriteria', () => {
    it('empties criteria and emits an empty array when no toggles are active', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      component.criteria.set([makeCriterion('a')]);

      component.clearAllCriteria();

      expect(component.criteria()).toEqual([]);
      expect(emitSpy).toHaveBeenCalledWith([]);
    });
  });
});
