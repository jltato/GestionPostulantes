import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-estudios',
  imports: [CommonModule, MatIcon, ReactiveFormsModule],
  templateUrl: './estudios.component.html',
  styleUrl: './estudios.component.css'
})
export class EstudiosComponent {
  @Input() estudios: Estudio[] = [];
  @Input() niveles: NivelEstudios[] = [];
  @Input() habilitado = false;
  @Input() isReadOnly = false;
  @Input() postulanteId = 0;

  @Output() estudiosChange = new EventEmitter<Estudio[]>();

  @ViewChild('tituloInput') tituloInput!: ElementRef;

  private fb = inject(FormBuilder);

  estudioForm: FormGroup = this.fb.group({
     nivelEstudiosId: [null, Validators.required],
      titulo: ['', Validators.required],
      institutoEducativo: ['', Validators.required],
      enCurso: [false],
      anoEgreso: [null]
  });

  showForm = false;
  editIndex: number | null = null;



  agregarEstudio() {
    if (this.estudioForm.valid) {
      const formValue = this.estudioForm.value;
      try {
        const nivel = this.niveles.find(n => n.nivelEstudiosId === +formValue.nivelEstudiosId);
        if (!nivel) {
          console.error('Nivel de estudios no encontrado');
          return;
        }
        if (this.editIndex !== null) {
          const original = this.estudios[this.editIndex];
          this.estudios[this.editIndex] = {
            ...formValue,
            estudiosId: original.estudiosId,
            postulanteId: original.postulanteId || this.postulanteId,
            nivelEstudios: nivel,
            enCurso: !!formValue.enCurso
          };
          this.editIndex = null;
        } else {
          this.estudios.push({
            ...formValue,
            estudiosId: 0,
            postulanteId: this.postulanteId,
            nivelEstudios: nivel,
            enCurso: !!formValue.enCurso
          });
        }
        this.estudiosChange.emit(this.estudios);
        this.toggleForm();
      } catch (error) {
        console.error(error);
      }
    }
  }


  eliminarEstudio(estudiosId: number) {
    const index = this.estudios.findIndex(e => e.estudiosId === estudiosId);
    if (index !== -1) {
      this.estudios.splice(index, 1);
      this.estudiosChange.emit(this.estudios);
    }
  }

  editarEstudio(estudiosId: number) {
    const index = this.estudios.findIndex(e => e.estudiosId === estudiosId);
    if (index !== -1) {
      const estudio = this.estudios[index];
      this.estudioForm.setValue({
        nivelEstudiosId: estudio.nivelEstudiosId,
        titulo: estudio.titulo,
        institutoEducativo: estudio.institutoEducativo,
        enCurso: estudio.enCurso,
        anoEgreso: estudio.anoEgreso
      });
      this.editIndex = index;
      this.showForm = true;
      if (this.showForm) {
        setTimeout(() => this.tituloInput.nativeElement.focus());
      }
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.editIndex = null;
    this.estudioForm.reset();
    if (this.showForm) {
      setTimeout(() => this.tituloInput.nativeElement.focus());
    }
  }
}

export interface Estudio {
  estudiosId: number;
  postulanteId: number;
  nivelEstudiosId: number;
  titulo: string;
  institutoEducativo: string;
  enCurso: boolean;
  anoEgreso?: number;
  nivelEstudios: NivelEstudios;
}

export interface NivelEstudios {
  nivelEstudiosId: number;
  nivelNombre: string;
}

