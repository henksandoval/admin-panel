import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '@core/auth/services';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  readonly appHasRole = input.required<string | string[]>();
  readonly appHasRoleRequireAll = input(false);
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);
  private readonly hasAccess = computed(() => {
    const value = this.appHasRole();
    const requireAll = this.appHasRoleRequireAll();
    const roles = Array.isArray(value) ? value : [value];

    if (roles.length === 0) return true;

    const userRoles = this.authService.currentUser()?.roles ?? [];
    return requireAll
      ? roles.every((r) => userRoles.includes(r))
      : roles.some((r) => userRoles.includes(r));
  });

  constructor() {
    effect(() => {
      if (this.hasAccess()) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else if (this.viewContainer.length > 0) {
        this.viewContainer.clear();
      }
    });
  }
}
