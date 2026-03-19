import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  readonly appHasRole = input.required<string | string[]>();
  readonly appHasRoleRequireAll = input(false);

  private readonly hasAccess = computed(() => {
    const value = this.appHasRole();
    const requireAll = this.appHasRoleRequireAll();
    const roles = Array.isArray(value) ? value : [value];

    if (roles.length === 0) return true;

    return requireAll
      ? roles.every((r) => this.authService.hasRole(r)())
      : roles.some((r) => this.authService.hasRole(r)());
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
