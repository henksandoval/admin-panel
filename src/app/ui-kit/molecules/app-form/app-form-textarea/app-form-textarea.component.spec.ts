import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormTextareaComponent } from '@ui-molecules/app-form/app-form-textarea/app-form-textarea.component';

describe('AppFormTextareaComponent', () => {
  let fixture: ComponentFixture<AppFormTextareaComponent>;
  let component: AppFormTextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormTextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormTextareaComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the native textarea', () => {
    const control = new FormControl('Initial text content');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial text content');
  });

  it('TC-02 — updates the FormControl when the user types in the textarea', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const textareaEl = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    textareaEl.value = 'New textarea content';
    textareaEl.dispatchEvent(new Event('input'));

    expect(control.value).toBe('New textarea content');
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).not.toBeNull();
    expect(matError.nativeElement.textContent.trim()).toBe('This field is required');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'Description is required' } });
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError.nativeElement.textContent.trim()).toBe('Description is required');
  });

  it('TC-06 — disables the native textarea when the FormControl is disabled', () => {
    const control = new FormControl({ value: '', disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const textareaEl = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textareaEl.disabled).toBe(true);
  });

  it('TC-07 — isRequired is true and the textarea has required attribute when Validators.required is set', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);

    const textareaEl = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textareaEl.required).toBe(true);
  });

  it('TC-08 — does not show error while typing (dirty only), shows error after blur (touched)', () => {
    const control = new FormControl('', Validators.minLength(10));
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const textareaEl = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    textareaEl.value = 'short';
    textareaEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    let matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).toBeNull();

    control.markAsTouched();
    fixture.detectChanges();

    matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).not.toBeNull();
    expect(matError.nativeElement.textContent.trim()).toBe('The text is too short');
  });

  it('TC-09 — renders the label when provided in config', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { label: 'Description' });
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('mat-label'));
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent.trim()).toBe('Description');
  });

  it('TC-10 — renders the placeholder when provided in config', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { placeholder: 'Enter your description' });
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Enter your description');
  });

  it('TC-11 — renders the hint when provided in config', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { hint: 'Maximum 500 characters' });
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('mat-hint'));
    expect(hint).not.toBeNull();
    expect(hint.nativeElement.textContent.trim()).toBe('Maximum 500 characters');
  });

  it('TC-12 — renders the icon when provided in config', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { icon: 'description' });
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).not.toBeNull();
    expect(icon.nativeElement.textContent.trim()).toBe('description');
  });

  it('TC-13 — renders with default rows configuration', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textarea.rows).toBe(3);
  });

  it('TC-14 — renders with custom rows configuration', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { rows: 5 });
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });

  it('TC-15 — handles maxlength validation error message', () => {
    const control = new FormControl('', Validators.maxLength(20));
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.setValue('This is a very long text that exceeds the limit');
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).not.toBeNull();
    expect(matError.nativeElement.textContent.trim()).toBe('The text is too long');
  });
});

