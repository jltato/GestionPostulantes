/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SseService } from '../Services/SseService.service';

@Component({
  selector: 'app-auth-callback',
  imports:[],
  standalone: true,
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(private router: Router, private oidcSecurityService: OidcSecurityService, private sse: SseService) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe({
      next: (result) => {
        if (result.isAuthenticated) {
          console.log('Usuario autenticado:', result.userData);
          const userId = result.userData?.sub;
          this.sse.start(userId);

          // Verificar si el usuario está autorizado para esta aplicación
          const appAuthorized = result.userData?.app_authorized;
          
          if (appAuthorized === false || appAuthorized === 'false') {
            // Usuario autenticado pero no autorizado para esta aplicación
            sessionStorage.setItem('app_unauthorized', 'true');
            this.router.navigate(['/unauthorized']);
            return;
          }
          
          // Usuario autenticado y autorizado
          sessionStorage.removeItem('app_unauthorized');
          const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
          sessionStorage.removeItem('returnUrl');
          this.router.navigateByUrl(returnUrl);
        }         
        else if (!result.isAuthenticated) {
          console.log(result.errorMessage?.toString());
        }
        else 
         {console.warn('Autenticación fallida');
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        // Detectar error específico de desincronización de reloj
        const errorStr = err?.toString() || '';
        if (errorStr.includes('iat rejected') && errorStr.includes('id_token was issued too far away from the current time')) {
          console.error('Error de autenticación: El reloj del sistema está desincronizado.',
            'Por favor, sincronice el reloj del sistema con un servidor NTP.');
        } else {
          console.error('Error procesando callback de autenticación:', err);
        }
        this.router.navigate(['/home']);
      }
    });
  }
}
