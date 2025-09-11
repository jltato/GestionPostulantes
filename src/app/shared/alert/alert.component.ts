/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const bootstrap: any;
@Component({
  selector: 'app-alert',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {


  @ViewChild('modal') modal!: ElementRef;
  @ViewChild('confirmModal') confirmModal!: ElementRef;
  alertVisible = false;
  confirmVisible = false;
  title = '';
  message = '';
  private alertModalInstance: any;
  private confirmModalInstance: any;

  private confirmResolver?: (value: boolean) => void;

  showAlert(title: string, message: string) {
    this.title = title;
    this.message = message;

    if (!this.alertModalInstance) {
      this.alertModalInstance = new bootstrap.Modal(this.modal.nativeElement);
    }

    this.alertModalInstance.show();
  }

  closeAlert() {
    this.alertModalInstance?.hide();
  }

  // showConfirm(title: string, message: string): Promise<boolean> {
  //   this.title = title;
  //   this.message = message;
  //   this.confirmVisible = true;

  //   return new Promise((resolve) => {
  //     this.confirmResolver = resolve;
  //   });
  // }

  // confirm(result: boolean) {
  //   this.confirmVisible = false;
  //   this.confirmResolver?.(result);
  // }

  showConfirm(title: string, message: string): Promise<boolean> {
  this.title = title;
  this.message = message;

  if (!this.confirmModalInstance) {
    this.confirmModalInstance = new bootstrap.Modal(this.confirmModal.nativeElement);
  }
  this.confirmModalInstance.show();

  return new Promise(resolve => {
    this.confirmResolver = resolve;
  });
}

confirm(result: boolean) {
  this.confirmModalInstance?.hide();
  this.confirmResolver?.(result);
}
}

