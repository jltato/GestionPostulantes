/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-auth-callback',
  imports:[],
  standalone: true,
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(private router: Router, private oidcSecurityService: OidcSecurityService) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe({
      next: (result) => {
        if (result.isAuthenticated) {
          console.log('Usuario autenticado:', result.userData);
          // Redirigir a la página principal o la ruta guardada
          const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
          sessionStorage.removeItem('returnUrl');
          this.router.navigateByUrl(returnUrl);
        } else {
          console.warn('Autenticación fallida');
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        console.error('Error procesando callback de autenticación:', err);
        this.router.navigate(['/home']);
      }
    });
  }
}
