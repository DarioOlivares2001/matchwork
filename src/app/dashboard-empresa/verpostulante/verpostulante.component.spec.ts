import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerpostulanteComponent } from './verpostulante.component';

describe('VerpostulanteComponent', () => {
  let component: VerpostulanteComponent;
  let fixture: ComponentFixture<VerpostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerpostulanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerpostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
