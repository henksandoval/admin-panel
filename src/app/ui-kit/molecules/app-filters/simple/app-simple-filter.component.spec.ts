import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppSimpleFilterComponent } from './app-simple-filter.component';
import { AppFiltersConfig } from '../app-filter.model';

const config: AppFiltersConfig = {
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'age', label: 'Age', type: 'number' },
  ],
};

describe('AppSimpleFilterComponent', () => {
  let fixture: ComponentFixture<AppSimpleFilterComponent>;
  let component: AppSimpleFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSimpleFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSimpleFilterComponent);
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges(); // triggers ngOnInit → initializeForm
    component = fixture.componentInstance;
  });

  describe('getSelectOptions', () => {
    it('prepends a null reset option to the provided options', () => {
      const options = component.getSelectOptions({ options: [{ value: 'a', label: 'A' }] });
      expect(options[0].value).toBeNull();
      expect(options[0].label).toBe('-- Todos --');
      expect(options.length).toBe(2);
    });
  });

  describe('emitSearch', () => {
    it('emits only criteria for non-empty form values using the default operator by type', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      component.getControl('name').setValue('Alice');
      component.getControl('age').setValue(null); // empty — should be excluded

      component.emitSearch();

      expect(emitSpy).toHaveBeenCalledOnce();
      const [criteria] = emitSpy.mock.calls[0];
      expect(criteria).toHaveLength(1);
      expect(criteria[0]).toMatchObject({
        field: { key: 'name' },
        operator: { key: 'contains' }, // DEFAULT_OPERATOR_BY_TYPE for 'text'
        value: 'Alice',
      });
    });

    it('uses field.defaultOperator when provided, overriding the type default', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      fixture.componentRef.setInput('config', {
        fields: [{ key: 'name', label: 'Name', type: 'text', defaultOperator: 'eq' }],
      });
      fixture.detectChanges();
      component.getControl('name').setValue('Bob');

      component.emitSearch();

      const [criteria] = emitSpy.mock.calls[0];
      expect(criteria[0].operator.key).toBe('eq');
    });
  });

  describe('clearAllCriteria', () => {
    it('resets form controls and emits empty criteria', () => {
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');
      component.getControl('name').setValue('Alice');

      component.clearAllCriteria();

      expect(component.getControl('name').value).toBeNull();
      expect(emitSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('onToggleChange', () => {
    it('updates currentToggles and includes toggle criteria in the next emit', () => {
      const configWithToggles: AppFiltersConfig = {
        fields: [],
        toggles: [{ key: 'active', label: 'Active', value: false }],
      };
      fixture.componentRef.setInput('config', configWithToggles);
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.criteriaChange, 'emit');

      // togglesToCriteria emits a criterion only when toggle value is false
      component.onToggleChange({ active: false });

      const [criteria] = emitSpy.mock.calls[0];
      expect(criteria.some(c => c.field.key === 'active' && c.value === false)).toBe(true);
    });
  });
});
