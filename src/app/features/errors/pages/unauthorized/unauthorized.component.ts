import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  styles: `
    .app-unauthorized-container {
      text-align: center;
      max-width: 500px;
    }

    .app-unauthorized-code {
      font-size: 8rem;
      font-weight: 300;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .app-unauthorized-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      margin: 0 auto 2rem;
    }
  `,
  template: `
    <div class="app-unauthorized-container">
      <div class="app-unauthorized-code">403</div>
      <mat-icon class="app-unauthorized-icon" color="warn">lock</mat-icon>
      <h1 class="mat-headline-large">{{ pageTitle }}</h1>
      <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
      <div class="mt-8 flex gap-4 justify-center">
        <a mat-raised-button color="primary" routerLink="/dashboard">
          {{ returnButtonText }}
        </a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  protected readonly pageTitle = $localize`:Unauthorized|Page title@@errors.unauthorized.title:Access denied`;
  protected readonly pageDescription = $localize`:Unauthorized|Page description@@errors.unauthorized.description:You do not have permission to access this resource`;
  protected readonly returnButtonText = $localize`:Unauthorized|Return button@@errors.unauthorized.button:Return to dashboard`;
}
