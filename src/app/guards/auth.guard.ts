import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return oidcSecurityService.isAuthenticated$.pipe(
    take(1),
    switchMap(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        // Guardar la URL a la que el usuario intentaba acceder
        sessionStorage.setItem('returnUrl', state.url);
        // Redirigir al Identity Server
        oidcSecurityService.authorize();
        return of(false);
      }
      
      // Obtener userData para verificar autorización
      return oidcSecurityService.userData$.pipe(
        take(1),
        map(userData => {
          // Verificar si el usuario está autorizado para esta aplicación
          const appAuthorized = userData?.userData.app_authorized;
          if (appAuthorized === false || appAuthorized === 'false') {
            router.navigate(['/unauthorized']);
            return false;
          }
          
          return true;
        })
      );
    })
  );
};
