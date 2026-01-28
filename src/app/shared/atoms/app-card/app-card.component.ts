import { Component, input, computed, contentChild, ElementRef, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Directive({ selector: '[slot=header-actions]', standalone: true })
export class CardHeaderActionsDirective {}

@Directive({ selector: '[slot=footer]', standalone: true })
export class CardFooterActionsDirective {}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card [class]="variantClass()" [ngClass]="customClass()">
      @if (hasHeader()) {
        <mat-card-header>
          <div class="flex items-center gap-2">
            @if (icon()) {
              <mat-icon class="text-base">{{ icon() }}</mat-icon>
            }
            @if (title()) {
              <mat-card-title class="font-semibold text-sm tracking-wide">
                {{ title() }}
              </mat-card-title>
            }
          </div>
          <ng-content select="[slot=header-actions]"></ng-content>
        </mat-card-header>
      }

      <mat-card-content [class]="contentPadding()">
        <ng-content></ng-content>
      </mat-card-content>

      @if (hasFooter()) {
        <mat-card-footer>
          <ng-content select="[slot=footer]"></ng-content>
        </mat-card-footer>
      }
    </mat-card>
  `,
  host: { class: 'block' },
  styles: `
    mat-card-header {
      background-color: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      padding: 0.75rem;
    }

    mat-card-content {
      padding: 1rem;
      color: var(--mat-sys-on-surface-variant);
    }

    mat-card-title {
      color: var(--mat-sys-on-surface);
    }

    mat-icon {
      color: var(--mat-sys-primary);
    }

    mat-card-footer {
      padding: 0.75rem;
    }
  `
})
export class AppCardComponent {
  title = input<string>();
  icon = input<string>();
  variant = input<'outlined' | 'raised'>('outlined');
  contentPadding = input<string>('p-6');
  customClass = input<string>('');

  headerActions = contentChild(CardHeaderActionsDirective);
  footerContent = contentChild(CardFooterActionsDirective);

  hasHeader = computed(() => {
    const titleIsPresent = Boolean(this.title());
    const iconIsPresent = Boolean(this.icon());
    const actionsArePresent = Boolean(this.headerActions());

    return titleIsPresent || iconIsPresent || actionsArePresent;
  });

  hasFooter = computed(() => Boolean(this.footerContent()));

  variantClass = computed(() => this.variant() === 'outlined' ? 'mat-mdc-card-outlined' : '');
}
