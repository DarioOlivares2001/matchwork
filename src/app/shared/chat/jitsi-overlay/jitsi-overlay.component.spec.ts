import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JitsiOverlayComponent } from './jitsi-overlay.component';

describe('JitsiOverlayComponent', () => {
  let component: JitsiOverlayComponent;
  let fixture: ComponentFixture<JitsiOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JitsiOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JitsiOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
