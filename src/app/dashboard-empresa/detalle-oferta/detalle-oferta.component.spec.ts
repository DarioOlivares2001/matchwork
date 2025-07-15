import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetalleOfertaComponent } from './detalle-oferta.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JobService } from '../../services/job.service';
import { PostulacionService } from '../../services/postulacion.service';

describe('DetalleOfertaComponent', () => {
  let component: DetalleOfertaComponent;
  let fixture: ComponentFixture<DetalleOfertaComponent>;
  let jobServiceMock: any;
  let postulacionServiceMock: any;
  let routerMock: any;

  const jobMock = {
    id: 7,
    creatorId: 10, // 👈 agregado!
    titulo: 'Desarrollador Angular',
    descripcion: 'Construir frontend',
    empresa: 'DevCo',
    ubicacion: 'Santiago, Chile',
    tipo: 'Full_Time',
    sueldo: 1800000,
    fechaPublicacion: '2024-07-12',
    fechaLimitePostulacion: '2024-07-30',
    nivelExperiencia: 'Senior',
    categoria: 'TI',
    departamento: 'Desarrollo',
    vacantes: 3,
    remoto: true,
    duracionContrato: 'Indefinido',
    requisitos: 'Experiencia previa',
    habilidadesRequeridas: 'Angular, TS',
    beneficios: 'Seguro, bono',
    idiomas: 'Español, Inglés',
    companyWebsite: 'https://devco.cl',
    logoUrl: '',
    etiquetas: 'angular,typescript'
  };

  const postulantesMock = [
    {
      usuarioId: 1,
      nombreUsuario: 'Pepito',
      tituloProfesional: 'Ingeniero',
      presentacion: 'Me gusta Angular',
      fotoUrl: ''
    }
  ];

  beforeEach(async () => {
    jobServiceMock = {
      getJobById: jasmine.createSpy('getJobById').and.returnValue(of(jobMock)),
      updateJob: jasmine.createSpy('updateJob').and.returnValue(of(jobMock))
    };
    postulacionServiceMock = {
      getPostulantesPorTrabajo: jasmine.createSpy('getPostulantesPorTrabajo').and.returnValue(of(postulantesMock))
    };
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DetalleOfertaComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
        { provide: Router, useValue: routerMock },
        { provide: 'JobService', useValue: jobServiceMock },
        { provide: 'PostulacionService', useValue: postulacionServiceMock },
      ]
    })
      .overrideComponent(DetalleOfertaComponent, {
        set: {
          providers: [
            { provide: JobService, useValue: jobServiceMock },
            { provide: PostulacionService, useValue: postulacionServiceMock },
            { provide: Router, useValue: routerMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(DetalleOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('carga los datos de la oferta correctamente', () => {
    expect(jobServiceMock.getJobById).toHaveBeenCalledWith(7);
    expect(component.oferta?.titulo).toBe('Desarrollador Angular');
    expect(component.editPayload.titulo).toBe('Desarrollador Angular');
    expect(component.cargandoOferta).toBeFalse();
  });

  it('carga los postulantes correctamente', () => {
    expect(postulacionServiceMock.getPostulantesPorTrabajo).toHaveBeenCalledWith(7);
    expect(component.postulantes.length).toBe(1);
    expect(component.postulantes[0].nombreUsuario).toBe('Pepito');
    expect(component.cargandoPostulantes).toBeFalse();
  });

  it('puede alternar modo edición', () => {
    component.isEditing = false;
    component.toggleEditMode();
    expect(component.isEditing).toBeTrue();
    component.toggleEditMode();
    expect(component.isEditing).toBeFalse();
  });

  it('guarda cambios y actualiza la oferta', fakeAsync(() => {
    component.oferta = { ...jobMock };
    component.isEditing = true;
    component.editPayload.titulo = 'Nuevo título';
    jobServiceMock.updateJob.and.returnValue(of({ ...jobMock, titulo: 'Nuevo título' }));

    component.guardarCambios();
    tick();
    expect(jobServiceMock.updateJob).toHaveBeenCalled();
    expect(component.isEditing).toBeFalse();
    expect(component.loadingGuardar).toBeFalse();
    expect(component.oferta?.titulo).toBe('Nuevo título');
  }));

  it('maneja error al guardar cambios', fakeAsync(() => {
    spyOn(console, 'error'); // <-- Esto silencia el error
    component.oferta = { ...jobMock };
    component.isEditing = true;
    jobServiceMock.updateJob.and.returnValue(throwError(() => new Error('Error api')));
    component.guardarCambios();
    tick();
    expect(component.errorGuardar).toContain('No se pudieron guardar los cambios');
    expect(component.loadingGuardar).toBeFalse();
    expect(component.isEditing).toBeTrue();
  }));

  it('navega a mis ofertas al volver', () => {
    component.volverAMisOfertas();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard-empresa/ver-mis-ofertas']);
  });

  it('navega al perfil del postulante', () => {
    component.verPerfilPostulante(77);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard-empresa/ver-postulante', 77]);
  });

  it('maneja error al cargar oferta', fakeAsync(() => {
    spyOn(console, 'error'); // <-- Aquí también silencias
    jobServiceMock.getJobById.and.returnValue(throwError(() => new Error('fail')));
    component.cargarDetalleOferta();
    tick();
    expect(component.errorOferta).toContain('No se pudo cargar la oferta');
    expect(component.cargandoOferta).toBeFalse();
  }));

  it('maneja error al cargar oferta', fakeAsync(() => {
    spyOn(console, 'error'); // <-- Y aquí también (por si acaso)
    jobServiceMock.getJobById.and.returnValue(throwError(() => new Error('fail')));
    component.cargarDetalleOferta();
    tick();
    expect(component.errorOferta).toContain('No se pudo cargar la oferta');
    expect(component.cargandoOferta).toBeFalse();
  }));

  it('maneja error al cargar postulantes', fakeAsync(() => {
    spyOn(console, 'error'); // <-- Y aquí
    postulacionServiceMock.getPostulantesPorTrabajo.and.returnValue(throwError(() => new Error('fail')));
    component.cargarPostulantes();
    tick();
    expect(component.errorPostulantes).toContain('No se pudieron cargar los postulantes');
    expect(component.cargandoPostulantes).toBeFalse();
  }));
});
