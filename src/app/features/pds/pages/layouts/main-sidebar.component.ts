import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="mainWithSidebar">
  <ng-template appSlot="main"><!-- Main content (2/3): tables, forms, primary views --></ng-template>
  <ng-template appSlot="sidebar"><!-- Sidebar (1/3): filters, metadata, quick actions --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-main-sidebar-example',
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
      title="Main + Sidebar Layout"
      description="Two-column layout with a dominant main area (2/3) and a narrower sidebar (1/3). Best for content views that need contextual information, filters, or detail panels alongside primary content."
      preset="mainWithSidebar"
      [codeExample]="code">
      <app-page-layout preset="mainWithSidebar">
        <ng-template appSlot="main">
          <app-layout-zone-card zone="main" span="2/3" />
        </ng-template>
        <ng-template appSlot="sidebar">
          <app-layout-zone-card zone="sidebar" span="1/3" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class MainSidebarExampleComponent {
  protected readonly code = CODE;
}
