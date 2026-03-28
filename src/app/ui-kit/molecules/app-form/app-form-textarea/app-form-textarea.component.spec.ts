import { FormControl, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppFormTextareaComponent } from './app-form-textarea.component';
import { AppFormTextareaNewOptions } from './app-form-textarea.model';

const TEST_ID = 'form-textarea';

async function renderComponent(control: FormControl<string>, config?: AppFormTextareaNewOptions) {
  await render(AppFormTextareaComponent, {
    componentInputs: {
      control,
      testId: TEST_ID,
      ...(config !== undefined ? { config } : {}),
    },
  });
  return { textarea: screen.getByTestId<HTMLTextAreaElement>(TEST_ID) };
}

describe('AppFormTextareaComponent', () => {
  it('renders the initial FormControl value in the native textarea', async () => {
    const { textarea } = await renderComponent(new FormControl('Initial text content'));

    expect(textarea.value).toBe('Initial text content');
  });

  it('updates the FormControl when the user types in the textarea', async () => {
    const control = new FormControl('');
    const { textarea } = await renderComponent(control);
    const user = userEvent.setup();

    await user.type(textarea, 'New textarea content');

    expect(control.value).toBe('New textarea content');
  });

  it('shows error when the control is invalid and has been touched', async () => {
    const { textarea } = await renderComponent(new FormControl('', Validators.required));
    const user = userEvent.setup();

    await user.click(textarea);
    await user.tab();

    expect(screen.getByTestId(`${TEST_ID}-error`).textContent?.trim()).toBe('This field is required');
  });

  it('does not show error when the control is invalid but untouched', async () => {
    await renderComponent(new FormControl('', Validators.required));

    expect(screen.queryByTestId(`${TEST_ID}-error`)).toBeNull();
  });

  it('overrides the default error message with config errorMessages', async () => {
    const { textarea } = await renderComponent(
      new FormControl('', Validators.required),
      { errorMessages: { required: 'Description is required' } },
    );
    const user = userEvent.setup();

    await user.click(textarea);
    await user.tab();

    expect(screen.getByTestId(`${TEST_ID}-error`).textContent?.trim()).toBe('Description is required');
  });

  it('disables the native textarea when the FormControl is disabled', async () => {
    const { textarea } = await renderComponent(new FormControl({ value: '', disabled: true }));

    expect(textarea.disabled).toBe(true);
  });

  it('adds required attribute to the textarea when Validators.required is set', async () => {
    const { textarea } = await renderComponent(new FormControl('', Validators.required));

    expect(textarea.required).toBe(true);
  });

  it('does not show error while typing (dirty only), shows error after blur (touched)', async () => {
    const { textarea } = await renderComponent(new FormControl('', Validators.minLength(10)));
    const user = userEvent.setup();

    await user.type(textarea, 'short');
    expect(screen.queryByTestId(`${TEST_ID}-error`)).toBeNull();

    await user.tab();
    expect(screen.getByTestId(`${TEST_ID}-error`).textContent?.trim()).toBe('The text is too short');
  });

  it('renders the label when provided in config', async () => {
    await renderComponent(new FormControl(''), { label: 'Description' });

    expect(screen.getByTestId(`${TEST_ID}-label`).textContent?.trim()).toBe('Description');
  });

  it('renders the placeholder when provided in config', async () => {
    const { textarea } = await renderComponent(new FormControl(''), { placeholder: 'Enter your description' });

    expect(textarea.placeholder).toBe('Enter your description');
  });

  it('renders the hint when provided in config', async () => {
    await renderComponent(new FormControl(''), { hint: 'Maximum 500 characters' });

    expect(screen.getByTestId(`${TEST_ID}-hint`).textContent?.trim()).toBe('Maximum 500 characters');
  });

  it('renders the icon when provided in config', async () => {
    await renderComponent(new FormControl(''), { icon: 'description' });

    expect(screen.getByTestId(`${TEST_ID}-icon`).textContent?.trim()).toBe('description');
  });

  it('renders with default rows configuration', async () => {
    const { textarea } = await renderComponent(new FormControl(''));

    expect(textarea.rows).toBe(3);
  });

  it('renders with custom rows configuration', async () => {
    const { textarea } = await renderComponent(new FormControl(''), { rows: 5 });

    expect(textarea.rows).toBe(5);
  });

  it('shows maxlength error when text exceeds the limit and control is touched', async () => {
    const { textarea } = await renderComponent(new FormControl('', Validators.maxLength(20)));
    const user = userEvent.setup();

    await user.type(textarea, 'This is a very long text that exceeds the limit');
    await user.tab();

    expect(screen.getByTestId(`${TEST_ID}-error`).textContent?.trim()).toBe('The text is too long');
  });
});
