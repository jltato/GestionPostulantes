
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-identity-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
      <div style="text-align: center;">
        <div *ngIf="checking" style="margin-bottom: 20px;">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <p>{{ message }}</p>
      </div>
    </div>
  `,
})
export class IdentityRedirectComponent implements OnInit {
  checking = true;
  message = 'Verificando sesión...';

  constructor(
    private router: Router,
    private oidcSecurityService: OidcSecurityService
  ) {}

  ngOnInit(): void {
    // Verificar si hay una sesión activa en el Identity Server
    this.oidcSecurityService.checkAuth().subscribe({
      next: (result) => {
        if (result.isAuthenticated) {
          // Usuario autenticado, verificar autorización de la app
          const appAuthorized = result.userData?.app_authorized;
          
          if (appAuthorized === false || appAuthorized === 'false') {
            this.message = 'No autorizado para esta aplicación';
            this.checking = false;
            setTimeout(() => {
              this.router.navigate(['/unauthorized']);
            }, 1000);
            return;
          }
          
          // Usuario autenticado y autorizado
          this.message = 'Redirigiendo...';
          const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
          sessionStorage.removeItem('returnUrl');
          this.router.navigateByUrl(returnUrl);
        } else {
          // No hay sesión activa, redirigir a login
          this.message = 'Redirigiendo a login...';
          this.checking = false;
          this.oidcSecurityService.authorize();
        }
      },
      error: (err) => {
        console.error('Error verificando autenticación:', err);
        this.message = 'Error verificando sesión';
        this.checking = false;
        // Intentar login
        setTimeout(() => {
          this.oidcSecurityService.authorize();
        }, 2000);
      }
    });
  }
}
