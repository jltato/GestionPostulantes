/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutHubService } from './logout-hub.service';
import { inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private oidcSecurityService = inject(OidcSecurityService);
  private logoutHubService = inject(LogoutHubService);
  private readonly STORAGE_KEY = '0-Postulantes';

   constructor() {
    this.oidcSecurityService.userData$.subscribe(user => {
      const userId = user?.userData?.sub;

      if (userId) {
        // iniciar conexión SignalR
        this.logoutHubService.startConnection(userId);

        // escuchar el logout remoto
        this.logoutHubService.logout$.subscribe(() => {
          console.log("Logout remoto → ejecutando logout local");
          this.logout();
        });
      }
    });
  }

  login() {
  return this.oidcSecurityService.authorizeWithPopUp().subscribe({
    next: (result) => {
      console.log("Login OK:", result);
    },
    error: (err) => {
      console.error("Error en login:", err);
      alert("Error en login: por favor, intente nuevamente, o comuníquese con un administrador.");
    }
  });
}
  
  logout() {
    this.logoutHubService.stopConnection();
    this.oidcSecurityService.logoffAndRevokeTokens().subscribe({
      next: () => console.log("Logout remoto OK"),
      error: (err) => console.error("ERROR logout remoto:", err)
    });
  }

  /**
   * Lee los datos del usuario desde sessionStorage
   * @returns Datos del usuario o null si no está autenticado
   */
  private getUserDataFromStorage(): any {
    const storageStr = sessionStorage.getItem(this.STORAGE_KEY);
    if (!storageStr) return null;
    
    try {
      const storage = JSON.parse(storageStr);
      return storage.userData;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los roles del usuario desde sessionStorage
   * @returns Array de roles o array vacío
   */
  private getRolesFromStorage(): string[] {
    const userData = this.getUserDataFromStorage();
    if (!userData?.role) return [];
    
    // El rol puede venir como string o array
    return Array.isArray(userData.role) ? userData.role : [userData.role];
  }

  /**
   * Verifica si el usuario está autorizado para esta aplicación (lee desde sessionStorage)
   * @returns Observable<boolean> true si está autorizado, false en caso contrario
   */
  isAppAuthorized$(): Observable<boolean> {
    const userData = this.getUserDataFromStorage();
    const appAuthorized = userData?.app_authorized;
    return of(appAuthorized === true || appAuthorized === 'true');
  }

  /**
   * Obtiene el estado de autenticación del usuario
   */
  isAuthenticated$() {
    return this.oidcSecurityService.isAuthenticated$;
  }

  /**
   * Obtiene los datos del usuario autenticado
   */
  getUserData$() {
    return this.oidcSecurityService.userData$;
  }

  /**
   * Verifica si el usuario tiene un rol específico (lee desde sessionStorage)
   * @param role Nombre del rol a verificar
   * @returns Observable<boolean> true si el usuario tiene el rol
   */
  hasRole$(role: string): Observable<boolean> {
    const roles = this.getRolesFromStorage();
    return of(roles.includes(role));
  }

  /**
   * Verifica si el usuario es de solo lectura
   * @returns Observable<boolean> true si el usuario tiene el rol "Solo Lectura"
   */
  isReadOnly$(): Observable<boolean> {
    return this.hasRole$('Solo Lectura');
  }

  /**
   * Verifica si el usuario es de Reconocimientos Medicos
   * @returns Observable<boolean> true si el usuario tiene el rol "Reconocimientos Medicos"
   */
  isReconocimientosMedicos$(): Observable<boolean> {
    return this.hasRole$('Reconocimientos Medicos');
  }

  /**
   * Obtiene el nombre completo del usuario desde sessionStorage
   * @returns Nombre completo del usuario o 'USUARIO' si no está disponible
   */
  getUserName(): string {
    const userData = this.getUserDataFromStorage();
    if (!userData) return 'USUARIO';
    
    const fullName = `${userData.given_name || ''} ${userData.family_name || ''}`.trim();
    return fullName ? fullName.toUpperCase() : userData.name?.toUpperCase() || 'USUARIO';
  }

  /**
   * Obtiene todos los roles del usuario
   * @returns Array de roles
   */
  getRoles(): string[] {
    return this.getRolesFromStorage();
  }

    /**
   * Devuelve el userId (claim 'sub' o 'nameidentifier')
   */
  getUserId(): string | null {
    const userData = this.getUserDataFromStorage();
    if (!userData) return null;

    // identityserver suele guardar el subject en 'sub'
    // angular-auth-oidc-client a veces lo guarda como nameidentifier
    return userData.sub || userData.nameidentifier || null;
  }
}
