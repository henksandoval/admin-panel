import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  AppPageLayoutComponent, AppSlotContainerDirective, LayoutPreset, GridCell, GridConfig, LayoutConfig 
} from "@shared/templates/app-page-layout/app-page-layout.component";

@Component({
  selector: 'pds-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    AppPageLayoutComponent
],
  template: `
    <app-page-layout
      [title]="title()"
      [description]="description()"
      [componentTag]="componentTag()"
      [backRoute]="backRoute()"
      [showBackButton]="showBackButton()"
      [preset]="preset()"
      [layoutConfig]="layoutConfig()"
      [gridConfig]="gridConfig()"
      [cells]="cells()"
      [showEmptySlots]="showEmptySlots()">
      
      <!-- Re-proyectar todos los slots -->
      @for (slot of slotDirectives; track slot.slotName) {
        <ng-template [appSlot]="slot.slotName">
          <ng-container *ngTemplateOutlet="slot.templateRef"></ng-container>
        </ng-template>
      }
      
    </app-page-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PdsPageLayoutComponent implements AfterContentInit {

  // =============== INPUTS HEREDADOS DE APP-PAGE-LAYOUT ===============
  
  // Header inputs
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly componentTag = input<string>('');
  readonly showBackButton = input<boolean>(true);

  // Layout inputs
  readonly preset = input<LayoutPreset | null>(null);
  readonly layoutConfig = input<LayoutConfig | null>(null);
  readonly gridConfig = input<GridConfig | null>(null);
  readonly cells = input<GridCell[]>([]);
  readonly showEmptySlots = input<boolean>(false);

  // =============== INPUTS ESPECÍFICOS DE PDS ===============
  
  // Valores por defecto específicos de PDS
  readonly backRoute = input<string>('/pds/index');

  // =============== CONTENT PROJECTION ===============
  
  @ContentChildren(AppSlotContainerDirective, { descendants: true })
  slotDirectives!: QueryList<AppSlotContainerDirective>;

  ngAfterContentInit(): void {
    // Los slots ya están disponibles via slotDirectives
  }
}