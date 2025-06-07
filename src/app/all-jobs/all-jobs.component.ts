import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router'; 
import { JobService, Job }   from '../services/job.service';

@Component({
  selector: 'app-all-jobs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,            
  ],
  templateUrl: './all-jobs.component.html',
  styleUrls: ['./all-jobs.component.css']
})
export class AllJobsComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getAllJobs().subscribe(all => {
      this.jobs = all;
    });
  }
}
