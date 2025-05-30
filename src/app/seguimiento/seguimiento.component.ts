/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostulanteService } from '../Services/postulante.service';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seguimiento',
  imports: [  FormsModule, ReactiveFormsModule, CommonModule, MatIcon,],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent implements OnInit, OnChanges  {

  @Input() seguimiento: any;
  @Input() formData: any;

  private _formBuilder = inject(FormBuilder);
  private postulanteService = inject(PostulanteService);
  private router = inject(Router);
  guardando = false;
  eliminando = false;
  seguimientoId = 0;
  etapaActualId = 0;
  error = '';


  seguimientoFormGroup = this._formBuilder.group({
    SeguimientoId: [''],
    etapaSeguimientoId: [''],
    estadoGral: [2],
    fechaTurno: ['', Validators.required],
    asistencia: false,
    apto: [false],
    notificado: false,
    observacion: [''],
    estadoId: [],
    tipoInscripcionId: [''],
  });

  ngOnInit(): void {
    this.setearFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seguimiento'] && changes['seguimiento'].currentValue) {
      this.setearFormulario();
    }
  }

  setearFormulario() {
    this.etapaActualId = this.seguimiento.estadoSeguimientoActualId;
    this.seguimientoId = this.seguimiento.seguimientoId;

    const fechaHoreaFormat = this.seguimiento.estadoSeguimientoActual.fechaTurno.substring(0, 16);
    this.seguimientoFormGroup.patchValue({
      etapaSeguimientoId: this.seguimiento.estadoSeguimientoActual.etapaSeguimientoId,
      fechaTurno: fechaHoreaFormat,
      asistencia: this.seguimiento.estadoSeguimientoActual.asistencia,
      apto: this.seguimiento.estadoSeguimientoActual.apto,
      notificado: this.seguimiento.estadoSeguimientoActual.notificado,
      SeguimientoId: this.seguimiento.seguimientoId,
      observacion: this.seguimiento.observaciones,
      estadoId: this.seguimiento.estadoId,
      tipoInscripcionId: this.seguimiento.tipoInscripcionId,
    });
  }

   enviarSeguimiento() {
    this.guardando = false;
    const seguimientoPayload = {
      seguimientoId: this.seguimientoId,
      observaciones: this.seguimientoFormGroup.value.observacion,
      tipoInscripcionId: this.seguimientoFormGroup.value.tipoInscripcionId,
      estadoId: this.seguimientoFormGroup.value.estadoId,
      estadoSeguimientoActual: {
        etapaSeguimientoId: this.seguimientoFormGroup.value.etapaSeguimientoId,
        fechaTurno: this.seguimientoFormGroup.value.fechaTurno,
        asistencia: this.seguimientoFormGroup.value.asistencia,
        apto: this.seguimientoFormGroup.value.apto,
        notificado: this.seguimientoFormGroup.value.notificado,
      },
    };

    this.postulanteService.postSeguimiento(seguimientoPayload).subscribe({
      next: (seguimiento) => {
        this.etapaActualId = seguimiento.estadoSeguimientoActualId;
        this.seguimiento.estadosSeguimiento =
          seguimiento.estadosSeguimiento;
        this.seguimientoId = seguimiento.seguimientoId;
        const fechaHoreaFormat = seguimiento.estadoSeguimientoActual.fechaTurno.substring(0, 16);
        this.seguimientoFormGroup.patchValue({
          etapaSeguimientoId:
            seguimiento.estadoSeguimientoActual.etapaSeguimientoId,
            fechaTurno: fechaHoreaFormat,
            asistencia: seguimiento.estadoSeguimientoActual.asistencia,
            apto: seguimiento.estadoSeguimientoActual.apto,
            notificado: seguimiento.estadoSeguimientoActual.notificado,
            SeguimientoId: seguimiento.seguimientoId,
            observacion: seguimiento.observaciones,
            estadoId: seguimiento.estadoId,
            tipoInscripcionId: seguimiento.tipoInscripcionId,
        });
        this.guardando = true;
      },
      error: (err) => {
        this.error = err.message;
        this.guardando = true;
        console.log(err);
      },
    });
  }

  onEtapaChange() {
    this.seguimientoFormGroup.get('fechaTurno')?.setValue('');
    this.seguimientoFormGroup.get('asistencia')?.setValue(false);
    this.seguimientoFormGroup.get('apto')?.setValue(null);
    this.seguimientoFormGroup.get('notificado')?.setValue(false);
  }

  eliminarEstado(estadoId: number) {
    if (confirm('¿Estás seguro que querés eliminar este estado?')) {
      this.guardando = false;
      this.postulanteService.eliminarEstado(estadoId).subscribe({
        next: (seguimiento) => {
          this.seguimiento.estadosSeguimiento =
            seguimiento.estadosSeguimiento;
          this.seguimientoId = seguimiento.seguimientoId;
          const fechaHoreaFormat = seguimiento.estadoSeguimientoActual.fechaTurno.substring(0, 16);
          this.etapaActualId = seguimiento.estadoSeguimientoActualId;
          this.seguimientoFormGroup.patchValue({
            etapaSeguimientoId:
            seguimiento.estadoSeguimientoActual.etapaSeguimientoId,
            fechaTurno: fechaHoreaFormat,
            asistencia: seguimiento.estadoSeguimientoActual.asistencia,
            apto: seguimiento.estadoSeguimientoActual.apto,
            notificado: seguimiento.estadoSeguimientoActual.notificado,
            SeguimientoId: seguimiento.seguimientoId,
            observacion: seguimiento.observaciones,
            estadoId: seguimiento.estadoId,
            tipoInscripcionId: seguimiento.tipoInscripcionId,
          });
          this.guardando = true;
        },
        error: (err) => {
          this.error = err.error;
          console.log(err);
          this.guardando = true;
        },
      });
    }
  }

  BorrarPostulante(postulanteId: number) {
    if (!confirm('¿Estás seguro que querés eliminar este Postulante?')) {
    return;
  }

  this.eliminando = true;
  this.postulanteService.eliminarPostulante(postulanteId).subscribe({
    next: () => {
      this.eliminando = false;
      alert("¡El postulante ha sido eliminado con éxito!");
      this.router.navigate(['/home']);
    },
    error: (err) => {
      this.eliminando = false;
      console.log(err);
    },
  });
  }


}
