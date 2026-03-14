import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-unauthorized-container max-w-md mx-auto py-12" data-testid="unauthorized-page">
      <div class="text-center">
        <mat-icon class="app-unauthorized-icon inline-block mb-4" color="warn">lock</mat-icon>
        <p class="app-unauthorized-code mat-display-medium">{{ pageCode }}</p>
        <h1 class="mat-headline-large">{{ pageTitle }}</h1>
        <p class="mat-body-medium mt-4 text-gray-600">{{ pageDescription }}</p>
        <div class="mt-8">
          <a mat-raised-button color="primary" routerLink="/dashboard">
            {{ returnButtonText }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .app-unauthorized-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
  `,
})
export class UnauthorizedComponent {
  protected readonly pageCode = '403';
  protected readonly pageTitle = $localize`:Unauthorized|Page title@@errors.unauthorized.title:Access denied`;
  protected readonly pageDescription = $localize`:Unauthorized|Page description@@errors.unauthorized.description:You do not have permission to access this resource`;
  protected readonly returnButtonText = $localize`:Unauthorized|Return button@@errors.unauthorized.button:Return to dashboard`;
}
