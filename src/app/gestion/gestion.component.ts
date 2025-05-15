/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { PostulanteService } from '../Services/postulante.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatNativeDateModule } from '@angular/material/core';
import { UppercaseDirective } from '../directivas/uppercase.directive'
@Component({
  selector: 'app-gestion',
  imports: [
     RouterModule,
     CommonModule,
     FormsModule,
     ReactiveFormsModule,
     MatFormFieldModule,
     MatCheckbox,
     MatSelect,
     MatInputModule,
     MatButtonModule,
     MatIcon,
     MatNativeDateModule,
     MatDatepickerModule,
     MatOption,
     UppercaseDirective
  ],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.css'
})

export class GestionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  postulante: any;
  imagenUrl: any;
  error = "";
  private postulanteService = inject(PostulanteService)
  postulanteIds: number[] = [];
  currentIndex = 0;
  idActual!: number;
  formData: any;
  private _formBuilder = inject(FormBuilder);
  public edadMaxima = 24;
  public tipoInscripcionId: any;
  maxFechaNacimiento: Date = new Date();
  seguimientoId = 0


  //////////////////////////////////////// FORMULARIOS //////////////////////////////////////////////////////////////////////////////////////

  InicialFormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    fechaNac: ['', [Validators.required, this.edadMaximaValidator(), this.edadMinimaValidator()]],
    sexoId: ['', Validators.required],
    estabSolicitudId: [''],
    dni: ['', Validators.required],
    nacionalidadId:['', Validators.required],
    nacionalizado: [false],
    generoId:['', Validators.required],
    estadoCivilId:['', Validators.required],
    altura:['', Validators.required],
    peso: ['', [
      Validators.required,
      Validators.pattern(/^\d{2,3}$/)
    ]],
    tieneTatuajes:[false],
    cantidadTatuajes:[''],
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    localidadId: ['', Validators.required],
    codigoPostal: ['', Validators.required],
    observaciones:[''],
  });

  seguimientoFormGroup = this._formBuilder.group({
      estadoSeguimientoId: [''],
      etapaSeguimientoId: [],
      fechaTurno: ['', Validators.required],
      asistencia: false,
      apto: false,
      notificado: false,
  });


   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  ngOnInit(): void {
  this.postulanteService.getFormData().subscribe((data: any) => {
    this.formData = data;

    // Esperamos a tener el formData antes de buscar el postulante
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id && id !== this.idActual) {
        this.idActual = id;
        this.cargarPostulante(id);
        this.postulanteIds = JSON.parse(sessionStorage.getItem('postulanteIds') || '[]');
        this.currentIndex = this.postulanteIds.indexOf(id);
      }
    });
  });

  const hoy = new Date();
  this.maxFechaNacimiento = new Date(hoy.getFullYear() - 17, 2, 30);
  }



  cargarPostulante(id: number): void {
  this.postulanteService.getPostulante(id.toString()).subscribe({
      next: (postulante) => {
        this.postulante = postulante;
        const tipoinscripcion = postulante.seguimiento.tipoInscripcion.tipoInscripcionNombre
        this.tipoInscripcionId = this.tipoInscripcion(tipoinscripcion)
        const documentos = postulante.documentos;
        this.cargarDatos(postulante);
        this.InicialFormGroup.disable();
        if (documentos && documentos.length > 0) {
          const idFoto = documentos[0].documentoId;

          this.postulanteService.getImage(idFoto).subscribe({
             next: (imagenBlob) => {
              //this.imagenUrl = imagenBlob;
              this.imagenUrl = URL.createObjectURL(imagenBlob);
              },
            error: (err) => {
              console.error("Error cargando imagen:", err.message);
              this.imagenUrl = 'assets/images/sin foto.png';
            }
          });
        }
      },
      error: (err) => {
        this.error = err.message;
      }
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
      this.edadMaxima=24;
      return 1;
    case 'suboficial':
      this.edadMaxima=34;
      return 2;
    case 'profesional':
      this.edadMaxima=99;
      return 3;
    default:
      return 1;
  }
}

cargarDatos(postulante: any): void {
  this.seguimientoId = postulante.seguimiento.seguimientoId
  const fecha = new Date(postulante.seguimiento.estadoSeguimientoActual.fechaTurno);
    const fechaFormateada = fecha.toISOString().split('T')[0];
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
    estadoCivilId:postulante.datosPersonales.estadoCivilId,
    altura:postulante.datosPersonales.altura,
    peso: postulante.datosPersonales.peso,
    cantidadTatuajes:postulante.datosPersonales.cantidadTatuajes,
    calle: postulante.domicilios[0].calle,
    numero: postulante.domicilios[0].numero,
    localidadId: postulante.domicilios[0].localidadId,
    codigoPostal: postulante.domicilios[0].codigoPostal,
    observaciones:postulante.observaciones,
  });
  this.seguimientoFormGroup.patchValue({
    etapaSeguimientoId: postulante.seguimiento.estadoSeguimientoActual.etapaSeguimientoId,
    fechaTurno: fechaFormateada,
    asistencia: postulante.seguimiento.estadoSeguimientoActual.asistencia,
    apto: postulante.seguimiento.estadoSeguimientoActual.apto,
    notificado: postulante.seguimiento.estadoSeguimientoActual.notificado,
    estadoSeguimientoId: postulante.seguimiento.estadoSeguimientoActualId
  })
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
  if (control?.hasError('edadMinima') ){
    return 'Debe cumplir 18 antes de 01/04/'+  (new Date().getFullYear() + 1).toString();
  }
  return '';
}

}
