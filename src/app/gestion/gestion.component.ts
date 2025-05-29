/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { PostulanteService } from '../Services/postulante.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { UppercaseDirective } from '../directivas/uppercase.directive';
@Component({
  selector: 'app-gestion',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
    MatNativeDateModule,
    MatDatepickerModule,
    //MatOption,
    UppercaseDirective,
  ],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.css',
})
export class GestionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  postulante: any;
  imagenUrl: any;
  error = '';
  private postulanteService = inject(PostulanteService);
  postulanteIds: number[] = [];
  currentIndex = 0;
  idActual!: number;
  formData: any;
  private _formBuilder = inject(FormBuilder);
  public edadMaxima = 24;
  maxFechaNacimiento: Date = new Date();
  seguimientoId = 0;
  edad = 0;
  guardando = false;
  fotoLista = true;
  etapaActualId = 0;
  Familiares:any;
  antecedentes = false;
  visitante = false;
  famAntecedente = false
  famVisitante = false;


  //////////////////////////////////////// FORMULARIOS //////////////////////////////////////////////////////////////////////////////////////

  InicialFormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    fechaNac: [
      '',
      [
        Validators.required,
        this.edadMaximaValidator(),
        this.edadMinimaValidator(),
      ],
    ],
    sexoId: ['', Validators.required],
    estabSolicitudId: [''],
    dni: ['', Validators.required],
    nacionalidadId: ['', Validators.required],
    nacionalizado: [false],
    generoId: ['', Validators.required],
    estadoCivilId: ['', Validators.required],
    altura: ['', Validators.required],
    peso: ['', [Validators.required, Validators.pattern(/^\d{2,3}$/)]],
    tieneTatuajes: [false],
    cantidadTatuajes: [''],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    localidadId: ['', Validators.required],
    codigoPostal: ['', Validators.required],
    observaciones: [''],
  });

  seguimientoFormGroup = this._formBuilder.group({
    SeguimientoId: [''],
    //estadoSeguimientoActualId:[''],
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ngOnInit(): void {
    this.postulanteService.getFormData().subscribe((data: any) => {
      this.formData = data;

      // Esperamos a tener el formData antes de buscar el postulante
      this.route.paramMap.subscribe((params) => {
        const id = Number(params.get('id'));
        if (id && id !== this.idActual) {
          this.idActual = id;
          this.cargarPostulante(id);
          this.postulanteIds = JSON.parse(
            sessionStorage.getItem('postulanteIds') || '[]',
          );
          this.currentIndex = this.postulanteIds.indexOf(id);
        }
      });
    });

    const hoy = new Date();
    this.maxFechaNacimiento = new Date(hoy.getFullYear() - 17, 2, 30);
  }

  cargarPostulante(id: number): void {
    this.fotoLista = false;
    this.postulanteService.getPostulante(id.toString()).subscribe({
      next: (postulante) => {
        this.InicialFormGroup.disable();
        this.postulante = postulante;
        this.cargarDatos(postulante);
        this.getEdad(postulante.fechaNac);
        this.postulanteService.getVerificacion(postulante.postulanteId).subscribe({
          next: (verificado)=>{
            this.antecedentes = verificado[0].exInterno;
            this.visitante = verificado[0].visitante;
            console.log(verificado);
          }
        });
        this.postulanteService.getFamiliares(postulante.postulanteId).subscribe({
           next: (Familiares)=>{
            console.log(Familiares);
            this.Familiares = Familiares;
            this.famVisitante = false;
            this.famAntecedente = false;
            Familiares.forEach((fam: { visita: any; exInterno: any; }) => {
              if(fam.visita){this.famVisitante=true}
              if(fam.exInterno){this.famAntecedente = true}
            });
          }
        });

        const documentos = postulante.documentos;
        if (documentos && documentos.length > 0) {

          const idFoto = documentos[0].documentoId;

          this.postulanteService.getImage(idFoto).subscribe({
            next: (imagenBlob) => {
              //this.imagenUrl = imagenBlob;
              this.imagenUrl = URL.createObjectURL(imagenBlob);
              this.fotoLista = true;
            },
            error: (err) => {
              console.error('Error cargando imagen:', err.message);
              this.imagenUrl = 'assets/images/sin foto.png';
              this.fotoLista = true;
            },
          });
        }
        else{
           console.error('Error cargando imagen: la imagen no existe');
              this.imagenUrl = 'assets/images/sin foto.png';
              this.fotoLista = true;
        }

      },
      error: (err) => {
        this.error = err.message;
      },
    });
  }

  navegarSiguiente(): void {
    if (this.currentIndex < this.postulanteIds.length - 1) {
      const siguienteId = this.postulanteIds[this.currentIndex + 1];
      this.router.navigate(['../', siguienteId], { relativeTo: this.route });
    }
  }

  navegarAnterior(): void {
    if (this.currentIndex > 0) {
      const anteriorId = this.postulanteIds[this.currentIndex - 1];
      this.router.navigate(['../', anteriorId], { relativeTo: this.route });
    }
  }

  edadMaximaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fecha = new Date(control.value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      const dia = hoy.getDate() - fecha.getDate();
      const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

      return edadExacta > this.edadMaxima ? { edadMaxima: true } : null;
    };
  }

  edadMinimaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fecha = new Date(control.value);
      const hoy = new Date();

      const fechaCalculo = new Date(hoy.getFullYear() + 1, 3, 1);

      const edad = fechaCalculo.getFullYear() - fecha.getFullYear();
      const mes = fechaCalculo.getMonth() - fecha.getMonth();
      const dia = fechaCalculo.getDate() - fecha.getDate();
      const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

      return edadExacta < 19 ? { edadMinima: true } : null;
    };
  }

  tipoInscripcion(tipo: string): number {
    switch (tipo.toLowerCase()) {
      case 'cadete':
        this.edadMaxima = 24;
        return 1;
      case 'suboficial':
        this.edadMaxima = 34;
        return 2;
      case 'profesional':
        this.edadMaxima = 99;
        return 3;
      default:
        return 1;
    }
  }

  cargarDatos(postulante: any): void {
    this.etapaActualId = postulante.seguimiento.estadoSeguimientoActualId;
    this.seguimientoId = postulante.seguimiento.seguimientoId;
    this.InicialFormGroup.patchValue({
      nombre: postulante.nombre,
      apellido: postulante.apellido,
      dni: postulante.dni,
      sexoId: postulante.sexoId,
      fechaNac: postulante.fechaNac,
      mail: postulante.mail,
      estabSolicitudId: postulante.estabSolicitudId,
      nacionalidadId: postulante.nacionalidadId,
      generoId: postulante.datosPersonales.generoId,
      estadoCivilId: postulante.datosPersonales.estadoCivilId,
      altura: postulante.datosPersonales.altura,
      peso: postulante.datosPersonales.peso,
      cantidadTatuajes: postulante.datosPersonales.cantidadTatuajes,
      calle: postulante.domicilios[0].calle,
      numero: postulante.domicilios[0].numero,
      localidadId: postulante.domicilios[0].localidadId,
      codigoPostal: postulante.domicilios[0].codigoPostal,
      observaciones: postulante.datosPersonales.observaciones,
    });
    const fechaHoreaFormat = postulante.seguimiento.estadoSeguimientoActual.fechaTurno.substring(0, 16);
    this.seguimientoFormGroup.patchValue({
      etapaSeguimientoId:
      postulante.seguimiento.estadoSeguimientoActual.etapaSeguimientoId,
      fechaTurno: fechaHoreaFormat,
      asistencia: postulante.seguimiento.estadoSeguimientoActual.asistencia,
      apto: postulante.seguimiento.estadoSeguimientoActual.apto,
      notificado: postulante.seguimiento.estadoSeguimientoActual.notificado,
      SeguimientoId: postulante.seguimiento.seguimientoId,
      observacion: postulante.seguimiento.observaciones,
      estadoId: postulante.seguimiento.estadoId,
      tipoInscripcionId: postulante.seguimiento.tipoInscripcionId,
    });
  }

  getErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    if (control?.hasError('existeDni')) {
      return 'El DNI ya se encuentra registrado';
    }
    if (control?.hasError('existeEmail')) {
      return 'El email ya se encuentra registrado';
    }
    if (control?.hasError('edadMaxima')) {
      return 'La edad no puede ser mayor a ' + this.edadMaxima + ' años';
    }
    if (control?.hasError('edadMinima')) {
      return (
        'Debe cumplir 18 antes de 01/04/' +
        (new Date().getFullYear() + 1).toString()
      );
    }
    return '';
  }

  getEdad(fechaNac: Date) {
    const fecha = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }

    this.edad = edad;
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
        this.postulante.seguimiento.estadosSeguimiento =
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
          this.postulante.seguimiento.estadosSeguimiento =
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
    if (confirm('¿Estás seguro que querés eliminar este Postualante?')) {
      this.postulanteService.eliminarPostulante(postulanteId).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
