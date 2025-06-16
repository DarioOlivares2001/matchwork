// src/app/services/perfil.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Interfaz Habilidad */
export interface Habilidad {
  id: number;
  nombre: string;
}

/** Interfaz PerfilProfesional (sólo para referencia) */
export interface PerfilProfesional {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    comuna: string | null;
    habilidades: any[];
  };
  titulo: string;
  fotoUrl: string | null;
  cvUrl: string | null;
  presentacion: string;
  disponibilidad: string;
  modoTrabajo: string;
  experiencias: any[];
  estudios: any[];
}


export interface PerfilProfesionalCompleto {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    comuna: string | null;
  };
  titulo: string;
  fotoUrl: string | null;
  cvUrl: string | null;
  presentacion: string;
  disponibilidad: string;
  modoTrabajo: string;
  experiencias: {
    id: number;
    cargo: string;
    empresa: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
  }[];
  estudios: {
    id: number;
    nombreInstitucion: string;
    grado: string;
    fechaInicio: string;
    fechaFin: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly API_BASE = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getPerfil(userId: number): Observable<PerfilProfesional> {
    return this.http.get<PerfilProfesional>(`${this.API_BASE}/usuarios/${userId}/perfil-profesional`);
  }

   /** GET al nuevo endpoint “completo” */
  getPerfilCompleto(userId: number): Observable<PerfilProfesionalCompleto> {
    return this.http.get<PerfilProfesionalCompleto>(
      `${this.API_BASE}/usuarios/${userId}/perfil-profesional/completo`
    );
  }

  updatePerfil(userId: number, perfil: Partial<PerfilProfesional>): Observable<PerfilProfesional> {
    return this.http.post<PerfilProfesional>(`${this.API_BASE}/usuarios/${userId}/perfil-profesional`, perfil);
  }

  // --------------------------------------------------------
  // CAMBIO: ahora devolvemos Habilidad[] en lugar de string[]
  // --------------------------------------------------------
  getHabilidadesPorUsuario(userId: number): Observable<Habilidad[]> {
    return this.http.get<Habilidad[]>(`${this.API_BASE}/usuario-habilidades/usuario/${userId}`);
  }

  searchHabilidades(query: string): Observable<Habilidad[]> {
    return this.http.get<Habilidad[]>(`${this.API_BASE}/habilidades/search?q=${encodeURIComponent(query)}`);
  }

  asociarHabilidadAlUsuario(habilidadId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/usuario-habilidades`, { habilidadId });
  }

  eliminarHabilidadDelUsuario(usuarioHabilidadId: number): Observable<string> {
    return this.http.delete(
      `${this.API_BASE}/usuario-habilidades/${usuarioHabilidadId}`,
      { responseType: 'text' }
    );
  }

  uploadPhoto(userId: number, file: File): Observable<{ fotoUrl: string; message: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ fotoUrl: string; message: string }>(
      `${this.API_BASE}/usuarios/${userId}/perfil-profesional/foto`,
      fd
    );
  }

  /** POST multipart para subir CV */
  uploadCV(userId: number, file: File): Observable<{ cvUrl: string; message: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ cvUrl: string; message: string }>(
      `${this.API_BASE}/usuarios/${userId}/perfil-profesional/cv`,
      fd
    );
  }

}
