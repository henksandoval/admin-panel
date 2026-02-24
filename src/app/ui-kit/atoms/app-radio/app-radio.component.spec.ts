import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppRadioComponent } from './app-radio.component';

describe('AppRadioComponent', () => {
  let fixture: ComponentFixture<AppRadioComponent>;
  let component: AppRadioComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRadioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppRadioComponent);
    fixture.componentRef.setInput('value', 'option1');
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('creates with default values', () => {
    expect(component.disabled()).toBe(false);
    expect(component.ariaLabel()).toBe('');
  });

  it('renders a mat-radio-button in the DOM', () => {
    expect(fixture.debugElement.query(By.css('mat-radio-button'))).toBeTruthy();
  });

  it('disables the radio button when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type=radio]'));
    expect(input.nativeElement.disabled).toBe(true);
  });
});
