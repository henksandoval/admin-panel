import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-critical-errors-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-error-wrapper" [attr.data-testid]="dataTestId()">
      <div class="app-error-container">
        <div class="text-center">
          <mat-icon [class]="iconClass()" [color]="iconColor()">
            {{ icon() }}
          </mat-icon>
          <p class="app-error-code mat-display-medium">{{ pageCode() }}</p>
          <h1 class="mat-headline-large">{{ pageTitle() }}</h1>
          <p class="mat-body-medium mt-4">{{ pageDescription() }}</p>
          <div class="mt-8">
            <a 
              mat-raised-button 
              color="primary" 
              [routerLink]="buttonRoute()"
              [attr.data-testid]="dataTestId() + '-cta'">
              {{ buttonText() }}
            </a>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './critical-errors-page.component.scss',
})
export class CriticalErrorsPageComponent {
  icon = input.required<string>();
  iconColor = input.required<'primary' | 'warn' | 'accent'>();
  iconClass = input.required<string>();
  pageCode = input.required<string>();
  pageTitle = input.required<string>();
  pageDescription = input.required<string>();
  buttonText = input.required<string>();
  buttonRoute = input.required<string>();
  dataTestId = input.required<string>();
}
