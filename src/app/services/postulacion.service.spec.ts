import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostulacionService, Postulacion, PostulanteConPerfil } from './postulacion.service';
import { environment } from '../../environments/environments';

describe('PostulacionService', () => {
  let service: PostulacionService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/postulaciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostulacionService]
    });
    service = TestBed.inject(PostulacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener perfil completo', () => {
    const mockPerfil: PostulanteConPerfil = {
      postulacionId: 1, usuarioId: 2, nombreUsuario: 'Pepe',
      tituloProfesional: 'Ingeniero', fotoUrl: 'url', presentacion: 'yo', fechaPostulacion: 'hoy'
    };
    service.getPerfilCompleto(2).subscribe(r => {
      expect(r).toEqual(mockPerfil);
    });
    const req = http.expectOne(`${baseUrl}/usuario/2/perfil-completo`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPerfil);
  });

  it('debería obtener postulantes por trabajo', () => {
    const arr: PostulanteConPerfil[] = [{ postulacionId: 1, usuarioId: 3, nombreUsuario: 'a', tituloProfesional: 'b', fotoUrl: '', presentacion: '', fechaPostulacion: '' }];
    service.getPostulantesPorTrabajo(33).subscribe(r => {
      expect(r).toEqual(arr);
    });
    const req = http.expectOne(`${baseUrl}/trabajo/33/postulantes-con-perfil`);
    expect(req.request.method).toBe('GET');
    req.flush(arr);
  });

  it('debería postular (POST) incluyendo cvUrl', () => {
    const resp: Postulacion = {
      id: 1,
      usuarioId: 2,
      trabajo: {
        id: 3, titulo: 'dev', descripcion: '', empresa: '', ubicacion: '', tipo: '', sueldo: 1,
        fechaPublicacion: '', estado: ''
      },
      fechaPostulacion: 'hoy',
      cvUrl: 'file'
    };
    service.postular(2, 3, 'file').subscribe(r => {
      expect(r).toEqual(resp);
    });
    const req = http.expectOne(r => 
      r.method === 'POST' &&
      r.url === baseUrl &&
      r.params.get('usuarioId') === '2' &&
      r.params.get('trabajoId') === '3' &&
      r.params.get('cvUrl') === 'file'
    );
    req.flush(resp);
  });

  it('debería postular (POST) sin cvUrl', () => {
    const resp: Postulacion = {
      id: 1, usuarioId: 2, trabajo: { id: 3, titulo: '', descripcion: '', empresa: '', ubicacion: '', tipo: '', sueldo: 0, fechaPublicacion: '', estado: '' }, fechaPostulacion: 'hoy'
    };
    service.postular(2, 3).subscribe(r => {
      expect(r).toEqual(resp);
    });
    const req = http.expectOne(r => 
      r.method === 'POST' &&
      r.url === baseUrl &&
      r.params.get('usuarioId') === '2' &&
      r.params.get('trabajoId') === '3' &&
      !r.params.has('cvUrl')
    );
    req.flush(resp);
  });

  it('debería obtener postulaciones por usuario', () => {
    const arr: Postulacion[] = [];
    service.getPostulacionesPorUsuario(7).subscribe(r => {
      expect(r).toEqual(arr);
    });
    const req = http.expectOne(`${baseUrl}/usuario/7`);
    expect(req.request.method).toBe('GET');
    req.flush(arr);
  });

  it('debería consultar si ya postuló', () => {
    service.yaPostulado(10, 20).subscribe(r => {
      expect(r).toBeTrue();
    });
    const req = http.expectOne(r => 
      r.method === 'GET' &&
      r.url === `${baseUrl}/existe` &&
      r.params.get('usuarioId') === '10' &&
      r.params.get('trabajoId') === '20'
    );
    req.flush(true);
  });
});
