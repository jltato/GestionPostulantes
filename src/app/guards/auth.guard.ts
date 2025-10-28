import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const oidcSecurityService = inject(OidcSecurityService);
  // const router = inject(Router);

  return oidcSecurityService.isAuthenticated$.pipe(
    take(1),
    map(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        // Guardar la URL a la que el usuario intentaba acceder
        sessionStorage.setItem('returnUrl', state.url);
        // Redirigir al Identity Server
        oidcSecurityService.authorize();
        return false;
      }
      return true;
    })
  );
};
