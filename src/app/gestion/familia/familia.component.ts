import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-familiar',
  templateUrl: './familia.component.html',
  imports: [CommonModule, MatIcon, ReactiveFormsModule],
  standalone: true,
})

export class FamiliarComponent implements OnInit {
  @Input() familiares: Familiar[] = [];
  @Input() parentescos: parentesco[] = [];
  @Input() postulanteId!: number;
  @Input() habilitado = false;
  @Input() isReadOnly = false;

  @Output() familiaresChange = new EventEmitter<Familiar[]>();

  fb =inject(FormBuilder);
  familiarForm!: FormGroup;
  editIndex: number | null = null;
  showForm = false;

  @ViewChild('dniInput') dniInput!: ElementRef;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {

    this.familiarForm = this.fb.group({
      dni: [null, [Validators.required]],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      convive: [false],
      parentescoId: [null, Validators.required],
      esEmpleado: [false],
      activo: [false],
    });
  }

 agregar(): void {
   if (this.familiarForm.valid) {
    const formValue = this.familiarForm.value;
    const parentesco = this.parentescos.find(p => p.parentescoId === +formValue.parentescoId);
    if (!parentesco) {
      console.error('Parentesco no encontrado');
      return;
    }
    const nuevo: Familiar = {
      ...formValue,
      familiaresId: this.editIndex !== null ? this.familiares[this.editIndex].familiaresId : 0,
      postulanteId: this.postulanteId,
      parentesco: parentesco,
    };

    if (this.editIndex !== null) {
      this.familiares[this.editIndex] = nuevo;
      this.editIndex = null;
    } else {
      this.familiares.push(nuevo);
    }

    this.familiaresChange.emit(this.familiares);
    this.familiarForm.reset({ convive: false, esEmpleado: false, activo: false });
    this.showForm = false;
    console.log(this.familiares)
  }
}



 editar(familiaresId: number): void {
  const index = this.familiares.findIndex(f => f.familiaresId === familiaresId);
  if (index !== -1) {
    this.editIndex = index;
    const fam = this.familiares[index];

    this.familiarForm.patchValue({
      dni: fam.dni,
      apellido: fam.apellido,
      nombre: fam.nombre,
      parentescoId: fam.parentesco?.parentescoId,
      convive: fam.convive,
      esEmpleado: fam.esEmpleado,
      activo: fam.activo,
    });

    this.showForm = true;
    setTimeout(() => this.dniInput?.nativeElement?.focus(), 0);
  }
}


eliminar(familiaresId: number): void {
  const index = this.familiares.findIndex(f => f.familiaresId === familiaresId);
  if (index !== -1) {
    this.familiares.splice(index, 1);
    this.familiaresChange.emit(this.familiares);
  }
}

  toggleForm() {
    console.log(this.familiares)
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.familiarForm.reset({ intentoAnterior: false, otraFuerza: false });
      this.editIndex = null;
    } else {
      setTimeout(() => this.dniInput?.nativeElement?.focus(), 0);
    }
  }

  cancelar() {
    this.editIndex = null;
    this.familiarForm.reset({ convive: false, esEmpleado: false, activo: false });
    this.toggleForm();
  }
}

export interface Familiar {
  familiaresId: number;
  postulanteId: number;
  dni: number;
  apellido: string;
  nombre: string;
  convive: boolean;
  parentesco: parentesco;
  esEmpleado: boolean;
  activo: boolean;
  exInterno: boolean;
  visita: boolean;
}

export interface parentesco {
  parentescoId: number;
  parentescoNombre: string;
}
