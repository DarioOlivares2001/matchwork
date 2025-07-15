import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargarOfertaComponent } from './cargar-oferta.component';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('CargarOfertaComponent', () => {
  let component: CargarOfertaComponent;
  let fixture: ComponentFixture<CargarOfertaComponent>;
  let mockRouter: any;
  let mockJobSvc: any;

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockJobSvc = { createJob: jasmine.createSpy('createJob') };

    await TestBed.configureTestingModule({
      imports: [CargarOfertaComponent, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: JobService, useValue: mockJobSvc },
        { provide: AuthService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CargarOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe llamar a jobSvc.createJob en submit válido y setear createdJob', () => {
    // Prepara mock con todos los campos requeridos por Job
    const jobMock = {
      ...component.jobPayload,
      id: 99,
      creatorId: 1,
      fechaPublicacion: '2024-01-01T00:00:00Z'
    };
    mockJobSvc.createJob.and.returnValue(of(jobMock));
    const form = { invalid: false, value: {}, reset: () => { } } as any;

    component.onSubmit(form);

    expect(mockJobSvc.createJob).toHaveBeenCalledWith(component.jobPayload);
    expect(component.createdJob).toEqual(jobMock);
    expect(component.isEditing).toBeFalse();
    expect(component.loading).toBeFalse();
  });

  it('editAgain debe rellenar jobPayload desde createdJob y activar edición', () => {
    component.createdJob = {
      titulo: 'a',
      descripcion: 'b',
      empresa: 'c',
      ubicacion: 'd',
      tipo: 'Full_Time',
      sueldo: 1000,
      creatorId: 1,
      fechaPublicacion: '2024-01-01T00:00:00Z',
      id: 88
    } as any;
    component.isEditing = false;
    component.editAgain();
    expect(component.isEditing).toBeTrue();
    expect(component.jobPayload.titulo).toBe('a');
  });


  it('no debe llamar a jobSvc.createJob si form es inválido', () => {
    const form = { invalid: true } as any;
    component.onSubmit(form);
    expect(mockJobSvc.createJob).not.toHaveBeenCalled();
  });

  it('debe mostrar errorMsg si createJob tira error', () => {
    mockJobSvc.createJob.and.returnValue(throwError({ error: { message: 'fail' } }));
    const form = { invalid: false } as any;
    component.onSubmit(form);
    expect(component.errorMsg).toBe('fail');
    expect(component.loading).toBeFalse();
  });

  it('editAgain debe rellenar jobPayload desde createdJob y activar edición', () => {
    component.createdJob = {
      titulo: 'a',
      descripcion: 'b',
      empresa: 'c',
      ubicacion: 'd',
      tipo: 'Full_Time',
      sueldo: 1000
    } as any;
    component.isEditing = false;
    component.editAgain();
    expect(component.isEditing).toBeTrue();
    expect(component.jobPayload.titulo).toBe('a');
  });

  it('editAgain no hace nada si no hay createdJob', () => {
    component.createdJob = null;
    component.jobPayload.titulo = 'x';
    component.editAgain();
    expect(component.jobPayload.titulo).toBe('x');
  });

  it('cancelCreate debe navegar al dashboard', () => {
    component.cancelCreate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard-empresa']);
  });

});
