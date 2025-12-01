import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoutHubService {

  private hubConnection!: signalR.HubConnection;
  
  private logoutSubject = new Subject<void>();
  logout$ = this.logoutSubject.asObservable();   // <-- se usa afuera

  startConnection(userId: string): void {
    const url = `${environment.authUrl}/logoutHub`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('Conectado al LogoutHub'))
      .catch(err => console.error('Error al conectar:', err));

    this.hubConnection.on("OnUserLoggedOut", (data) => {
      console.log("Logout remoto recibido:", data);

      if (data?.userId === userId) {
        console.log("Coincide userId → avisando logout...");
        this.logoutSubject.next();          // <-- avisar al que lo use
      }
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}

