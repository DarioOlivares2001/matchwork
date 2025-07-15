import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { RegistroEmpresaComponent } from './registro-empresa.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // 👈 AGREGA ESTO
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('RegistroEmpresaComponent', () => {
  let component: RegistroEmpresaComponent;
  let fixture: ComponentFixture<RegistroEmpresaComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule, // 👈 AGREGA ESTO
        RegistroEmpresaComponent
      ],
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['signUpCognito']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroEmpresaComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería marcar error si las contraseñas no coinciden', async () => {
    component.contrasena = 'abc123';
    component.confirm = 'abc999';
    component.error = '';
    await component.register();
    expect(component.error).toBe('Las contraseñas no coinciden');
  });

  // it('debería llamar signUpCognito y navegar si todo OK', fakeAsync(() => {
  //   authService.signUpCognito.and.returnValue(Promise.resolve());
  //   component.nombre = 'MiEmpresa';
  //   component.correo = 'correo@empresa.com';
  //   component.contrasena = '123456';
  //   component.confirm = '123456';

  //   // 👇 ESPÍA EL MÉTODO NAVIGATE
  //   spyOn(router, 'navigate').and.callThrough();

  //   component.register();
  //   flush();

  //   expect(authService.signUpCognito).toHaveBeenCalledWith('MiEmpresa', 'correo@empresa.com', '123456', 'EMPRESA');
  //   expect(router.navigate).toHaveBeenCalledWith(['/confirmar-cuenta'], {
  //     queryParams: {
  //       email: 'correo@empresa.com',
  //       role: 'EMPRESA',
  //       redirect: '/ingreso-empresa'
  //     }
  //   });
  // }));


  it('debería mostrar el mensaje de error si signUpCognito lanza error con mensaje', fakeAsync(() => {
    authService.signUpCognito.and.returnValue(Promise.reject({ message: 'Algo salió mal' }));
    component.nombre = 'MiEmpresa';
    component.correo = 'correo@empresa.com';
    component.contrasena = '123456';
    component.confirm = '123456';
    component.register();
    flush();
    expect(component.error).toBe('Algo salió mal');
  }));

  it('debería mostrar "Error al registrar" si signUpCognito lanza error sin mensaje', fakeAsync(() => {
    authService.signUpCognito.and.returnValue(Promise.reject({}));
    component.nombre = 'MiEmpresa';
    component.correo = 'correo@empresa.com';
    component.contrasena = '123456';
    component.confirm = '123456';
    component.register();
    flush();
    expect(component.error).toBe('Error al registrar');
  }));

});
