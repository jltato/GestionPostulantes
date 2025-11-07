
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
  standalone: true
})
export class UnauthorizedComponent {
  private oidcSecurityService = inject(OidcSecurityService);
  userData$ = this.oidcSecurityService.userData$;
 
  logout(): void {
    this.oidcSecurityService.logoff().subscribe((result) => {
      console.log('Logout result:', result);
    });
  }
}

