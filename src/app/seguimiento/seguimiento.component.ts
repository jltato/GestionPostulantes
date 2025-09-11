/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder,  ReactiveFormsModule,  Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostulanteService } from '../Services/postulante.service';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AlertService } from '../Services/alert.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-seguimiento',
  standalone : true,
  imports: [CommonModule, MatIcon, ReactiveFormsModule, MatButtonToggleModule],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent implements OnInit, OnChanges  {

  @Input() seguimiento: any;
  @Input() formData: any;

    // en la clase del componente

  private alert = inject(AlertService)
  private _formBuilder = inject(FormBuilder);
  private postulanteService = inject(PostulanteService);
  private router = inject(Router);
  guardando = false;
  eliminando = false;
  seguimientoId = 0;
  etapaActualId = 0;
  error = '';
  tipo=0;


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
    sectorSolicitudId: [null],
    campaniaId: [null],
  });

  ngOnInit(): void {
    this.setearFormulario();
    this.seguimientoFormGroup.get('tipoInscripcionId')?.valueChanges.subscribe(valor => {
      this.tipo = +(valor ?? 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seguimiento'] && changes['seguimiento'].currentValue) {
      this.setearFormulario();
    }
  }

  setearFormulario() {
    this.etapaActualId = this.seguimiento.estadoSeguimientoActualId;
    this.seguimientoId = this.seguimiento.seguimientoId;
    this.tipo=this.seguimiento.tipoInscripcionId;
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
      sectorSolicitudId: this.seguimiento.sectorSolicitudId,
      campaniaId: this.seguimiento.campaniaId
    });
  }

   enviarSeguimiento() {
    this.guardando = true;
    const seguimientoPayload = {
      seguimientoId: this.seguimientoId,
      observaciones: this.seguimientoFormGroup.value.observacion,
      tipoInscripcionId: this.seguimientoFormGroup.value.tipoInscripcionId,
      sectorSolicitudId: this.seguimientoFormGroup.value.sectorSolicitudId,
      campaniaId: this.seguimientoFormGroup.value.campaniaId,
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
      next: (seguimiento: any) => {
        this.etapaActualId = seguimiento.estadoSeguimientoActualId;
        this.seguimiento.estadosSeguimiento =
          seguimiento.estadosSeguimiento;
        this.seguimientoId = seguimiento.seguimientoId;
        this.tipo=seguimiento.tipoInscripcionId;
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
            sectorSolicitudId: seguimiento.sectorSolicitudId,
            campaniaId: seguimiento.campaniaId,
        });
        this.alert.alert("Guardado", "Los cambios se guardaron exitosamente!")
        this.guardando = false;
      },
      error: (err:any) => {
        this.error = err.message;
        this.guardando = false;
        console.log(err);
      },
    });
  }

  onEtapaChange() {
    this.seguimientoFormGroup.get('fechaTurno')?.setValue('');
    this.seguimientoFormGroup.get('asistencia')?.setValue(null);
    this.seguimientoFormGroup.get('apto')?.setValue(null);
    this.seguimientoFormGroup.get('notificado')?.setValue(false);
  }

  async eliminarEstado(estadoId: number) {
    const confirmado = await this.alert.confirm('Eliminar', '¿Estás seguro que querés eliminar este estado?');
    if (confirmado) {
      this.guardando = true;
      this.postulanteService.eliminarEstado(estadoId).subscribe({
        next: (seguimiento: any) => {
          this.seguimiento.estadosSeguimiento =
            seguimiento.estadosSeguimiento;
          this.seguimientoId = seguimiento.seguimientoId;
          this.tipo=seguimiento.tipoInscripcionId;
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
            sectorSolicitudId: seguimiento.sectorSolicitudId,
            campaniaId: seguimiento.campaniaId
          });
          this.guardando = false;
        },
        error: (err: any) => {
          this.error = err.error;
          console.log(err);
          this.guardando = false;
        },
      });
    }
  }

  async BorrarPostulante(postulanteId: number) {
    const confirmado = await this.alert.confirm('Eliminar', '¿Estás seguro?');
    if (!confirmado) {
    return;
  }

  this.eliminando = true;
  this.postulanteService.eliminarPostulante(postulanteId).subscribe({
    next: () => {
      this.eliminando = false;
      this.alert.alert("Eliminado","¡El postulante ha sido eliminado con éxito!");
      this.router.navigate(['/home']);
    },
    error: (err) => {
      this.eliminando = false;
      console.log(err);
    },
  });
  }

 get campaniasFiltradas() {
  return this.formData.campaniasActivas.filter(
    (    c: { tipoInscripcionId: number; }) => c.tipoInscripcionId === this.tipo
  );
}

toggleAsistencia(valor: boolean): void {
  const control = this.seguimientoFormGroup.get('asistencia');
  if (!control) return;

  if (control.value === valor) {
    // mismo valor → desmarcar (null)
    control.setValue(null);
  } else {
    // valor nuevo → asignar
    control.setValue(valor);
  }
}

}
