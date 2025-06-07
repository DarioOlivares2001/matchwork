import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProfesionalComponent } from './dashboard-profesional.component';

describe('DashboardProfesionalComponent', () => {
  let component: DashboardProfesionalComponent;
  let fixture: ComponentFixture<DashboardProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProfesionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
