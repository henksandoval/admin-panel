import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  styles: `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
    }
  `,
  template: `
    <div class="flex h-full w-full items-center justify-center p-6">
      <router-outlet />
    </div>
  `,
})
export class AuthLayoutComponent {}

