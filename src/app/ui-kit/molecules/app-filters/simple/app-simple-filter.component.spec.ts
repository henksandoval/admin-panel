import { ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppSimpleFilterComponent } from './app-simple-filter.component';
import { AppFiltersConfig, AppFilterCriterion } from '../app-filter.model';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AppFormSelectStubComponent } from '@stubs/ui-kit/app-form-select.stub';
import { AppFormDatepickerStubComponent } from '@stubs/ui-kit/app-form-datepicker.stub';
import { AppFilterFooterStubComponent } from '@stubs/ui-kit/app-filter-footer.stub';

const DEBOUNCE_MS_DISABLED = 9999;

const TEXT_CONFIG: AppFiltersConfig = {
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'age', label: 'Age', type: 'number' },
  ],
  debounceMs: DEBOUNCE_MS_DISABLED,
};

const SELECT_CONFIG: AppFiltersConfig = {
  fields: [
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }] },
  ],
  debounceMs: DEBOUNCE_MS_DISABLED,
};

async function renderFilter(config: AppFiltersConfig, values: Record<string, unknown> = {}) {
  const criteriaChangeSpy = vi.fn<[AppFilterCriterion[]], void>();

  await render(AppSimpleFilterComponent, {
    componentInputs: { config, values },
    componentImports: [
      ReactiveFormsModule,
      AppFormInputStubComponent,
      AppFormSelectStubComponent,
      AppFormDatepickerStubComponent,
      AppFilterFooterStubComponent,
    ],
    on: { criteriaChange: criteriaChangeSpy },
  });

  return { criteriaChangeSpy };
}

describe('AppSimpleFilterComponent', () => {
  it('includes a reset option with null value as the first item in select field options', async () => {
    await renderFilter(SELECT_CONFIG);

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    expect(options).toHaveLength(2);
    expect(options[0].textContent?.trim()).toContain('-- All --');
  });

  it('emits only criteria for fields with non-empty values when the search button is clicked', async () => {
    const { criteriaChangeSpy } = await renderFilter(TEXT_CONFIG);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name'), 'Alice');
    criteriaChangeSpy.mockClear();

    await user.click(screen.getByTestId('filter-footer-search'));

    expect(criteriaChangeSpy).toHaveBeenCalledOnce();
    const [criteria] = criteriaChangeSpy.mock.calls[0];
    expect(criteria).toHaveLength(1);
    expect(criteria[0]).toMatchObject({ field: { key: 'name' }, value: 'Alice' });
  });

  it('uses the default operator for the field type when no defaultOperator is configured', async () => {
    const { criteriaChangeSpy } = await renderFilter(TEXT_CONFIG);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name'), 'Alice');
    criteriaChangeSpy.mockClear();

    await user.click(screen.getByTestId('filter-footer-search'));

    const [criteria] = criteriaChangeSpy.mock.calls[0];
    expect(criteria[0].operator.key).toBe('contains');
  });

  it('uses field.defaultOperator over the type-based default when explicitly configured', async () => {
    const config: AppFiltersConfig = {
      fields: [{ key: 'name', label: 'Name', type: 'text', defaultOperator: 'eq' }],
      debounceMs: DEBOUNCE_MS_DISABLED,
    };
    const { criteriaChangeSpy } = await renderFilter(config);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name'), 'Bob');
    criteriaChangeSpy.mockClear();

    await user.click(screen.getByTestId('filter-footer-search'));

    const [criteria] = criteriaChangeSpy.mock.calls[0];
    expect(criteria[0].operator.key).toBe('eq');
  });

  it('resets all field inputs and emits empty criteria when the clear button is clicked', async () => {
    const { criteriaChangeSpy } = await renderFilter(TEXT_CONFIG);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name'), 'Alice');
    criteriaChangeSpy.mockClear();

    await user.click(screen.getByTestId('filter-footer-clear'));

    expect(screen.getByTestId<HTMLInputElement>('name').value).toBe('');
    expect(criteriaChangeSpy).toHaveBeenCalledOnce();
    const [criteria] = criteriaChangeSpy.mock.calls[0];
    expect(criteria).toHaveLength(0);
  });

  it('includes toggle criteria in the emitted event after a toggle is changed to the false state', async () => {
    const config: AppFiltersConfig = {
      fields: [],
      toggles: [{ key: 'active', label: 'Active', value: true }],
      debounceMs: DEBOUNCE_MS_DISABLED,
    };
    const { criteriaChangeSpy } = await renderFilter(config);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('filter-toggle-active'));

    const callsAfterToggle = criteriaChangeSpy.mock.calls;
    const hasToggleCriterion = callsAfterToggle.some(call =>
      call[0].some((c: AppFilterCriterion) => c.field.key === 'active' && c.value === false)
    );
    expect(hasToggleCriterion).toBe(true);
  });
});
