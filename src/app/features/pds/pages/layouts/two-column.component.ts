import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="twoColumn">
  <ng-template appSlot="left"><!-- Left column (1/2) --></ng-template>
  <ng-template appSlot="right"><!-- Right column (1/2) --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-two-column-example',
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
      title="Two Column Layout"
      description="Two equal content columns side by side. Best for comparisons, dual-panel interfaces, or content with equal visual weight that benefits from horizontal scanning."
      preset="twoColumn"
      [codeExample]="code">
      <app-page-layout preset="twoColumn">
        <ng-template appSlot="left">
          <app-layout-zone-card zone="column" span="1/2" />
        </ng-template>
        <ng-template appSlot="right">
          <app-layout-zone-card zone="column" span="1/2" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class TwoColumnExampleComponent {
  protected readonly code = CODE;
}
