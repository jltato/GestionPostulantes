/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { PostulanteService } from '../Services/postulante.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UppercaseDirective } from '../directivas/uppercase.directive';
import { SeguimientoComponent } from "../seguimiento/seguimiento.component";
import { ContactoComponent } from './contactos/contactos.component';
import { EstudiosComponent } from "./estudios/estudios.component";
import { TrabajosComponent } from "./trabajos/trabajos.component";
import { FamiliarComponent } from "./familia/familia.component";

@Component({
  selector: 'app-gestion',
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDatepickerModule,
    UppercaseDirective,
    SeguimientoComponent,
    ContactoComponent,
    EstudiosComponent,
    TrabajosComponent,
    FamiliarComponent,
    ReactiveFormsModule
],
  standalone:true,
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.css',
})

export class GestionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
   private _formBuilder = inject(FormBuilder);
  private postulanteService = inject(PostulanteService);

  postulante: any;
  imagenUrl: any;
  postulanteIds: number[] = [];
  currentIndex = 0;
  idActual!: number;
  formData: any;
  public edadMaxima = 24;
  maxFechaNacimiento: Date = new Date();
  edad = 0;
  IMC = 0;
  fotoLista = true;
  Familiares:any;
  antecedentes = false;
  visitante = false;
  famAntecedente = false
  famVisitante = false;
  error = '';
  habilitado=false;
  guardando = false;
  postulanteId=0;


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



  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  ngOnInit(): void {
    this.postulanteService.getFormData().subscribe((data: any) => {
      this.formData = data;

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
        this.postulanteId = postulante.postulanteId;
        this.cargarDatos(postulante);
        this.getEdad(postulante.fechaNac);
        const altura  = parseInt(postulante.datosPersonales.altura ?? "");
        const peso = parseInt(postulante.datosPersonales.peso ?? "");
        this.getIMC(altura, peso)
        this.postulanteService.getVerificacion(postulante.postulanteId).subscribe({
          next: (verificado)=>{
            this.antecedentes = verificado[0].exInterno;
            this.visitante = verificado[0].visitante;
          }
        });
        this.postulanteService.getFamiliares(postulante.postulanteId).subscribe({
           next: (Familiares)=>{
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

//   dniValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//       const value = control.value;
//       if (!value) return null; // si está vacío, que lo maneje el required

//   // eliminar puntos si vienen del mask
//   const numericValue = Number(String(value).replace(/\./g, ''));

//   if (isNaN(numericValue)) {
//     return { invalidNumber: true };
//   }

//   if (numericValue < 1000000 || numericValue > 99999999) {
//     return { outOfRange: true };
//   }

//   return null; // válido
//   }
// }

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

  tipoInscripcion(tipo: number): number {
    switch (tipo) {
      case 1:
        this.edadMaxima = 24;
        return 1;
      case 2:
        this.edadMaxima = 34;
        return 2;
      case 3:
        this.edadMaxima = 99;
        return 3;
      default:
        return 1;
    }
  }

  cargarDatos(postulante: any): void {
    this.tipoInscripcion(postulante.seguimiento.tipoInscripcionId)
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

  getEdadClass():string{
    const fecha = new Date(this.postulante.fechaNac);
    const hoy = new Date();
    const fechaCalculo = new Date(hoy.getFullYear() + 1, 3, 1);
    const edad = fechaCalculo.getFullYear() - fecha.getFullYear();
    const mes = fechaCalculo.getMonth() - fecha.getMonth();
    const dia = fechaCalculo.getDate() - fecha.getDate();
    const edadExacta = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

    if(edadExacta>this.edadMaxima) return 'text-danger';
    return '';
  }

  getIMC(altura:number, peso:number){
    this.IMC = Math.round(peso / Math.pow(altura / 100, 2));
  }
  getIMCClass(): string {
  if (this.IMC < 18.5) return 'text-success';        // Bajo peso
  if (this.IMC < 25) return '';                      // Normal
  if (this.IMC < 30) return 'text-warning';         // Sobrepeso
  return 'text-danger';                             // Obesidad
}

  habilitar(){
     this.InicialFormGroup.enable();
     this.habilitado=true;
  }

  deshabilitar(){
    this.InicialFormGroup.disable();
    this.habilitado=false;
  }

  guardar(){
    this.guardando=true;

    const form = this.InicialFormGroup.value;

    const postulante = {
      postulanteId: this.postulanteId,
      nombre: form.nombre,
      apellido: form.apellido,
      mail: form.mail,
      fechaNac: form.fechaNac,
      sexoId: form.sexoId,
      estabSolicitudId: form.estabSolicitudId,
      dni: form.dni,
      nacionalidadId: form.nacionalidadId,
      nacionalizado: form.nacionalizado,
      datosPersonales: {
        postulanteId: this.postulante.postulanteId,
        datosPersonalesId: this.postulante.datosPersonales.datosPersonalesId,
        generoId: form.generoId,
        estadoCivilId: form.estadoCivilId,
        altura: form.altura,
        peso: form.peso,
        tieneTatuajes: form.tieneTatuajes,
        cantidadTatuajes: form.cantidadTatuajes,
        observaciones: form.observaciones
      },
      domicilios: [
        {
          domicilioId: this.postulante.domicilios[0].domicilioId,
          postulanteId: this.postulante.postulanteId,
          calle: form.calle,
          numero: form.numero,
          localidadId: form.localidadId,
          codigoPostal: form.codigoPostal
        }
      ],
      contactos: this.postulante.contacto,
      estudios: this.postulante.estudios,
      trabajos: this.postulante.trabajos,
      familiares: this.Familiares,
    }


    this.postulanteService.putPostulante(this.postulanteId, postulante).subscribe({
      next: (res) => {
        console.log(res);
        this.cargarPostulante(res);
        this.guardando = false;
        this.habilitado=false;

        this.InicialFormGroup.disable();


      },
      error: (err) => {
        alert("ha ocurrido un error al guardar los datos, por favor intente nuevamente")
        console.error('Error al actualizar', err);
        this.guardando=false
      }
    })

  }

  actualizarContactos(contactosModificados: any[]) {
    this.postulante.contacto = [...contactosModificados];
  }
  actualizarEstudios(nuevosEstudios: any[]) {
    this.postulante.estudios = [...nuevosEstudios];
  }
   actualizarTrabajos(nevosTrabajos: any[]) {
    this.postulante.trabajos = [...nevosTrabajos];
  }
  actualizarFamiliares(nuevosFamiliares: any[]) {
    this.Familiares = [...nuevosFamiliares];
  }
}
