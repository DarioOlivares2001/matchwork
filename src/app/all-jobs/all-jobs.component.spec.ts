import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllJobsComponent } from './all-jobs.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AllJobsComponent', () => {
  let component: AllJobsComponent;
  let fixture: ComponentFixture<AllJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AllJobsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AllJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});