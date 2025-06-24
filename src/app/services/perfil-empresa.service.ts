// src/app/services/perfil-empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerfilEmpresa } from '../models/perfil-empresa';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilEmpresaService {
  private baseUrl = 'https://ponkybonk.com/api/usuarios';

  constructor(private http: HttpClient) {}

  /** Obtiene el perfil de empresa para el usuario dado (GET /api/usuarios/{userId}/perfil-empresa) */
  getPerfilEmpresa(userId: number): Observable<PerfilEmpresa> {
    return this.http.get<PerfilEmpresa>(`${this.baseUrl}/${userId}/perfil-empresa`);
  }

  /** Crea o actualiza el perfil de empresa (POST /api/usuarios/{userId}/perfil-empresa) */
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
