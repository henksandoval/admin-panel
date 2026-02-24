import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { BADGE_DEFAULTS, BadgeColor, BadgePosition, BadgeSize, BadgeVariant } from './app-badge.model';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, MatBadgeModule],
  template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>

    @if (variant() === 'inline') {
      <span
        [class]="inlineClasses()"
        [attr.aria-label]="ariaLabel()">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </span>
    } @else {
      <div
        [matBadge]="content()"
        [matBadgeColor]="overlayColor()"
        [matBadgePosition]="position()"
        [matBadgeSize]="matBadgeSize()"
        [matBadgeOverlap]="overlap()"
        [matBadgeHidden]="hidden()"
        [attr.aria-label]="ariaLabel()">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </div>
    }
  `,
  styleUrls: ['./app-badge.component.scss']
})
export class AppBadgeComponent {
  readonly variant = input<BadgeVariant>(BADGE_DEFAULTS.variant);
  readonly color = input<BadgeColor>(BADGE_DEFAULTS.inlineColor);
  readonly size = input<BadgeSize>(BADGE_DEFAULTS.size);
  readonly ariaLabel = input<string>();

  readonly hasIndicator = input<boolean>(false);

  readonly content = input<string | number>(BADGE_DEFAULTS.content);
  readonly position = input<BadgePosition>(BADGE_DEFAULTS.position);
  readonly overlap = input<boolean>(true);
  readonly hidden = input<boolean>(false);

  readonly inlineClasses = computed(() => {
    const classes: string[] = ['app-badge'];

    classes.push(this.color());

    if (this.hasIndicator()) {
      classes.push('has-indicator');
    }

    if (this.size() !== BADGE_DEFAULTS.size) {
      classes.push(`badge-size-${this.size()}`);
    }

    return classes.join(' ');
  });

  readonly overlayColor = computed(() => {
    const color = this.color();
    if (color === 'primary' || color === 'accent' || color === 'warn') {
      return color;
    }
    return 'primary';
  });

  readonly matBadgeSize = computed(() => {
    const size = this.size();
    if (size === BADGE_DEFAULTS.size) {
      return BADGE_DEFAULTS.size;
    }
    return size;
  });
}
