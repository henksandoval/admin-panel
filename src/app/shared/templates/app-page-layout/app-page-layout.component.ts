import { AfterContentInit, Component, computed, ContentChildren, input, QueryList, signal } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GridCell, GridConfig, LAYOUT_PRESETS, LayoutConfig, LayoutPreset } from './app-page-layout.model';
import { AppSlotContainerDirective } from './app-slot-container.directive';
import { AppBreadCrumbComponent } from "@shared/molecules/app-bread-crumb/app-bread-crumb.component";

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    MatIconModule,
    AppBreadCrumbComponent
  ],
  template: `
    <app-bread-crumb></app-bread-crumb>
    <div class="page-grid" [class]="resolvedConfig().grid.gridClass ?? ''">
      @for (cell of resolvedConfig().cells; track cell.slotId) {
        <div
          class="grid-cell"
          [class]="cell.cellClass">

          @if (getSlotTemplate(cell.slotId); as template) {
            <ng-container *ngTemplateOutlet="template"></ng-container>
          } @else if (showEmptySlots()) {
            <div class="empty-slot">
              <span>{{ cell.slotId }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './app-page-layout.component.scss'
})
export class AppPageLayoutComponent implements AfterContentInit {
  readonly preset = input<LayoutPreset | null>(null);
  readonly layoutConfig = input<LayoutConfig | null>(null);
  readonly gridConfig = input<GridConfig | null>(null);
  readonly cells = input<GridCell[]>([]);
  readonly showEmptySlots = input<boolean>(false);
  readonly resolvedConfig = computed<LayoutConfig>(() => {
    const config = this.layoutConfig();
    if (config) return config;

    const presetKey = this.preset();
    if (presetKey && LAYOUT_PRESETS[presetKey]) {
      return LAYOUT_PRESETS[presetKey];
    }

    const grid = this.gridConfig();
    const cells = this.cells();
    if (grid && cells.length > 0) {
      return { grid, cells };
    }

    return LAYOUT_PRESETS.fullWidth;
  });
  @ContentChildren(AppSlotContainerDirective)
  private slotDirectives!: QueryList<AppSlotContainerDirective>;
  private readonly slotsMap = signal<Map<string, AppSlotContainerDirective>>(new Map());

  ngAfterContentInit(): void {
    this.updateSlotsMap();
    this.slotDirectives.changes.subscribe(() => this.updateSlotsMap());
  }

  getSlotTemplate(slotId: string) {
    return this.slotsMap().get(slotId)?.templateRef ?? null;
  }

  private updateSlotsMap(): void {
    const map = new Map<string, AppSlotContainerDirective>();
    this.slotDirectives.forEach(slot => {
      map.set(slot.slotName, slot);
    });
    this.slotsMap.set(map);
  }
}
