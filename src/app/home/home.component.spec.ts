import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent }             from './home.component';
import { JobService }                from '../services/job.service';
import { AuthService }               from '../services/auth.service';
import { ActivatedRoute }            from '@angular/router';

import { provideHttpClient }         from '@angular/common/http';
import { provideHttpClientTesting }  from '@angular/common/http/testing';
import { of }                        from 'rxjs';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  /* ── mocks ─────────────────────────────────────── */
  const jobServiceMock = {
    getLatestJobs: jasmine.createSpy().and.returnValue(
      of([
        {
          id: 1,
          titulo: 'Dev',
          empresa: 'Foo',
          tipo: 'Full-Time',
          ubicacion: 'Santiago',
          fechaPublicacion: new Date().toISOString(),
          logoUrl: '',
          creatorId: 123,
          descripcion: 'Desarrollar cosas',
          sueldo: 1_200_000
        }
      ])
    )
  };

  const authServiceMock = { userSnapshot: { id: 123 } };

  const routeMock = {
    snapshot: { paramMap: { get: () => '123' } }
  };
  /* ──────────────────────────────────────────────── */

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:  [ HomeComponent ],
      providers: [
        provideHttpClient(),        // HttpClient real
        provideHttpClientTesting()  // backend fake para tests
      ]
    })
      // 👉  AQUÍ se inyectan los mocks **dentro** del stand-alone
      .overrideComponent(HomeComponent, {
        set: {
          providers: [
            { provide: JobService,   useValue: jobServiceMock },
            { provide: AuthService,  useValue: authServiceMock },
            { provide: ActivatedRoute, useValue: routeMock }
          ]
        }
      })
      .compileComponents();

    fixture   = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs on ngOnInit', () => {
    expect(jobServiceMock.getLatestJobs).toHaveBeenCalled();
    expect(component.jobs.length).toBeGreaterThan(0);
  });
});
