// src/app/services/match.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrabajoSugerido } from './trabajo-sugerido.model';  // Lo crearemos en el próximo paso

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly API_BASE = 'https://ponkybonk.com/api/match';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los trabajos sugeridos (Mis Match) para un usuario determinado.
   * @param usuarioId ID del usuario logueado
   * @param page Número de página (opcional, por defecto 0)
   * @param size Tamaño de página (opcional, por defecto 10)
   */
  getTrabajosSugeridos(
    usuarioId: number,
    page: number = 0,
    size: number = 10
  ): Observable<TrabajoSugerido[]> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<TrabajoSugerido[]>(
      `${this.API_BASE}/trabajos`,
      { params }
    );
  }
}
