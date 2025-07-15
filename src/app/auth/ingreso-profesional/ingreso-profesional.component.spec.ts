import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { IngresoProfesionalComponent } from './ingreso-profesional.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { ChatOverlayService } from '../../services/chat-overlay.service';
import { Router } from '@angular/router';

describe('IngresoProfesionalComponent', () => {
  let component: IngresoProfesionalComponent;
  let fixture: ComponentFixture<IngresoProfesionalComponent>;
  // User de mentira, pero con todos los campos que pide el modelo
  const fakeUser = {
    id: 1,
    nombre: 'Fake User',
    correo: 'fake@correo.com',
    rol: 'TRABAJADOR'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, IngresoProfesionalComponent],
      providers: [
        AuthService,
        PerfilService,
        ChatOverlayService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('debería llamar a loginProfesional con los datos correctos', fakeAsync(() => {
    const authService = TestBed.inject(AuthService);
    const overlay = TestBed.inject(ChatOverlayService);
    const router = TestBed.inject(Router);
    const fakeUser = { id: 1, nombre: 'Fake User', correo: 'fake@correo.com', rol: 'TRABAJADOR' };

    spyOn(authService, 'loginProfesional').and.returnValue(Promise.resolve({ usuario: fakeUser, perfil: {} }));
    spyOn(overlay, 'close');
    spyOn(router, 'navigate');

    component.email = 'test@correo.com';
    component.password = '123456';

    component.login();
    flush();

    expect(authService.loginProfesional).toHaveBeenCalledWith('test@correo.com', '123456');
    expect(overlay.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard-profesional', 'perfil']);
  }));

  it('debería navegar a crear-perfil si perfil es null', fakeAsync(() => {
    const authService = TestBed.inject(AuthService);
    const overlay = TestBed.inject(ChatOverlayService);
    const router = TestBed.inject(Router);
    const fakeUser = { id: 1, nombre: 'Fake User', correo: 'fake@correo.com', rol: 'TRABAJADOR' };

    spyOn(authService, 'loginProfesional').and.returnValue(Promise.resolve({ usuario: fakeUser, perfil: null }));
    spyOn(overlay, 'close');
    spyOn(router, 'navigate');

    component.email = 'otro@correo.com';
    component.password = 'abcdef';

    component.login();
    flush();

    expect(authService.loginProfesional).toHaveBeenCalledWith('otro@correo.com', 'abcdef');
    expect(overlay.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard-profesional', 'crear-perfil']);
  }));

  it('debería mostrar el error en el template si hay error', () => {
    component.error = 'Fallo';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.auth-error');
    expect(el.textContent).toContain('Fallo');
  });

  it('debería mostrar "Credenciales incorrectas" si el error es string plano', fakeAsync(() => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'loginProfesional').and.returnValue(Promise.reject('algun error string plano'));

    component.email = 'fail@correo.com';
    component.password = 'wrongpass';

    component.login();
    flush();

    expect(component.error).toBe('Credenciales incorrectas');
  }));

});
