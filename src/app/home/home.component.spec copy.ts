import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { JobService } from '../services/job.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockJobService: any;

  beforeEach(async () => {
    mockJobService = {
      getLatestJobs: jasmine.createSpy().and.returnValue(of([
        {
          id: 1,
          titulo: 'Desarrollador Angular',
          empresa: 'TechCorp',
          tipo: 'Full-Time',
          ubicacion: 'Santiago',
          fechaPublicacion: new Date(),
          logoUrl: ''
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        HomeComponent
      ],
      providers: [
        { provide: JobService, useValue: mockJobService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar trabajos en ngOnInit', () => {
    expect(mockJobService.getLatestJobs).toHaveBeenCalled();
    expect(component.jobs.length).toBeGreaterThan(0);
  });
});
