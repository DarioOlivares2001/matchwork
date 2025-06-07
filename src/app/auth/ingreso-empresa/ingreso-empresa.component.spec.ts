import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoEmpresaComponent } from './ingreso-empresa.component';

describe('IngresoEmpresaComponent', () => {
  let component: IngresoEmpresaComponent;
  let fixture: ComponentFixture<IngresoEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
