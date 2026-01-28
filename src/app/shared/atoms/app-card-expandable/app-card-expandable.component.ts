import { Component, input, model, contentChild, Directive, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import {MatDivider} from '@angular/material/list';

@Directive({ selector: '[slot=header-actions]', standalone: true })
export class CardHeaderActionsDirective {}

@Directive({ selector: '[slot=footer]', standalone: true })
export class CardFooterActionsDirective {}

@Component({
  selector: 'app-card-expandable',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatDivider],
  template: `
    <mat-accordion displayMode="flat">
      <mat-expansion-panel
        [expanded]="expanded()"
        (opened)="expanded.set(true)"
        (closed)="expanded.set(false)"
        [disabled]="!isExpandable()"
        [class]="variantClass()"
        [ngClass]="customClass()"
        hideToggle
      >
        @if (hasHeader()) {
          <mat-expansion-panel-header>
            <div class="panel-header-content">
              <div class="flex items-center gap-2">
                @if (icon()) {
                  <mat-icon class="text-base">{{ icon() }}</mat-icon>
                }
                @if (title()) {
                  <span class="font-semibold text-sm tracking-wide title-text">
                  {{ title() }}
                </span>
                }
              </div>

              <div class="flex items-center gap-2">
                <ng-content select="[slot=header-actions]"></ng-content>
                @if (isExpandable()) {
                  <mat-icon class="toggle-icon" [class.rotated]="expanded()">
                    expand_more
                  </mat-icon>
                }
              </div>
            </div>
          </mat-expansion-panel-header>
        }

        @if (hasHeader()) {
          <mat-divider></mat-divider>
        }

        <div class="mt-4">
            <ng-content></ng-content>
        </div>

        @if (hasFooter()) {
          <ng-content select="[slot=footer]"></ng-content>
        }
      </mat-expansion-panel>
    </mat-accordion>
  `,
  host: { class: 'block' },
  styles: `
    mat-expansion-panel {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      position: relative;
      border-style: solid;
      border-width: 0;
      background-color: var(--mat-card-elevated-container-color, var(--mat-sys-surface-container-low));
      border-color: var(--mat-card-elevated-container-color, var(--mat-sys-surface-container-low));
      border-radius: var(--mat-card-elevated-container-shape, var(--mat-sys-corner-medium));
      box-shadow: var(--mat-card-elevated-container-elevation, var(--mat-sys-level1));
      transition: all 0.2s ease-in-out;
      overflow: hidden;
    }

    .mat-expansion-panel-header.mat-expanded {
      height: var(--mat-expansion-header-expanded-state-height, 52px);
    }

    .panel-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    mat-icon {
      color: var(--mat-sys-primary);
    }

    .toggle-icon {
      color: var(--mat-sys-on-surface-variant);
      transition: transform 0.3s ease;
    }

    .toggle-icon.rotated {
      transform: rotate(180deg);
    }
  `
})
export class AppCardExpandableComponent {
  title = input<string>();
  icon = input<string>();
  variant = input<'outlined' | 'raised'>('outlined');
  customClass = input<string>('');

  isExpandable = input<boolean>(true);
  expanded = model<boolean>(true);

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
