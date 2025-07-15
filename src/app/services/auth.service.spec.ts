import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environments';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const fakeUser: User = {
    id: 1,
    nombre: 'Chanchi',
    correo: 'chanchi@duoc.cl',
    rol: 'TRABAJADOR',
    comuna: 'Melipilla'
  };

  const api = `${environment.apiBaseUrl}/usuarios`;

  beforeEach(() => {
    localStorage.clear(); // limpiar antes de cada test

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener usuario desde DB por correo', () => {
    service.obtenerUsuarioDesdeDb('chanchi@duoc.cl').subscribe((user) => {
      expect(user.correo).toBe('chanchi@duoc.cl');
    });

    const req = httpMock.expectOne(`${api}/by-email/chanchi@duoc.cl`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeUser);
  });

  it('debería guardar usuario en la DB', () => {
    const nuevoUsuario: User = {
      id: 0,
      nombre: 'Sebastián',
      correo: 'washo@duoc.cl',
      rol: 'EMPRESA'
    };

    service.saveUserInDb(nuevoUsuario.nombre, nuevoUsuario.correo, nuevoUsuario.rol).subscribe((user) => {
      expect(user.nombre).toBe('Sebastián');
    });

    const req = httpMock.expectOne(`${api}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...nuevoUsuario, id: 99 });
  });

  it('debería sincronizar usuario en la DB (syncUserInDb)', async () => {
    spyOn(service, 'getCognitoSub').and.returnValue(Promise.resolve('sub-123'));

    const result$ = await service.syncUserInDb(fakeUser);
    result$.subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${api}/sync`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombre: fakeUser.nombre,
      correo: fakeUser.correo,
      rol: fakeUser.rol,
      comuna: fakeUser.comuna,
      cognitoSub: 'sub-123',
      usaCognito: true
    });

    req.flush({ success: true });
  });

  it('debería retornar el token desde localStorage', () => {
    localStorage.setItem('token', 'abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('debería retornar true si hay token en localStorage', () => {
    localStorage.setItem('token', 'token-de-prueba');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('debería limpiar localStorage y cerrar sesión al hacer logout', async () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify(fakeUser));
    spyOn<any>(console, 'error'); // por si hay logs

    await service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.userSnapshot).toBeNull();
  });
});
