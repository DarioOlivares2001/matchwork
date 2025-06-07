import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { JobService, Job }   from '../services/job.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getLatestJobs().subscribe(latests => {
      this.jobs = latests;
    });
  }
}
