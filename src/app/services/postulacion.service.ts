// src/app/services/postulacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Postulacion {
  id: number;
  usuarioId: number;
  trabajo: {
    id: number;
    titulo: string;
    descripcion: string;
    empresa: string;
    ubicacion: string;
    tipo: string;
    sueldo: number;
    fechaPublicacion: string;
    estado: string;
    fechaPostulacion?: string; 
  };
  fechaPostulacion?: string; 
  cvUrl?: string; 

}

export interface PostulanteConPerfil {
  postulacionId: number;
  usuarioId: number;
  nombreUsuario: string;
  tituloProfesional: string;
  fotoUrl: string;
  presentacion?: string;
  fechaPostulacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private readonly baseUrl = 'http://localhost:8081/api/postulaciones';

  constructor(private http: HttpClient) {}

  getPerfilCompleto(usuarioId: number): Observable<PostulanteConPerfil> {
    return this.http.get<PostulanteConPerfil>(`${this.baseUrl}/usuario/${usuarioId}/perfil-completo`);
  }


 getPostulantesPorTrabajo(jobId: number): Observable<PostulanteConPerfil[]> {
    // ↳ Aquí inserto "trabajo/" justo antes de jobId
    return this.http.get<PostulanteConPerfil[]>(
      `${this.baseUrl}/trabajo/${jobId}/postulantes-con-perfil`
    );
  }


  /**
   * Llama al endpoint POST /api/postulaciones?usuarioId=...&trabajoId=...
   */
  postular(usuarioId: number, trabajoId: number, cvUrl?: string | null) : Observable<Postulacion> {
     let params = new HttpParams()
    .set('usuarioId', usuarioId.toString())
    .set('trabajoId', trabajoId.toString());

    // 2) sólo si viene cvUrl
    if (cvUrl) {
      params = params.set('cvUrl', cvUrl);
    }

    // 3) lanzamos la petición
    return this.http.post<Postulacion>(this.baseUrl, null, { params });
  }

  /**
   * Si más adelante deseas obtener todas las postulaciones de un usuario:
   * GET /api/postulaciones/usuario/{usuarioId}
   */
  getPostulacionesPorUsuario(usuarioId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  yaPostulado(usuarioId: number, trabajoId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('trabajoId', trabajoId.toString());
    return this.http.get<boolean>(`${this.baseUrl}/existe`, { params });
  }
}
