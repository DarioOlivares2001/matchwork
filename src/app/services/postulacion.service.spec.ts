import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * INTERFAZ POSTULACION: 
 * - El campo `fechaPostulacion` ya no va dentro de `trabajo` (Job); 
 *   se mapea al nivel superior. 
 * - El objeto `trabajo` solo contiene los campos del Job original.
 */
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
    // NOTA: —no— pongas aquí `fechaPostulacion`. 
    // Ese campo va en el mismo nivel que id/usuarioId.
  };
  fechaPostulacion: string; // ESTA propiedad vendrá del backend
}

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private readonly baseUrl = 'http://localhost:8081/api/postulaciones';

  constructor(private http: HttpClient) {}

  /**
   * POST /api/postulaciones?usuarioId=...&trabajoId=...
   * Este endpoint devuelve la Postulacion recién creada,
   * que incluye `fechaPostulacion` en la respuesta.
   */
  postular(usuarioId: number, trabajoId: number): Observable<Postulacion> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('trabajoId', trabajoId.toString());

    // Como el endpoint usa query params y no body, pasamos `null` como body:
    return this.http.post<Postulacion>(this.baseUrl, null, { params });
  }

  /**
   * GET /api/postulaciones/usuario/{usuarioId}
   * Para listar TODAS las postulaciones de un usuario.
   */
  getPostulacionesPorUsuario(usuarioId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /**
   * GET /api/postulaciones/existe?usuarioId=...&trabajoId=...
   * Devuelve `true` si YA existe una postulacion de este usuarioId para este trabajoId.
   */
  yaPostulado(usuarioId: number, trabajoId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('trabajoId', trabajoId.toString());
    return this.http.get<boolean>(`${this.baseUrl}/existe`, { params });
  }
}
