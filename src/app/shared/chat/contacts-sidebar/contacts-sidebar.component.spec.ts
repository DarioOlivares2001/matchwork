import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsSidebarComponent } from './contacts-sidebar.component';

describe('ContactsSidebarComponent', () => {
  let component: ContactsSidebarComponent;
  let fixture: ComponentFixture<ContactsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
