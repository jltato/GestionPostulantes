import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {
  alertVisible = false;
  confirmVisible = false;
  title = '';
  message = '';
  private confirmResolver?: (value: boolean) => void;

  showAlert(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.alertVisible = true;
  }

  closeAlert() {
    this.alertVisible = false;
  }

  showConfirm(title: string, message: string): Promise<boolean> {
    this.title = title;
    this.message = message;
    this.confirmVisible = true;

    return new Promise((resolve) => {
      this.confirmResolver = resolve;
    });
  }

  confirm(result: boolean) {
    this.confirmVisible = false;
    this.confirmResolver?.(result);
  }
}

