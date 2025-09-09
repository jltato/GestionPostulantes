import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AlertComponent } from "./shared/alert/alert.component";
import { AlertService } from './Services/alert.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent  implements AfterViewInit {
   @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  title = 'GestionPostulantes';

   constructor(private alertService: AlertService) {}

   ngAfterViewInit(): void {
    this.alertService.register(this.alertComponent);
  }
}
