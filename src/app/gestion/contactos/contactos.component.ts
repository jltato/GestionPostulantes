
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-contactos',
  imports: [CommonModule, MatIcon, ReactiveFormsModule],
  templateUrl: './contactos.component.html',
  styleUrl: './contactos.component.css',
  standalone:true,
})

export class ContactoComponent {
  @Input() contactos: Contacto[] = [];
  @Input() habilitado = false;
  @Input() postulanteId = 0;
  @Output() contactosChange = new EventEmitter<Contacto[]>();

  @ViewChild('telefonoInput') telefonoInput!: ElementRef;


  showForm = false;
  editIndex: number | null = null;

   private fb = inject(FormBuilder);

  contactoForm: FormGroup = this.fb.group({
    telefono: [''],
    perteneciente: ['']
  });


  agregarContacto() {
  if (this.contactoForm.valid) {
    const formValue = this.contactoForm.value;

    if (this.editIndex !== null) {
      const original = this.contactos[this.editIndex];
      this.contactos[this.editIndex] = {
        ...formValue,
        contactoId: original.contactoId,
        postulanteId: original.postulanteId || this.postulanteId
      };
      this.editIndex = null;
    } else {
      this.contactos.push({
        ...formValue,
        contactoId: 0,
        postulanteId: this.postulanteId
      });
    }

      this.contactosChange.emit(this.contactos);
      this.contactoForm.reset();
      this.showForm = false;
    }
  }

   eliminarContacto(contactoId: number) {
  const index = this.contactos.findIndex(c => c.contactoId === contactoId);
  if (index !== -1) {
    this.contactos.splice(index, 1);
    this.contactosChange.emit(this.contactos);
  }
}

editarContacto(contactoId: number) {
  const index = this.contactos.findIndex(c => c.contactoId === contactoId);
  if (index !== -1) {
    this.contactoForm.setValue({
      telefono: this.contactos[index].telefono,
      perteneciente: this.contactos[index].perteneciente
    });
    this.editIndex = index;
    this.showForm = true;
    if (this.showForm) {
    setTimeout(() => this.telefonoInput.nativeElement.focus());
  }
  }
}

  toggleForm() {
    this.showForm = !this.showForm;
    this.editIndex = null;
    this.contactoForm.reset();
  if (this.showForm) {
    setTimeout(() => this.telefonoInput.nativeElement.focus());
  }
  }
}

export interface Contacto {
  telefono: string;
  perteneciente: string;
  contactoId: number;
  postulanteId: number;

}
