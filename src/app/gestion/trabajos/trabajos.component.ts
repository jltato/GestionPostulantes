import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-trabajos',
  imports: [CommonModule, MatIcon, ReactiveFormsModule],
  templateUrl: './trabajos.component.html',
  styleUrl: './trabajos.component.css',
  standalone: true,
})
export class TrabajosComponent {
@Input() trabajos: Trabajo[] = [];
@Input() postulanteId = 0;
@Input() habilitado = false;
@Input() isReadOnly = false;
@Output() trabajosChange = new EventEmitter<Trabajo[]>();

  fb = inject(FormBuilder);
  trabajoForm: FormGroup = this.fb.group({
    actividadLaboral: ['', Validators.required],
      desde: ['', Validators.required],
      hasta: ['', Validators.required],
      intentoAnterior: [false],
      otraFuerza: [false],
      motivoBaja: [''],
  })
  showForm = false;
  editIndex: number | null = null;

   @ViewChild('actividadInput') actividadInput!: ElementRef;



   toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.trabajoForm.reset({ intentoAnterior: false, otraFuerza: false });
      this.editIndex = null;
    } else {
      setTimeout(() => this.actividadInput?.nativeElement?.focus(), 0);
    }
  }

  agregarTrabajo() {
    if (this.trabajoForm.valid) {
      const formValue = this.trabajoForm.value;
      if (!this.trabajos) {
        this.trabajos = [];
      }
      if (this.editIndex !== null) {
        const original = this.trabajos[this.editIndex];
        this.trabajos[this.editIndex] = {
          ...formValue,
          trabajoId: original.trabajoId,
          postulanteId: original.postulanteId || this.postulanteId,
        };
        this.editIndex = null;
      } else {
        this.trabajos.push({
          ...formValue,
          trabajoId: 0,
          postulanteId: this.postulanteId,
        });
      }

      this.trabajosChange.emit(this.trabajos);
      this.toggleForm();
    }
  }

  editarTrabajo(trabajoId: number) {
    const index = this.trabajos.findIndex(t => t.trabajoId === trabajoId);
    if (index !== -1) {
      this.editIndex = index;
      const trabajo = this.trabajos[index];
      this.trabajoForm.patchValue({
        actividadLaboral: trabajo.actividadLaboral,
        desde: trabajo.desde,
        hasta: trabajo.hasta,
        intentoAnterior: trabajo.intentoAnterior,
        otraFuerza: trabajo.otraFuerza,
        motivoBaja: trabajo.motivoBaja,
      });
      this.showForm = true;
      setTimeout(() => this.actividadInput?.nativeElement?.focus(), 0);
    }
  }

  eliminarTrabajo(trabajoId: number) {
    const index = this.trabajos.findIndex(t => t.trabajoId === trabajoId);
    if (index !== -1) {
      this.trabajos.splice(index, 1);
      this.trabajosChange.emit(this.trabajos);
    }
  }


}

export interface Trabajo{
  trabajoId:number,
  postulanteId: number,
  actividadLaboral : string,
  desde: Date,
  hasta: Date,
  intentoAnterior: boolean,
  etapaAlzanzada: string,
  otraFuerza: boolean,
  motivoBaja: string
}
