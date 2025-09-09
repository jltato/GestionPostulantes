import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import {  MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuration-popup',
  imports: [MatListModule, MatExpansionModule, CommonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
  standalone:true,
  templateUrl: './configuration-popup.component.html',
  styleUrl: './configuration-popup.component.css'
})
export class ConfigurationPopupComponent {

   // Sección seleccionada
  selectedSection = 'cadetes';

  // Menú expandido
  expandedMenu: string | null = null;

   form = {
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  };

   constructor(
    private dialogRef: MatDialogRef<ConfigurationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {}

  cerrar() {
    this.dialogRef.close(); // opcionalmente podés pasar un valor: this.dialogRef.close('cerrado');
  }

toggleSubmenu(menu: string) {
  this.expandedMenu = this.expandedMenu === menu ? null : menu;
}

selectSection(section: string) {
  this.selectedSection = section;
}


}
