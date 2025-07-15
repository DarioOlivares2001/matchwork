import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardProfesionalComponent } from './dashboard-profesional.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardProfesionalComponent', () => {
  let component: DashboardProfesionalComponent;
  let fixture: ComponentFixture<DashboardProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardProfesionalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});