import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerfilService, PerfilProfesional, PerfilProfesionalCompleto, Habilidad } from './perfil.service';
import { environment } from '../../environments/environments';

describe('PerfilService', () => {
  let service: PerfilService;
  let http: HttpTestingController;
  const API = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PerfilService]
    });
    service = TestBed.inject(PerfilService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('getPerfil retorna un perfil', () => {
    const mockPerfil: PerfilProfesional = {
      id: 1,
      usuario: { id: 1, nombre: '', correo: '', rol: '', comuna: null, habilidades: [] },
      titulo: '', fotoUrl: null, cvUrl: null, presentacion: '',
      disponibilidad: '', modoTrabajo: '', experiencias: [], estudios: []
    };
    service.getPerfil(1).subscribe(r => expect(r).toEqual(mockPerfil));
    const req = http.expectOne(`${API}/usuarios/1/perfil-profesional`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPerfil);
  });

  it('getPerfilCompleto retorna perfil completo', () => { 
    const completo: PerfilProfesionalCompleto = {
      id: 1,
      usuario: { id: 1, nombre: '', correo: '', rol: '', comuna: null },
      titulo: '', fotoUrl: null, cvUrl: null, presentacion: '',
      disponibilidad: '', modoTrabajo: '', experiencias: [], estudios: []
    };
    service.getPerfilCompleto(1).subscribe(r => expect(r).toEqual(completo));
    const req = http.expectOne(`${API}/usuarios/1/perfil-profesional/completo`);
    expect(req.request.method).toBe('GET');
    req.flush(completo);
  });

  it('updatePerfil postea perfil y emite refresh$', () => {
    const mock = { id: 1 } as any;
    let emitido = false;
    service.perfilRefresh$.subscribe(() => emitido = true);

    service.updatePerfil(1, { titulo: 'nuevo' }).subscribe(r => expect(r).toEqual(mock));
    const req = http.expectOne(`${API}/usuarios/1/perfil-profesional`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ titulo: 'nuevo' });
    req.flush(mock);

    expect(emitido).toBeTrue();
  });

  it('getHabilidadesPorUsuario retorna array', () => {
    const mock: Habilidad[] = [{ id: 1, nombre: 'JS' }];
    service.getHabilidadesPorUsuario(2).subscribe(r => expect(r).toEqual(mock));
    const req = http.expectOne(`${API}/usuario-habilidades/usuario/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('searchHabilidades busca', () => {
    const res: Habilidad[] = [];
    service.searchHabilidades('test').subscribe(r => expect(r).toEqual(res));
    const req = http.expectOne(`${API}/habilidades/search?q=test`);
    expect(req.request.method).toBe('GET');
    req.flush(res);
  });

  it('asociarHabilidadAlUsuario postea', () => {
    const resp = { ok: true };
    service.asociarHabilidadAlUsuario(9, 8).subscribe(r => expect(r).toEqual(resp));
    const req = http.expectOne(`${API}/usuario-habilidades/usuario/9`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ habilidadId: 8 });
    req.flush(resp);
  });

  it('eliminarHabilidadDelUsuario borra y devuelve string', () => {
    service.eliminarHabilidadDelUsuario(17).subscribe(r => expect(r).toBe('ok'));
    const req = http.expectOne(`${API}/usuario-habilidades/17`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.responseType).toBe('text');
    req.flush('ok');
  });

  it('uploadPhoto postea archivo y emite refresh$', () => {
    const file = new File(['aaa'], 'foto.jpg');
    const resp = { fotoUrl: 'url', message: 'ok' };
    let emitido = false;
    service.perfilRefresh$.subscribe(() => emitido = true);

    service.uploadPhoto(2, file).subscribe(r => expect(r).toEqual(resp));
    const req = http.expectOne(`${API}/usuarios/2/perfil-profesional/foto`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(resp);
    expect(emitido).toBeTrue();
  });

  it('uploadCV postea archivo', () => {
    const file = new File(['bbb'], 'cv.pdf');
    const resp = { cvUrl: 'url', message: 'ok' };
    service.uploadCV(3, file).subscribe(r => expect(r).toEqual(resp));
    const req = http.expectOne(`${API}/usuarios/3/perfil-profesional/cv`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(resp);
  });

});
