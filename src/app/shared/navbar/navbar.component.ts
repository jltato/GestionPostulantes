import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationPopupComponent } from '../configuration-popup/configuration-popup.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule} from '@angular/material/tooltip';
import { ESTADOS_POSTULANTE } from '../enums/estados-postulantes';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterModule, MatMenuModule, MatIconModule, MatDialogModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  estados = ESTADOS_POSTULANTE;



  cambiarEstado(estadoId: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { est: estadoId },
      queryParamsHandling: 'merge',
    });
  }


  abrirConfiguracion() {
  const dialogRef = this.dialog.open(ConfigurationPopupComponent, {
    width: '1000px',
    data: { /* datos iniciales si necesitás */ },
    panelClass: 'custom-dialog-container'
  });

  // Esto escucha cuando el popup se cierra
  dialogRef.afterClosed().subscribe(result => {
    console.log('El popup se cerró, valor devuelto:', result);
  });
}
}
