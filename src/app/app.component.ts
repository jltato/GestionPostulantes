import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AlertComponent } from "./shared/alert/alert.component";
import { AlertService } from './Services/alert.service';
import { LogoutHubService } from './Services/logout-hub.service';
import { AuthServiceService } from './Services/auth-service.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent  implements AfterViewInit, OnDestroy {
   @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  title = 'GestionPostulantes';

   constructor(
    private alertService: AlertService,
    private logoutHub: LogoutHubService,
    private authService: AuthServiceService
   ) {}

   ngoninit(): void {
    this.authService.isAppAuthorized$().subscribe(isAuthorized => {
      if (isAuthorized) {
        const userId=this.authService.getUserId();
        if (userId) {
          this.logoutHub.startConnection(userId);
        }
      }
    });
   }

   ngAfterViewInit(): void {
    this.alertService.register(this.alertComponent);
  }

  ngOnDestroy(): void {
    this.logoutHub.stopConnection();
  }
}

