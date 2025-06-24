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
  private readonly baseUrl = 'https://ponkybonk.com/api/postulaciones';

  constructor(private http: HttpClient) {}

  getPerfilCompleto(usuarioId: number): Observable<PostulanteConPerfil> {
    return this.http.get<PostulanteConPerfil>(`${this.baseUrl}/usuario/${usuarioId}/perfil-completo`);
  }


 getPostulantesPorTrabajo(jobId: number): Observable<PostulanteConPerfil[]> {
    
    return this.http.get<PostulanteConPerfil[]>(
      `${this.baseUrl}/trabajo/${jobId}/postulantes-con-perfil`
    );
  }


 
  postular(usuarioId: number, trabajoId: number, cvUrl?: string | null) : Observable<Postulacion> {
     let params = new HttpParams()
    .set('usuarioId', usuarioId.toString())
    .set('trabajoId', trabajoId.toString());

   
    if (cvUrl) {
      params = params.set('cvUrl', cvUrl);
    }


    return this.http.post<Postulacion>(this.baseUrl, null, { params });
  }

  
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
