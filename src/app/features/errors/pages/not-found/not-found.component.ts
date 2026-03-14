import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  styles: `
    .app-not-found-container {
      text-align: center;
      max-width: 500px;
    }

    .app-not-found-code {
      font-size: 8rem;
      font-weight: 300;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .app-not-found-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      margin: 0 auto 2rem;
    }
  `,
  template: `
    <div class="app-not-found-container">
      <div class="app-not-found-code">404</div>
      <mat-icon class="app-not-found-icon" color="primary">search_off</mat-icon>
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
export class NotFoundComponent {
  protected readonly pageTitle = $localize`:NotFound|Page title@@errors.notfound.title:Page not found`;
  protected readonly pageDescription = $localize`:NotFound|Page description@@errors.notfound.description:The page you are looking for does not exist or has been moved`;
  protected readonly returnButtonText = $localize`:NotFound|Return button@@errors.notfound.button:Return to dashboard`;
}
