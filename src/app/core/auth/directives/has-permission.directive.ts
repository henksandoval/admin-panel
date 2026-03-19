import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  readonly appHasPermission = input.required<string | string[]>();
  readonly appHasPermissionRequireAll = input(false);

  private readonly hasAccess = computed(() => {
    const value = this.appHasPermission();
    const requireAll = this.appHasPermissionRequireAll();
    const permissions = Array.isArray(value) ? value : [value];

    if (permissions.length === 0) return true;

    return requireAll
      ? permissions.every((p) => this.authService.hasPermission(p)())
      : permissions.some((p) => this.authService.hasPermission(p)());
  });

  constructor() {
    effect(() => {
      if (this.hasAccess()) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
