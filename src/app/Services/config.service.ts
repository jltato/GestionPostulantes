/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    private baseUrl = environment.apiUrl;
    private apiKey = environment.apiKey;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'X-API-KEY': this.apiKey,
    });
    return headers;
  }

  enviarDatos(payload:any) : Observable<any>{
     return this.http.post<any>(`${this.baseUrl}/campanias`, payload, {
      headers: this.getHeaders(),
    });
  }

  getCampanias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Campanias`, {
      headers: this.getHeaders(),
    });
  }

  getCampaniaById(id : number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Campanias/${id}`, {
      headers: this.getHeaders(),
    });
  }

  putCampaniaById(id:number, payload:any): Observable<any[]> {
    return this.http.put<any[]>(`${this.baseUrl}/Campanias/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  deleteCampaniaById(id : number): Observable<any[]> {
    return this.http.delete<any[]>(`${this.baseUrl}/Campanias/${id}`, {
      headers: this.getHeaders(),
    });
  }

}
