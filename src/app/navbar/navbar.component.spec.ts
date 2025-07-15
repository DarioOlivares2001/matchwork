import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService, User } from '../services/auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fakeUser: User = {
    id: 1,
    nombre: 'Chanchita',
    correo: 'chanchi@duoc.cl',
    rol: 'EMPRESA',
    comuna: 'Melipilla'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      user$: of(fakeUser)
    });

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent], // ✅ aquí va el componente
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).overrideComponent(NavbarComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authServiceSpy },
          { provide: Router, useValue: routerSpy }
        ]
      }
    }).compileComponents();


    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a logout y navegar al home', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería mostrar el nombre del usuario logueado', (done) => {
    component.user$.subscribe(user => {
      expect(user?.nombre).toBe('Chanchita');
      done();
    });
  });
});
