import { Injectable }            from '@angular/core';
import { HttpClient }            from '@angular/common/http';
import { Observable, map }       from 'rxjs';
import { AuthService }           from './auth.service';
import { environment } from '../../environments/environments';



export interface Job {
  id: number;
  creatorId: number;
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;
  sueldo: number;
  fechaPublicacion: string;
 
  
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


export interface JobRequest {
  titulo: string;
  descripcion: string;
  empresa: string;
  ubicacion: string;
  tipo: string;             
  sueldo: number;

  
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

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private baseUrl = `${environment.apiBaseUrl}/jobs`;

  constructor(
    private http: HttpClient,
    private auth: AuthService            
  ) {}

 

  
  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.baseUrl);
  }

  
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

  
  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.baseUrl}/${id}`);
  }


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


  deleteJob(jobId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${jobId}`);
  }


  getJobsByCreator(): Observable<Job[]> {
  
    const user = this.auth.userSnapshot;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    const creatorId = user.id;

   
    return this.http.get<Job[]>(`${this.baseUrl}/creator/${creatorId}`);
  }



}
