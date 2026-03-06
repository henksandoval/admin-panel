import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToastContainerComponent } from './ui-kit/organisms/app-toast-container/app-toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToastContainerComponent],
  template: `<router-outlet></router-outlet><app-toast-container></app-toast-container>`,
})
export class App {
}
