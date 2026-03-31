import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'mat-sidenav-container',
  standalone: true,
  template: '<ng-content />',
})
export class MatSidenavContainerStubComponent {}

@Component({
  selector: 'mat-sidenav',
  standalone: true,
  template: `
    <ng-content />
    <button data-testid="sidenav-close-trigger" (click)="closedStart.emit()"></button>
  `,
})
export class MatSidenavStubComponent {
  readonly opened = input<boolean>(false);
  @Output() readonly closedStart = new EventEmitter<void>();
}

@Component({
  selector: 'mat-sidenav-content',
  standalone: true,
  template: '<ng-content />',
})
export class MatSidenavContentStubComponent {}
