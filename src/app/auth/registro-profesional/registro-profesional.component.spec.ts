import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroProfesionalComponent } from './registro-profesional.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('RegistroProfesionalComponent', () => {
  let component: RegistroProfesionalComponent;
  let fixture: ComponentFixture<RegistroProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RegistroProfesionalComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});