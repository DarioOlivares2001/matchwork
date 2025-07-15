import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilEmpresaComponent } from './perfil-empresa.component';
import { AuthService } from '../../services/auth.service';
import { PerfilEmpresaService } from '../../services/perfil-empresa.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('PerfilEmpresaComponent', () => {
  let component: PerfilEmpresaComponent;
  let fixture: ComponentFixture<PerfilEmpresaComponent>;

  let mockAuthService: any;
  let mockPerfilSvc: any;
  let mockRouter: any;

  const fakeUser = { id: 1, nombre: 'Empresa', rol: 'EMPRESA' };
  const fakePerfil = {
    id: 1,
    nombreFantasia: 'Empresa X',
    logoUrl: 'logo.png',
    descripcion: 'Test',
    industria: 'Tech',
    ubicacion: 'Chile'
  };

  beforeEach(async () => {
    mockAuthService = {
      user$: of(fakeUser)
    };

    mockPerfilSvc = {
      getPerfilEmpresa: jasmine.createSpy('getPerfilEmpresa'),
      savePerfilEmpresa: jasmine.createSpy('savePerfilEmpresa'),
      uploadLogo: jasmine.createSpy('uploadLogo')
    };

    // 👇 Valor por defecto para que NUNCA explote el .pipe
    mockPerfilSvc.getPerfilEmpresa.and.returnValue(of(null));

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [PerfilEmpresaComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PerfilEmpresaService, useValue: mockPerfilSvc },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilEmpresaComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar perfil correctamente en ngOnInit', () => {
    mockPerfilSvc.getPerfilEmpresa.and.returnValue(of(fakePerfil));
    component.ngOnInit();
    expect(component.perfil).toEqual(fakePerfil);
    expect(component.isEditing).toBeFalse();
    expect(component.editable.nombreFantasia).toBe(fakePerfil.nombreFantasia);
  });

  it('debería manejar perfil nulo y dejar en modo edición', () => {
    mockPerfilSvc.getPerfilEmpresa.and.returnValue(of(null));
    component.ngOnInit();
    expect(component.perfil).toBeNull();
    expect(component.isEditing).toBeTrue();
    expect(component.editable.nombreFantasia).toBe('');
  });

  it('toggleEdit debería activar edición', () => {
    component.isEditing = false;
    component.toggleEdit();
    expect(component.isEditing).toBeTrue();
  });

  it('toggleEdit debería cargar perfil y salir de edición', () => {
    component.perfil = fakePerfil;
    component.isEditing = true;
    component.editable.nombreFantasia = 'Otro';
    component.toggleEdit();
    expect(component.isEditing).toBeFalse();
    expect(component.editable.nombreFantasia).toBe(fakePerfil.nombreFantasia);
  });

  it('toggleEdit debería navegar si no hay perfil y sale de edición', () => {
    component.perfil = null;
    component.isEditing = true;
    component.toggleEdit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard-empresa']);
  });

  it('saveChanges debería guardar cambios y actualizar perfil', () => {
    component.editable = { ...fakePerfil };
    component.perfil = { ...fakePerfil };
    component.isEditing = true;
    mockPerfilSvc.savePerfilEmpresa.and.returnValue(of(fakePerfil));
    component.ngOnInit(); // para setear el user$
    component.saveChanges();
    expect(component.perfil).toEqual(fakePerfil);
    expect(component.isEditing).toBeFalse();
  });

  it('saveChanges debería no actualizar si savePerfilEmpresa retorna null', () => {
    component.editable = { ...fakePerfil };
    component.isEditing = true;
    mockPerfilSvc.savePerfilEmpresa.and.returnValue(of(null));
    component.ngOnInit();
    component.saveChanges();
    expect(component.isEditing).toBeTrue(); // No sale de edición
  });

  it('onLogoSelected debería actualizar logoUrl', () => {
    const event = {
      target: {
        files: [new Blob([''], { type: 'image/png' }) as File]
      }
    } as any;

    mockPerfilSvc.uploadLogo.and.returnValue(of({ logoUrl: 'nueva.png' }));
    component.ngOnInit();
    component.onLogoSelected(event);
    expect(mockPerfilSvc.uploadLogo).toHaveBeenCalled();
    expect(component.editable.logoUrl).toBe('nueva.png');
  });

  it('onLogoSelected no hace nada si no hay archivos', () => {
    const event = { target: { files: [] } } as any;
    component.onLogoSelected(event);
    expect(mockPerfilSvc.uploadLogo).not.toHaveBeenCalled();
  });

});
