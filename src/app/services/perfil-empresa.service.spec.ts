import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerfilEmpresaService } from './perfil-empresa.service';
import { PerfilEmpresa } from '../models/perfil-empresa';
import { environment } from '../../environments/environments';

describe('PerfilEmpresaService', () => {
  let service: PerfilEmpresaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/usuarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PerfilEmpresaService]
    });
    service = TestBed.inject(PerfilEmpresaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('getPerfilEmpresa hace GET correctamente', () => {
    const fake: PerfilEmpresa = {
      id: 1,
      nombreFantasia: 'MiEmpresa',
      logoUrl: 'logo.png',
      descripcion: 'Empresa dedicada a...',
      industria: 'Tecnología',
      ubicacion: 'Santiago'
    };
    service.getPerfilEmpresa(99).subscribe(r => {
      expect(r).toEqual(fake);
    });
    const req = http.expectOne(`${baseUrl}/99/perfil-empresa`);
    expect(req.request.method).toBe('GET');
    req.flush(fake);
  });

  it('savePerfilEmpresa hace POST correctamente', () => {
    const data: PerfilEmpresa = {
      id: 2,
      nombreFantasia: 'OtraEmpresa',
      logoUrl: 'otra.png',
      descripcion: 'Otra descripción',
      industria: 'Comercio',
      ubicacion: 'Valparaíso'
    };
    service.savePerfilEmpresa(12, data).subscribe(r => {
      expect(r).toEqual(data);
    });
    const req = http.expectOne(`${baseUrl}/12/perfil-empresa`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(data);
  });

  it('uploadLogo postea archivo y retorna la url', () => {
    const file = new File(['contenido'], 'logo.png');
    const resp = { logoUrl: 'url/logo.png', message: 'ok' };

    service.uploadLogo(22, file).subscribe(r => {
      expect(r).toEqual(resp);
    });

    const req = http.expectOne(`${baseUrl}/22/perfil-empresa/logo`);
    expect(req.request.method).toBe('POST');
    // El body debe ser FormData
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(resp);
  });
});
