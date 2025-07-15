import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardEmpresaComponent } from './dashboard-empresa.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('DashboardEmpresaComponent', () => {
  let component: DashboardEmpresaComponent;
  let fixture: ComponentFixture<DashboardEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardEmpresaComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});