import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-errors-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-error-wrapper" [attr.data-testid]="dataTestId">
      <div class="app-error-container">
        <div class="text-center">
          <mat-icon [class]="iconClass" [color]="iconColor">
            {{ icon }}
          </mat-icon>
          <h1 class="mat-headline-large">{{ pageTitle }}</h1>
          <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
          <div class="mt-8">
            <a 
              mat-raised-button 
              color="primary" 
              [routerLink]="buttonRoute"
              [attr.data-testid]="dataTestId + '-cta'">
              {{ buttonText }}
            </a>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './errors-page.component.scss',
})
export class ErrorsPageComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) iconColor!: 'primary' | 'warn' | 'accent';
  @Input({ required: true }) iconClass!: string;
  @Input({ required: true }) pageTitle!: string;
  @Input({ required: true }) pageDescription!: string;
  @Input({ required: true }) buttonText!: string;
  @Input({ required: true }) buttonRoute!: string;
  @Input({ required: true }) dataTestId!: string;
}
