import { Component, input, model, contentChild, Directive, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Directive({ selector: '[slot=header-actions]', standalone: true })
export class AppCardHeaderActionsDirective {}

@Directive({ selector: '[slot=footer]', standalone: true })
export class AppCardFooterActionsDirective {}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatDivider],
  template: `
    <mat-accordion displayMode="flat">
      <mat-expansion-panel
        [expanded]="expanded()"
        (opened)="expanded.set(true)"
        (closed)="expanded.set(false)"
        [disabled]="!isExpandable()"
        [ngClass]="panelClass()"
        hideToggle
      >
        @if (hasHeader()) {
          <mat-expansion-panel-header>
            <div class="panel-header-content">
              <div class="panel-header-left">
                @if (icon()) {
                  <mat-icon class="panel-header-icon">{{ icon() }}</mat-icon>
                }
                @if (title()) {
                  <span class="panel-header-title">{{ title() }}</span>
                }
              </div>

              <div class="panel-header-right">
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

        <div class="panel-body">
          <ng-content></ng-content>
        </div>

        @if (hasFooter()) {
          <ng-content select="[slot=footer]"></ng-content>
        }
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styleUrl: './app-card.component.scss'
})
export class AppCardComponent {
  title = input<string>();
  icon = input<string>();
  variant = input<'outlined' | 'raised'>('outlined');
  customClass = input<string>('');

  isExpandable = input<boolean>(false);
  expanded = model<boolean>(true);

  headerActions = contentChild(AppCardHeaderActionsDirective);
  footerContent = contentChild(AppCardFooterActionsDirective);

  hasHeader = computed(() => {
    return Boolean(this.title()) || Boolean(this.icon()) || Boolean(this.headerActions());
  });

  hasFooter = computed(() => Boolean(this.footerContent()));

  panelClass = computed(() => {
    const variant = this.variant() === 'outlined' ? 'mat-mdc-card-outlined' : '';
    const custom = this.customClass();
    return [variant, custom].filter(Boolean).join(' ');
  });
}