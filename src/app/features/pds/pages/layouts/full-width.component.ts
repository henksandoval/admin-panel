import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="fullWidth">
  <ng-template appSlot="content"><!-- Full-width content: tables, maps, rich views --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-full-width-example',
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
      title="Full Width Layout"
      description="Single full-width content area with no column restrictions. Best for data-heavy views like large tables, maps, or dashboards that need all available horizontal space."
      preset="fullWidth"
      [codeExample]="code">
      <app-page-layout preset="fullWidth">
        <ng-template appSlot="content">
          <app-layout-zone-card zone="content" span="full" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class FullWidthExampleComponent {
  protected readonly code = CODE;
}
