import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VerpostulanteComponent } from './verpostulante.component';
import { PerfilService } from '../../services/perfil.service';
import { ChatOverlayService } from '../../services/chat-overlay.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

describe('VerpostulanteComponent', () => {
  let component: VerpostulanteComponent;
  let fixture: ComponentFixture<VerpostulanteComponent>;
  let perfilServiceMock: any;
  let overlayMock: any;

  const perfilMock = {
    usuario: { id: 123, nombre: 'Juanito', correo: 'juan@correo.com' },
    fotoUrl: '',
    titulo: 'Ingeniero',
    presentacion: 'Hola soy Juan',
    disponibilidad: 'Inmediata',
    modoTrabajo: 'Remoto',
    experiencias: [],
    estudios: [],
    cvUrl: 'https://cv.pdf'
  };

  beforeEach(async () => {
    perfilServiceMock = {
      getPerfilCompleto: jasmine.createSpy('getPerfilCompleto').and.returnValue(of(perfilMock)),
      getHabilidadesPorUsuario: jasmine.createSpy('getHabilidadesPorUsuario').and.returnValue(of([{ nombre: 'Angular' }]))
    };
    overlayMock = { open: jasmine.createSpy('open') };

    await TestBed.configureTestingModule({
      imports: [VerpostulanteComponent],
      providers: [
        { provide: PerfilService, useValue: perfilServiceMock },
        { provide: ChatOverlayService, useValue: overlayMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: (v: any) => v } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerpostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar perfil y habilidades', () => {
    expect(perfilServiceMock.getPerfilCompleto).toHaveBeenCalledWith(123);
    expect(component.perfil.usuario.nombre).toBe('Juanito');
    expect(component.habilidades).toContain('Angular');
    expect(component.cargando).toBe(false);
    expect(component.error).toBe('');
  });

  it('debería mostrar error si falla el perfil', fakeAsync(() => {
    perfilServiceMock.getPerfilCompleto.and.returnValue(throwError(() => 'fail'));
    fixture = TestBed.createComponent(VerpostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    expect(component.error).toContain('No se pudo cargar el perfil');
    expect(component.cargando).toBe(false);
  }));

  it('debería abrir chat al iniciarConversacion', () => {
    component.perfil = perfilMock as any;
    component.iniciarConversacion();
    expect(overlayMock.open).toHaveBeenCalledWith(jasmine.objectContaining({
      userId: 123,
      nombre: 'Juanito'
    }));
  });

  it('debería abrir y cerrar modal de CV', () => {
    component.perfil = perfilMock as any;
    component.openCvModal();
    expect(component.showCvModal).toBeTrue();
    component.closeCvModal();
    expect(component.showCvModal).toBeFalse();
  });
});
