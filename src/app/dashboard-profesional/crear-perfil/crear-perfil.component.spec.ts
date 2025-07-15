import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPerfilComponent } from './crear-perfil.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

// Stub usuario completo como lo espera tu modelo
const userMock = {
  id: 1,
  nombre: 'Dardilla',
  correo: 'dardilla@correo.com',
  rol: 'PROFESIONAL',
  comuna: '',
  habilidades: []
};

// AuthService mock
const authServiceStub = {
  user$: of(userMock)
};

describe('CrearPerfilComponent', () => {
  let component: CrearPerfilComponent;
  let fixture: ComponentFixture<CrearPerfilComponent>;
  let perfilSvc: PerfilService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CrearPerfilComponent],
      providers: [
        PerfilService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPerfilComponent);
    component = fixture.componentInstance;
    perfilSvc = TestBed.inject(PerfilService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería crear el perfil y navegar', () => {
    spyOn(perfilSvc, 'updatePerfil').and.returnValue(of({
      id: 1,
      usuario: userMock,
      titulo: '',
      fotoUrl: '',
      presentacion: '',
      disponibilidad: '',
      modoTrabajo: '',
      cvUrl: '',
      experiencias: [],
      estudios: []
    }));

    component.user = userMock; // asegúrate de tener el usuario

    component.crearPerfil();

    expect(perfilSvc.updatePerfil).toHaveBeenCalledWith(1, component.editable);
    expect(router.navigateByUrl).toHaveBeenCalledWith('dashboard-profesional/perfil');
  });

  it('no debería llamar updatePerfil si no hay usuario', () => {
    component.user = null;
    spyOn(perfilSvc, 'updatePerfil');
    component.crearPerfil();
    expect(perfilSvc.updatePerfil).not.toHaveBeenCalled();
  });

  it('debería manejar error si updatePerfil falla', () => {
    spyOn(perfilSvc, 'updatePerfil').and.returnValue({
      subscribe: (_success: any, errorCb: Function) => errorCb('fail')
    } as any);
    component.user = userMock;
    spyOn(console, 'error');
    component.crearPerfil();
    expect(console.error).toHaveBeenCalledWith('fail');
  });

  it('debería dejar user como null si no hay usuario en ngOnInit', () => {
    // Parcheamos user$ para este test
    const auth = TestBed.inject(AuthService) as any;
    auth.user$ = of(null);

    component.user = userMock;
    component.ngOnInit();
    expect(component.user).toBeNull();
  });

  it('no debería navegar ni llamar updatePerfil si no hay user', () => {
    component.user = null;
    const spy = spyOn(perfilSvc, 'updatePerfil');
    component.crearPerfil();
    expect(spy).not.toHaveBeenCalled();
  });


});
