import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService, Job } from '../../services/job.service';

@Component({
  selector: 'app-otros-trabajos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './otros-trabajos.component.html',
  styleUrls: ['./otros-trabajos.component.css']
})
export class OtrosTrabajosComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getAllJobs().subscribe(allJobs => {
   
      this.jobs = allJobs.sort((a, b) => {
        const fechaA = new Date(a.fechaPublicacion).getTime();
        const fechaB = new Date(b.fechaPublicacion).getTime();
        return fechaB - fechaA;
      });
    });
  }
}
