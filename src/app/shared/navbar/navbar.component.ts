import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationPopupComponent } from '../configuration-popup/configuration-popup.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule} from '@angular/material/tooltip';
import { ESTADOS_POSTULANTE } from '../enums/estados-postulantes';
import { AuthServiceService } from '../../Services/auth-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterModule, MatMenuModule, MatIconModule, MatDialogModule, MatTooltipModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isAuthenticated$!: Observable<boolean>;
  userName = 'USUARIO';
  identityUrl = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authService: AuthServiceService,
    private oidcSecurityService: OidcSecurityService
  ) {}

  estados = ESTADOS_POSTULANTE;

  ngOnInit(): void {
    // Verificar autenticación en TODAS las rutas excepto los callbacks
    if (!window.location.pathname.includes('auth-callback') && 
        !window.location.pathname.includes('logout-callback')) {
      this.oidcSecurityService.checkAuth().subscribe();
    }
    
    this.isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => isAuthenticated)
    );
   
    this.loadUserName();
    
    // Actualizar cuando cambie la autenticación
    this.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        // Pequeno delay para asegurar que userData este en sessionStorage
        setTimeout(() => this.loadUserName(), 300);
      } else {
        this.userName = 'USUARIO';
      }
    });
  }

  loadUserName(): void {
    const storageStr = sessionStorage.getItem('0-Postulantes');
    
    if (storageStr) {
      try {
        const storage = JSON.parse(storageStr);
        const userData = storage.userData;
        
        if (userData) {
          const fullName = `${userData.given_name || ''} ${userData.family_name || ''}`.trim();
          this.userName = fullName ? fullName.toUpperCase() : 'USUARIO';
          // Construir URL hacia el servidor de identidad si existe el id (sub)
          if (userData.sub) {
            const base = (environment.authUrl || '').replace(/\/+$/, '');
            this.identityUrl = `${base}/Identity/Account/Manage/details?id=${userData.sub}`;
          } else {
            this.identityUrl = '';
          }
        } else {
          this.userName = 'USUARIO';
          this.identityUrl = '';
        }
      } catch {
        this.userName = 'USUARIO';
        this.identityUrl = '';
      }
    } else {
      this.userName = 'USUARIO';
      this.identityUrl = '';
    }
  }
  
  cambiarEstado(estadoId: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { est: estadoId },
      queryParamsHandling: 'merge',
    });
  }


  abrirConfiguracion() {
    const dialogRef = this.dialog.open(ConfigurationPopupComponent, {
      width: '1400px',
      height: '600px',
      panelClass: 'custom-dialog-container'
    });

    // Esto escucha cuando el popup se cierra
    dialogRef.afterClosed().subscribe(result => {
      console.log('El popup se cerró, valor devuelto:', result);
    });
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
