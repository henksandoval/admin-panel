import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-not-found-container max-w-md mx-auto py-12" data-testid="not-found-page">
      <div class="text-center">
        <mat-icon class="app-not-found-icon inline-block mb-4" color="primary">search_off</mat-icon>
        <p class="app-not-found-code mat-display-medium">{{ pageCode }}</p>
        <h1 class="mat-headline-large">{{ pageTitle }}</h1>
        <p class="mat-body-medium mt-4 text-gray-600">{{ pageDescription }}</p>
        <div class="mt-8">
          <a mat-raised-button color="primary" routerLink="/dashboard" data-testid="not-found-cta">
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

    .app-not-found-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
  `,
})
export class NotFoundComponent {
  protected readonly pageCode = '404';
  protected readonly pageTitle = $localize`:NotFound|Page title@@errors.notfound.title:Page not found`;
  protected readonly pageDescription = $localize`:NotFound|Page description@@errors.notfound.description:The page you are looking for does not exist or has been moved`;
  protected readonly returnButtonText = $localize`:NotFound|Return button@@errors.notfound.button:Return to dashboard`;
}
