import { Component, computed, contentChild, Directive, input, model } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Directive({ selector: '[appSlotHeaderActions]', standalone: true })
export class AppCardHeaderActionsDirective {}

@Directive({ selector: '[appSlotFooter]', standalone: true })
export class AppCardFooterActionsDirective {}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatIcon, MatDivider],
  template: `
    <mat-accordion displayMode="flat">
      <mat-expansion-panel
        data-testid="app-card-panel"
        [expanded]="expanded()"
        (opened)="expanded.set(true)"
        (closed)="expanded.set(false)"
        [disabled]="!isExpandable()"
        [ngClass]="panelClass()"
        hideToggle
      >
        @if (hasHeader()) {
          <mat-expansion-panel-header data-testid="app-card-header">
            <div class="panel-header-content">
              <div class="panel-header-left">
                @if (icon()) {
                  <mat-icon class="panel-header-icon" data-testid="app-card-icon">{{ icon() }}</mat-icon>
                }
                @if (title()) {
                  <span class="panel-header-title mat-label-large" data-testid="app-card-title">{{ title() }}</span>
                }
              </div>

              <div class="panel-header-right">
                <ng-content select="[slot=header-actions]"></ng-content>
                @if (isExpandable()) {
                  <mat-icon class="toggle-icon" [class.rotated]="expanded()" data-testid="app-card-toggle-icon">
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

        <div class="panel-body" data-testid="app-card-body">
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
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly variant = input<'outlined' | 'raised'>('outlined');
  readonly customClass = input<string>('');

  readonly isExpandable = input<boolean>(false);
  readonly expanded = model<boolean>(true);

  readonly headerActions = contentChild(AppCardHeaderActionsDirective);
  readonly footerContent = contentChild(AppCardFooterActionsDirective);

  protected readonly hasHeader = computed(() => {
    return Boolean(this.title()) || Boolean(this.icon()) || Boolean(this.headerActions());
  });

  protected readonly hasFooter = computed(() => Boolean(this.footerContent()));

  protected readonly panelClass = computed(() => {
    const variant = this.variant() === 'outlined' ? 'mat-mdc-card-outlined' : '';
    const custom = this.customClass();
    return [variant, custom].filter(Boolean).join(' ');
  });
}
