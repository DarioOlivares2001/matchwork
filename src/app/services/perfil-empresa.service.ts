// src/app/services/perfil-empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerfilEmpresa } from '../models/perfil-empresa';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilEmpresaService {
  private baseUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  /** Obtiene el perfil de empresa para el usuario dado (GET /api/usuarios/{userId}/perfil-empresa) */
  getPerfilEmpresa(userId: number): Observable<PerfilEmpresa> {
    return this.http.get<PerfilEmpresa>(`${this.baseUrl}/${userId}/perfil-empresa`);
  }

  /** Crea o actualiza el perfil de empresa (POST /api/usuarios/{userId}/perfil-empresa) */
  savePerfilEmpresa(userId: number, datos: PerfilEmpresa): Observable<PerfilEmpresa> {
    return this.http.post<PerfilEmpresa>(`${this.baseUrl}/${userId}/perfil-empresa`, datos);
  }
}
