import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="sidebarWithMain">
  <ng-template appSlot="sidebar"><!-- Sidebar (1/3): navigation, filters, context --></ng-template>
  <ng-template appSlot="main"><!-- Main content (2/3): primary views, tables, forms --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-sidebar-main-example',
  standalone: true,
  imports: [
    AppPageLayoutComponent,
    AppSlotContainerDirective,
    LayoutZoneCardComponent,
    PdsLayoutShowcaseComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pds-layout-showcase
      title="Sidebar + Main Layout"
      description="Two-column layout leading with a sidebar (1/3) followed by a dominant main area (2/3). Same proportions as Main + Sidebar but leads with secondary navigation or contextual controls on the left."
      preset="sidebarWithMain"
      [codeExample]="code">
      <app-page-layout preset="sidebarWithMain">
        <ng-template appSlot="sidebar">
          <app-layout-zone-card zone="sidebar" span="1/3" />
        </ng-template>
        <ng-template appSlot="main">
          <app-layout-zone-card zone="main" span="2/3" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class SidebarMainExampleComponent {
  protected readonly code = CODE;
}
