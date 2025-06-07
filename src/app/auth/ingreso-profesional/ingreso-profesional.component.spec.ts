import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoProfesionalComponent } from './ingreso-profesional.component';

describe('IngresoProfesionalComponent', () => {
  let component: IngresoProfesionalComponent;
  let fixture: ComponentFixture<IngresoProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoProfesionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
