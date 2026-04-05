/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder,  ReactiveFormsModule,  Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostulanteService } from '../Services/postulante.service';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../Services/alert.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-seguimiento',
  standalone : true,
  imports: [CommonModule, MatIcon, ReactiveFormsModule, MatButtonToggleModule, MatProgressSpinnerModule],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent implements OnInit, OnChanges  {

  @Input() seguimiento: any;
  @Input() formData: any;
  @Input() isReadOnly = false;
  @Input() isReconocimientosMedicos = false;
  @Input() postulanteIds: number[] = [];
  @Input() eliminando = false;
  @Input() currentIndex = 0;
  @Output() emitBorrarPostulante = new EventEmitter<number>();

    // en la clase del componente

  private alert = inject(AlertService)
  private _formBuilder = inject(FormBuilder);
  private postulanteService = inject(PostulanteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  guardando = false;
  seguimientoId = 0;
  etapaActualId = 0;
  error = '';
  tipo=0;
  postulacionesAnteriores:any[] = [];
  cargandoAnteriores = false;


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
    this.cargarPostulacionesAnteriores(this.seguimiento.postulanteId);
  }

  cargarPostulacionesAnteriores(postulanteId: any) {
    this.cargandoAnteriores = true;
    this.postulanteService.getPostulacionesAnteriores(postulanteId).subscribe({
      next: (postulaciones: any[]) => {
        this.postulacionesAnteriores = postulaciones;
        this.cargandoAnteriores = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seguimiento'] && changes['seguimiento'].currentValue) {
      this.setearFormulario();
      this.cargarPostulacionesAnteriores(this.seguimiento.postulanteId);
    }
    
    // Manejar permisos según el rol
    if (changes['isReadOnly'] || changes['isReconocimientosMedicos']) {
      this.aplicarPermisos();
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
    this.aplicarPermisos();
  }

  aplicarPermisos() {
    if (this.isReadOnly) {
      // Solo lectura: deshabilitar todo
      this.seguimientoFormGroup.disable();
    } else if (this.isReconocimientosMedicos) {
      // Reconocimientos Médicos: deshabilitar todo excepto campos específicos
      this.seguimientoFormGroup.disable();
      this.seguimientoFormGroup.get('asistencia')?.enable();
      this.seguimientoFormGroup.get('apto')?.enable();
      this.seguimientoFormGroup.get('notificado')?.enable();
      this.seguimientoFormGroup.get('observacion')?.enable();
    } else {
      // Acceso completo: habilitar todo
      this.seguimientoFormGroup.enable();
    }
  }

   enviarSeguimiento() {
    this.guardando = true;
    // Usar getRawValue() para incluir campos deshabilitados
    const formValues = this.seguimientoFormGroup.getRawValue();
    const seguimientoPayload = {
      seguimientoId: this.seguimientoId,
      observaciones: formValues.observacion,
      tipoInscripcionId: formValues.tipoInscripcionId,
      sectorSolicitudId: formValues.sectorSolicitudId,
      campaniaId: formValues.campaniaId,
      estadoId: formValues.estadoId,
      estadoSeguimientoActual: {
        etapaSeguimientoId: formValues.etapaSeguimientoId,
        fechaTurno: formValues.fechaTurno,
        asistencia: formValues.asistencia,
        apto: formValues.apto,
        notificado: formValues.notificado,
      },
    };

    this.postulanteService.postSeguimiento(seguimientoPayload).subscribe({
      next: (seguimiento: any) => {
        this.etapaActualId = seguimiento.estadoSeguimientoActualId;
        this.seguimiento.estadosSeguimiento = seguimiento.estadosSeguimiento;
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

  BorrarPostulante(postulanteId: number) {
    this.emitBorrarPostulante.emit(postulanteId);
  }

 get campaniasFiltradas() {
  return this.formData.campaniasActivas.filter(
    (    c: { tipoInscripcionId: number; }) => c.tipoInscripcionId === this.tipo
  );
}

get etapasFiltradas() {
  return this.formData.etapaSeguimiento.filter(
    (e: { tipoInscripcionId: number; }) => e.tipoInscripcionId === this.tipo
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

  
  navegar(id: number): void {
  this.router.navigate(['../', id], { 
    relativeTo: this.route,
    queryParams: { track: this.currentIndex } 
  });
}


}

