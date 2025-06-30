// src/app/services/perfil-empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerfilEmpresa } from '../models/perfil-empresa';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class PerfilEmpresaService {
  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

 
  getPerfilEmpresa(userId: number): Observable<PerfilEmpresa> {
    return this.http.get<PerfilEmpresa>(`${this.baseUrl}/${userId}/perfil-empresa`);
  }

 
  savePerfilEmpresa(userId: number, datos: PerfilEmpresa): Observable<PerfilEmpresa> {
    return this.http.post<PerfilEmpresa>(`${this.baseUrl}/${userId}/perfil-empresa`, datos);
  }

  uploadLogo(userId: number, file: File): Observable<{ logoUrl: string; message: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ logoUrl: string; message: string }>(
      `${this.baseUrl}/${userId}/perfil-empresa/logo`,
      fd
    );
  }
}
