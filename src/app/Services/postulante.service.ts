/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulanteService {

   private apiKey = 'gRnMxbEdZjkVr9m9jc18o4DcLu9CbD202KmzVp0m0LN-YPlZXUvXKgmp2GrJd9o6F1NfUFUKIyyGzh9LJ56G1LFZsJClNkbJjf-iCHhvLj1kO8oDaLKaS2pvtu1IcgsgFgqDuT4B0TieOpn8GEJuiUIM-VXUMvCR0JdsH9vWDr2KjewWqfCsQbnudLP2sUwz0vAWpLNaDPpFbXeq3V-xO7W1qlO9ETHtnoBBUHyrQQPIIiE4Ywc4oDsFkANjSxT9';

  private baseUrl =  environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(isJson: boolean): HttpHeaders {
  let headers = new HttpHeaders({
    'X-API-KEY': this.apiKey
  });

  if (isJson) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return headers;
}

   getPostulante(id: string): Observable<any>  {
    return this.http.get<any>(`${this.baseUrl}/Postulantes/${id}`, { headers: this.getHeaders(true) })
    .pipe(
      catchError(error => {
        console.error('Error al obtener postulante', error);
        return throwError(() => new Error('No se pudo cargar el postulante.'));
      })
    )
  }

  getImage(id: string): Observable<Blob> {
  return this.http.get<Blob>(`${this.baseUrl}/Documentos/${id}`, {
    headers: this.getHeaders(false),
    responseType: 'blob' as 'json'
     }).pipe(
    catchError(error => {
      console.error('Error al obtener imagen', error);
      return throwError(() => new Error('No se pudo cargar la imagen.'));
    })
  );
  }

   getFormData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Postulantes/formdata`, { headers: this.getHeaders(true) });
  }


}
