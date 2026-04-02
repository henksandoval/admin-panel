import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  LAYOUT_ZONE_CARD_DEFAULTS,
  ZONE_CONFIGS,
  ZONE_SPAN_LABELS,
  ZoneSpan,
  ZoneType,
} from './layout-zone-card.model';

@Component({
  selector: 'app-layout-zone-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './layout-zone-card.component.html',
  styleUrl: './layout-zone-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutZoneCardComponent {
  readonly zone = input.required<ZoneType>();
  readonly span = input<ZoneSpan>(LAYOUT_ZONE_CARD_DEFAULTS.span);

  protected readonly config = computed(() => ZONE_CONFIGS[this.zone()]);

  protected readonly zoneModifierClass = computed(
    () => `app-layout-zone-card--${this.zone()}`,
  );

  protected readonly spanLabel = computed(() => ZONE_SPAN_LABELS[this.span()]);
}
