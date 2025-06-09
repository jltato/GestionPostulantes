import { Injectable } from '@angular/core';
import { AlertComponent } from '../shared/alert/alert.component';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertComponent!: AlertComponent;

  register(component: AlertComponent) {
    this.alertComponent = component;
  }

  alert(title: string, message: string) {
    this.alertComponent.showAlert(title, message);
  }

  confirm(title: string, message: string): Promise<boolean> {
    return this.alertComponent.showConfirm(title, message);
  }
}
