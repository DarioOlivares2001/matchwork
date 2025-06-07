// src/app/services/job.service.ts
import { Injectable }            from '@angular/core';
import { HttpClient }            from '@angular/common/http';
import { Observable, map }       from 'rxjs';
import { AuthService }           from './auth.service';

/**
 * Esta es tu interfaz existente para listar trabajos.
 * Si luego quieres mostrar más campos en tu lista, agrega las propiedades aquí.
 */
export interface Job {
  id: number;
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;
  sueldo: number;
  fechaPublicacion: string;
  // Si deseas más campos (como fechaLimitePostulacion), agrégalos aquí:
  fechaLimitePostulacion?: string;
  nivelExperiencia?: string;
  categoria?: string;
  departamento?: string;
  vacantes?: number;
  remoto?: boolean;
  duracionContrato?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  beneficios?: string;
  idiomas?: string;
  companyWebsite?: string;
  logoUrl?: string;
  etiquetas?: string;
}

/**
 * Interfaz para el payload que envías en POST (create) y PUT (update).
 * Incluye todos los campos que tu backend acepta.
 */
export interface JobRequest {
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;              // Ej: "Full_Time", "Part_Time", "Freelance"
  sueldo: number;

  /*** Campos opcionales (según backend)***/
  fechaLimitePostulacion?: string;  // Formato "YYYY-MM-DD"
  nivelExperiencia?: string;        // Ej: "Junior", "Semi Senior", "Senior"
  categoria?: string;
  departamento?: string;
  vacantes?: number;
  remoto?: boolean;
  duracionContrato?: string;
  requisitos?: string;
  habilidadesRequeridas?: string;
  beneficios?: string;
  idiomas?: string;
  companyWebsite?: string;
  logoUrl?: string;
  etiquetas?: string;               // Ej: "Java,Backend,Spring"
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private baseUrl = 'http://localhost:8081/api/jobs';

  constructor(
    private http: HttpClient,
    private auth: AuthService            // para obtener creatorId del usuario logueado
  ) {}

  // ------------------------------------------------------
  // 1) MÉTODOS EXISTENTES (que ya tenías) — NO LOS CAMBIAMOS
  // ------------------------------------------------------

  /** Trae todas las ofertas */
  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.baseUrl);
  }

  /** Trae las N más recientes, por fechaPublicacion */
  getLatestJobs(count: number = 3): Observable<Job[]> {
    return this.getAllJobs().pipe(
      map(jobs =>
        jobs
          .sort((a, b) =>
            new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
          )
          .slice(0, count)
      )
    );
  }

  /** Trae una oferta por su ID */
  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.baseUrl}/${id}`);
  }


  // ------------------------------------------------------
  // 2) NUEVOS MÉTODOS PARA CREAR / EDITAR / ELIMINAR
  // ------------------------------------------------------

  /**
   * Crea un nuevo trabajo usando el creatorId del usuario logueado.
   * Backend espera: POST /api/jobs?creatorId=XYZ
   */
  createJob(payload: JobRequest): Observable<Job> {
    const user = this.auth.userSnapshot;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    const creatorId = user.id;

    return this.http.post<Job>(
      `${this.baseUrl}?creatorId=${creatorId}`,
      payload
    );
  }

  /**
   * Actualiza un trabajo existente (PUT).
   * Backend espera: PUT /api/jobs/{id}?creatorId=XYZ
   */
  updateJob(jobId: number, payload: JobRequest): Observable<Job> {
    const user = this.auth.userSnapshot;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    const creatorId = user.id;

    return this.http.put<Job>(
      `${this.baseUrl}/${jobId}?creatorId=${creatorId}`,
      payload
    );
  }

  /**
   * Elimina un trabajo (hard delete).
   * Backend solo permite DELETE /api/jobs/{id} si el JWT es válido
   * y coincide el creatorId interno.
   */
  deleteJob(jobId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${jobId}`);
  }


  getJobsByCreator(): Observable<Job[]> {
    // 1) Obtener el usuario logueado (de AuthService)
    const user = this.auth.userSnapshot;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    const creatorId = user.id;

    // 2) Llamar a GET /api/jobs/creator/{creatorId}
    return this.http.get<Job[]>(`${this.baseUrl}/creator/${creatorId}`);
  }



}
