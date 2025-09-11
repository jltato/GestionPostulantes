/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import {  MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../Services/config.service';
import { AlertService } from '../../Services/alert.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-configuration-popup',
  imports: [MatListModule, MatExpansionModule, CommonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatProgressSpinnerModule],
  standalone:true,
  templateUrl: './configuration-popup.component.html',
  styleUrl: './configuration-popup.component.css'
})
export class ConfigurationPopupComponent {

  configService = inject(ConfigService);
  alert = inject(AlertService);
  fb = inject(FormBuilder);
  campanias: any[] = [];
  campaniaForm!: FormGroup;
  editCampaniaForm!: FormGroup;
  guardando = false;

   form = {
      nombre: "",
      fechaDesde : '',
      fechaHasta : '',
    };

   // Sección seleccionada
  selectedSection = '';
  tipoSelected! : number;

  // Menú expandido
  expandedMenu: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ConfigurationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {}

  cerrar() {
    this.dialogRef.close(); // opcionalmente podés pasar un valor: this.dialogRef.close('cerrado');
  }

  toggleSubmenu(menu: string) {
    this.expandedMenu = this.expandedMenu === menu ? null : menu;
  }

  selectSection(section: string) {
    this.selectedSection = section;

    switch (section)
    {
      case 'cadetes': this.tipoSelected=1;
        this.creaFormulario(1);
        break;
      case 'suboficial': this.tipoSelected = 2;
        this.creaFormulario(2);
        break;
      case 'profesional': this.tipoSelected = 3;
        this.creaFormulario(3);
        break;
      case 'listadoCampañas':
        this.tipoSelected = 0;
        this.initTable();
        break;
      case 'modifCampania':
        this.tipoSelected=0;
        break;
      default: this.tipoSelected = 0
    }
  }

  creaFormulario(tipo:number){
    this.campaniaForm = this.fb.group({
        tipoInscripcionId: [tipo],
        nombre: [''],
        fechaDesde: [''],
        fechaHasta: [''],
        activo: [false]
      });

  }

  onSubmit() {
    if (this.campaniaForm.valid) {
      this.guardando=true;
      this.configService.enviarDatos(this.campaniaForm.value).subscribe({
        next: () => {
          this.alert.alert("Campaña Guardada", "La nueva campaña ha sido guardada satisfactoriamente");
          this.selectSection("");
          this.guardando=false;

        },
        error: (err) => {
            this.alert.alert("Error", "Ha ocurrido un error, por favor intente nuevamente");
          console.error('Error al enviar datos:', err);
          this.guardando=false;
        }
      });
    }
  }

  initTable(): void {
    this.guardando=true;
    this.configService.getCampanias().subscribe({
      next: (data) => {
        this.campanias = data;
        this.guardando=false;
      },
      error: (err) => {
        console.error('Error al cargar campañas:', err);
        this.guardando=false;
      }
    });
  }

  getCampania(idString:string) : void {
    this.selectSection("modifCampania")
    this.editCampaniaForm = this.fb.group({
      campaniaId: [0],
      nombre: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      activo: [false],
      tipoInscripcionId: [''],
    });

    const id  = parseInt(idString);
    this.guardando=true;
    this.configService.getCampaniaById(id).subscribe({
      next: (data) => {
        this.setCampaniaData(data)
        this.guardando=false;

      },
      error: (err) =>{
        this.guardando=false;
        console.error('Error al cargar la campaña:' + id.toString(), err)
      }
    })
  }

  setCampaniaData(campania: any) {
    this.editCampaniaForm.patchValue({
      campaniaId: campania.campaniaId,
      nombre: campania.nombre,
      fechaDesde: campania.fechaDesde.substring(0, 16),
      fechaHasta: campania.fechaHasta.substring(0, 16),
      activo: campania.activo,
      tipoInscripcionId: campania.tipoInscripcionId
    });
  }

  onSubmitEdit() {
    if (this.editCampaniaForm.valid) {
      this.guardando=true;
      const Id = this.editCampaniaForm.value.campaniaId;
      this.configService.putCampaniaById(Id, this.editCampaniaForm.value).subscribe({
        next: () => {
          this.alert.alert("Campaña Guardada", "La campaña ha sido modificada satisfactoriamente");
          this.selectSection("");
          this.guardando=false;
        },
        error: (err) => {
            this.alert.alert("Error", "Ha ocurrido un error, por favor intente nuevamente");
          console.error('Error al enviar datos:', err);
          this.guardando=false;
        }
      });
    }
  }

  async eliminarCamapania(id:number){
    const elimnar= await this.alert.confirm("Eliminar?", "Seguro que quiere eliminar la campaña seleccionada?")
    if(elimnar){
      if(id!= 0){
        this.guardando=true;
      this.configService.deleteCampaniaById(id).subscribe({
        next:()=>{
          this.alert.alert("Campaña Eliminada" ,"La campaña ha sido eliminada exitosamente");
          this.selectSection("");
          this.guardando=false;
        },
        error: (err) => {
          this.alert.alert("Error", "Ha ocurrido un error, por favor intente nuevamente");
          console.error('Error al eliminar camapaña:', err);
          this.guardando=false;
        }
      })
    }
    }

  }


}

