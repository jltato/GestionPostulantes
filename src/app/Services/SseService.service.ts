// sse.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SseService implements OnDestroy {
  private evtSource?: EventSource;

  constructor(private oidc: OidcSecurityService, private router: Router) {}

  start(userId: string) {
    if (!userId) return;

    const url = `${environment.authUrl}/connect/logout/${encodeURIComponent(userId)}`;
    //const url = `${window.location.origin.replace(window.location.port, '5001')}/sse/logout/${encodeURIComponent(userId)}`;
    // Ajusta origin si IdentityServer corre en otro puerto
    this.evtSource = new EventSource(url, { withCredentials: true });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.evtSource.addEventListener('logout', (e: MessageEvent) => {
      // El servidor envía 'forced' u otro payload
      // Hacemos logoff local
      this.oidc.logoffLocal();          
      this.router.navigate(['/index']);
    });

    this.evtSource.onerror = (err) => {
      // manejar reconexión si querés
      console.warn('SSE error', err);
    };
  }

  stop() {
    this.evtSource?.close();
    this.evtSource = undefined;
  }

  ngOnDestroy() {
    this.stop();
  }
}