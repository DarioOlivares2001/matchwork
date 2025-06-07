import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInviteModalComponent } from './video-invite-modal.component';

describe('VideoInviteModalComponent', () => {
  let component: VideoInviteModalComponent;
  let fixture: ComponentFixture<VideoInviteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoInviteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoInviteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
