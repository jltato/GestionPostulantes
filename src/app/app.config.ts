import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule, LogLevel, authInterceptor  } from 'angular-auth-oidc-client';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(withInterceptors([authInterceptor()])),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      AuthModule.forRoot({
        config: {
          authority: environment.authUrl,
          authWellknownEndpointUrl: `${environment.authUrl}/.well-known/openid-configuration`,
          clientId: 'Postulantes',
          redirectUrl: window.location.origin + '/auth-callback',
          postLogoutRedirectUri: window.location.origin + '/logout-callback',
          scope: 'openid profile email offline_access',
          responseType: 'code',
          useRefreshToken: true,
          silentRenew: true,
          autoCleanStateAfterAuthentication: true,
          logLevel: LogLevel.Debug,
          secureRoutes: []
        },
      })
    ),
  ],
};


