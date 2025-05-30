/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostulanteService {
  private apiKey =
    'gRnMxbEdZjkVr9m9jc18o4DcLu9CbD202KmzVp0m0LN-YPlZXUvXKgmp2GrJd9o6F1NfUFUKIyyGzh9LJ56G1LFZsJClNkbJjf-iCHhvLj1kO8oDaLKaS2pvtu1IcgsgFgqDuT4B0TieOpn8GEJuiUIM-VXUMvCR0JdsH9vWDr2KjewWqfCsQbnudLP2sUwz0vAWpLNaDPpFbXeq3V-xO7W1qlO9ETHtnoBBUHyrQQPIIiE4Ywc4oDsFkANjSxT9';

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(isJson: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'X-API-KEY': this.apiKey,
    });

    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  getPostulante(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/Postulantes/${id}`, {
        headers: this.getHeaders(true),
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener postulante', error);
          return throwError(
            () => new Error('No se pudo cargar el postulante.'),
          );
        }),
      );
  }

   getVerificacion(id:string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/Postulantes/Verificar/${id}`,
        {
          headers:this.getHeaders(true),
        })
   }

   getFamiliares(id:string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/Postulantes/Familiares/${id}`,
        {
          headers:this.getHeaders(true),
        })
   }

  getImage(id: string): Observable<Blob> {
    return this.http
      .get<Blob>(`${this.baseUrl}/Documentos/${id}`, {
        headers: this.getHeaders(false),
        responseType: 'blob' as 'json',
      })
  }

  getFormData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Postulantes/formdata`, {
      headers: this.getHeaders(true),
    });
  }

  postSeguimiento(seguimiento: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Seguimientos`, seguimiento, {
      headers: this.getHeaders(false),
    });
  }

  eliminarEstado(estadoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Seguimientos/${estadoId}`, {
      headers: this.getHeaders(false),
    });
  }

  eliminarPostulante(postulanteId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Postulantes/${postulanteId}`, {
      headers: this.getHeaders(false),
    });
  }

  getExcel(ListId: number[]): Observable<any> {
     return this.http.post( `${this.baseUrl}/Postulantes/Excel`,
      ListId,
      {
      headers: this.getHeaders(false),
       responseType: 'blob',
       })
  }

  putPostulante(postulanteId: number, postulante: any): Observable<any>{
    return this.http.put(`${this.baseUrl}/Postulantes/${postulanteId}`, postulante, {headers:this.getHeaders(false)})
  }

}
