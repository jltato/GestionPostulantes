import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-callback',
  imports: [],
  templateUrl: './logout-callback.component.html',
  styleUrl: './logout-callback.component.css'
})
export class LogoutCallbackComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Sesión cerrada correctamente');
    // Redirigir a la página principal después del logout
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 3000);
  }
}
