import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarOfertaComponent } from './cargar-oferta.component';

describe('CargarOfertaComponent', () => {
  let component: CargarOfertaComponent;
  let fixture: ComponentFixture<CargarOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarOfertaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargarOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
