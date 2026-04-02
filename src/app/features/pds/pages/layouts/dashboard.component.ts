import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="dashboard">
  <ng-template appSlot="header"><!-- Page title, breadcrumb, primary actions --></ng-template>
  <ng-template appSlot="left"><!-- Main content: tables, forms, primary views --></ng-template>
  <ng-template appSlot="right"><!-- Sidebar: filters, metadata, quick actions --></ng-template>
  <ng-template appSlot="footer"><!-- Footer: pagination, batch actions, status --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-dashboard-example',
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
      title="Dashboard Layout"
      description="Complex grid with a spanning header, two equal content areas, and a spanning footer. Best for admin dashboards combining overview metrics with action panels."
      preset="dashboard"
      [codeExample]="code">
      <app-page-layout preset="dashboard">
        <ng-template appSlot="header">
          <app-layout-zone-card zone="header" span="full" />
        </ng-template>
        <ng-template appSlot="left">
          <app-layout-zone-card zone="main" span="1/2" />
        </ng-template>
        <ng-template appSlot="right">
          <app-layout-zone-card zone="sidebar" span="1/2" />
        </ng-template>
        <ng-template appSlot="footer">
          <app-layout-zone-card zone="footer" span="full" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class DashboardExampleComponent {
  protected readonly code = CODE;
}
