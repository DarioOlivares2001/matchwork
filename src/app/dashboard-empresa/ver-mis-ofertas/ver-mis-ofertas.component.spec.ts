import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMisOfertasComponent } from './ver-mis-ofertas.component';

describe('VerMisOfertasComponent', () => {
  let component: VerMisOfertasComponent;
  let fixture: ComponentFixture<VerMisOfertasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMisOfertasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMisOfertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
