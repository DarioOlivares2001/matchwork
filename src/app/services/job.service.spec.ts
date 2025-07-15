import { TestBed } from '@angular/core/testing';
import { JobService, JobRequest } from './job.service';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environments';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  const fakeUser = { id: 1, nombre: 'Daniela', correo: 'chanchi@duoc.cl', rol: 'EMPRESA' };
  const baseUrl = `${environment.apiBaseUrl}/jobs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JobService,
        {
          provide: AuthService,
          useValue: { userSnapshot: fakeUser }
        }
      ]
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // verifica que no queden requests colgando
  });

  it('debería obtener todos los trabajos', () => {
    service.getAllJobs().subscribe(jobs => {
      expect(jobs.length).toBe(1);
      expect(jobs[0].titulo).toBe('Desarrollador');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, titulo: 'Desarrollador' }]);
  });

  it('debería obtener los últimos trabajos ordenados por fecha', () => {
    const mockJobs = [
      { id: 1, fechaPublicacion: '2023-12-01T00:00:00Z' },
      { id: 2, fechaPublicacion: '2023-12-10T00:00:00Z' },
      { id: 3, fechaPublicacion: '2023-12-05T00:00:00Z' }
    ];

    service.getLatestJobs(2).subscribe(jobs => {
      expect(jobs.length).toBe(2);
      expect(jobs[0].id).toBe(2); // más reciente primero
      expect(jobs[1].id).toBe(3);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('debería obtener un trabajo por ID', () => {
    const jobId = 123;

    service.getJobById(jobId).subscribe(job => {
      expect(job.id).toBe(jobId);
    });

    const req = httpMock.expectOne(`${baseUrl}/${jobId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: jobId });
  });

  it('debería crear un trabajo con el ID del usuario', () => {
    const payload: JobRequest = {
      titulo: 'Nuevo Trabajo',
      descripcion: 'Una descripción',
      empresa: 'Empresa X',
      ubicacion: 'Melipilla',
      tipo: 'Full-Time',
      sueldo: 1000000
    };

    service.createJob(payload).subscribe(job => {
      expect(job.titulo).toBe('Nuevo Trabajo');
    });

    const req = httpMock.expectOne(`${baseUrl}?creatorId=${fakeUser.id}`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 99, ...payload });


  });
    it('debería actualizar un trabajo con el ID del usuario', () => {
    const jobId = 42;
    const payload: JobRequest = {
      titulo: 'Trabajo Actualizado',
      descripcion: 'Nueva descripción',
      empresa: 'Empresa Z',
      ubicacion: 'Valparaíso',
      tipo: 'Part-Time',
      sueldo: 900000
    };

    service.updateJob(jobId, payload).subscribe(job => {
      expect(job.titulo).toBe('Trabajo Actualizado');
    });

    const req = httpMock.expectOne(`${baseUrl}/${jobId}?creatorId=${fakeUser.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: jobId, ...payload });
  });

  it('debería eliminar un trabajo por ID', () => {
    const jobId = 77;

    service.deleteJob(jobId).subscribe(response => {
      expect(response).toBeNull(); // ✅ esto sí pasa // porque es void
    });

    const req = httpMock.expectOne(`${baseUrl}/${jobId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // sin body
  });

  it('debería obtener trabajos creados por el usuario autenticado', () => {
    service.getJobsByCreator().subscribe(jobs => {
      expect(jobs.length).toBe(2);
    });

    const req = httpMock.expectOne(`${baseUrl}/creator/${fakeUser.id}`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 1, titulo: 'Trabajo 1' },
      { id: 2, titulo: 'Trabajo 2' }
    ]);
  });

});

