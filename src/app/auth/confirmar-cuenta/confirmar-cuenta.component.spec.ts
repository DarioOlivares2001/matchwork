import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ConfirmarCuentaComponent } from './confirmar-cuenta.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

describe('ConfirmarCuentaComponent', () => {
  let component: ConfirmarCuentaComponent;
  let fixture: ComponentFixture<ConfirmarCuentaComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let routerMock: any;

  beforeEach(async () => {
    routerMock = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ConfirmarCuentaComponent],
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['confirmSignUp']) },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ email: 'mock@email.com', role: 'EMPRESA', redirect: '/ingreso-empresa' }),
            snapshot: {
              paramMap: {
                get: () => 'mock-token'
              }
            }
          }
        },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmarCuentaComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los queryParams en el ngOnInit', () => {
    expect(component.email).toBe('mock@email.com');
    expect(component.role).toBe('EMPRESA');
    expect(component.redirect).toBe('/ingreso-empresa');
  });

  it('debería confirmar la cuenta correctamente y redirigir', fakeAsync(() => {
    authService.confirmSignUp.and.returnValue(Promise.resolve());
    component.code = '123456';
    component.confirm();
    // Esperar promesa y timeout
    flush();
    expect(component.message).toBe('Cuenta confirmada correctamente');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/ingreso-empresa');
  }));

  it('debería mostrar error si la confirmación falla con mensaje', fakeAsync(() => {
    authService.confirmSignUp.and.returnValue(Promise.reject({ message: 'Código inválido' }));
    component.code = '111111';
    component.confirm();
    flush();
    expect(component.error).toBe('Código inválido');
  }));

  it('debería mostrar error genérico si la confirmación falla sin mensaje', fakeAsync(() => {
    authService.confirmSignUp.and.returnValue(Promise.reject({}));
    component.code = '222222';
    component.confirm();
    flush();
    expect(component.error).toBe('Error al confirmar cuenta');
  }));
});
