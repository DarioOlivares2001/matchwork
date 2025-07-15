import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatchService } from './match.service';
import { TrabajoSugerido } from './trabajo-sugerido.model';
import { environment } from '../../environments/environments';

describe('MatchService', () => {
  let service: MatchService;
  let http: HttpTestingController;
  const API_BASE = `${environment.apiBaseUrl}/match`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatchService]
    });
    service = TestBed.inject(MatchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('getTrabajosSugeridos hace GET con params', () => {
    const usuarioId = 7;
    const page = 1;
    const size = 5;

    const trabajos: TrabajoSugerido[] = [
      {
        id: 11,
        creatorId: 5,
        titulo: 'Dev',
        descripcion: 'Fullstack',
        empresa: 'Empresa1',
        ubicacion: 'Santiago',
        tipo: 'Full-time',
        sueldo: 1800000,
        fechaPublicacion: '2024-07-10',
        estado: 'Abierto',
        puntajeAfinidad: 95,
        // campos opcionales pueden omitirse o poner undefined/null
      }
    ];

    service.getTrabajosSugeridos(usuarioId, page, size).subscribe(resp => {
      expect(resp).toEqual(trabajos);
    });

    const req = http.expectOne(
      r =>
        r.method === 'GET' &&
        r.url === `${API_BASE}/trabajos` &&
        r.params.get('usuarioId') === usuarioId.toString() &&
        r.params.get('page') === page.toString() &&
        r.params.get('size') === size.toString()
    );
    req.flush(trabajos);
  });

  it('getTrabajosSugeridos usa valores por defecto para page y size', () => {
    const usuarioId = 2;
    const defaultPage = 0;
    const defaultSize = 10;
    const trabajos: TrabajoSugerido[] = [
      {
        id: 21,
        creatorId: 4,
        titulo: 'QA Tester',
        descripcion: 'Testing apps',
        empresa: 'EmpresaQA',
        ubicacion: 'Valpo',
        tipo: 'Remoto',
        sueldo: 1500000,
        fechaPublicacion: '2024-07-11',
        estado: 'Abierto',
        puntajeAfinidad: 88,
      }
    ];

    service.getTrabajosSugeridos(usuarioId).subscribe(resp => {
      expect(resp).toEqual(trabajos);
    });

    const req = http.expectOne(
      r =>
        r.method === 'GET' &&
        r.url === `${API_BASE}/trabajos` &&
        r.params.get('usuarioId') === usuarioId.toString() &&
        r.params.get('page') === defaultPage.toString() &&
        r.params.get('size') === defaultSize.toString()
    );
    req.flush(trabajos);
  });

});
