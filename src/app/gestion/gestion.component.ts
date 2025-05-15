/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { PostulanteService } from '../Services/postulante.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion',
  imports: [
     RouterModule,
     CommonModule,
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

  ngOnInit(): void {
     this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    if (id && id !== this.idActual) {
      this.idActual = id;
      this.cargarPostulante(id);
      this.postulanteIds = JSON.parse(sessionStorage.getItem('postulanteIds') || '[]');
      this.currentIndex = this.postulanteIds.indexOf(id);
    }
  });

  }

  cargarPostulante(id: number): void {
  this.postulanteService.getPostulante(id.toString()).subscribe({
      next: (postulante) => {
        this.postulante = postulante;

        const documentos = postulante.documentos;
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

//   actualizarIndices() {
//   this.currentIndex = this.postulanteIds.indexOf(this.currentId);
// }

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

}
