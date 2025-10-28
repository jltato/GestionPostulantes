import { inject, Injectable } from '@angular/core';
import { OidcSecurityService,  } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  // constructor() { }
private oidcSecurityService = inject(OidcSecurityService);

 login() {
    this.oidcSecurityService.authorize();
  }
  
  logout() {
    this.oidcSecurityService.logoff().subscribe((result) => {
      console.log('Logout result:', result);
    });
  }
}
