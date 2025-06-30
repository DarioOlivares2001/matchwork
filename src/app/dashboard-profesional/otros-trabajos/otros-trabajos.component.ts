import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService, Job } from '../../services/job.service';
import { PerfilEmpresaService } from '../../services/perfil-empresa.service';

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

  constructor(private jobService: JobService, private perfilEmpresaService: PerfilEmpresaService) {}

  ngOnInit() {
  this.jobService.getAllJobs().subscribe(allJobs => {
    this.jobs = allJobs
      .sort((a, b) => {
        const fechaA = new Date(a.fechaPublicacion).getTime();
        const fechaB = new Date(b.fechaPublicacion).getTime();
        return fechaB - fechaA;
      });

    // Agregar logo si falta
    for (let job of this.jobs) {
      if (!job.logoUrl) {
        this.perfilEmpresaService.getPerfilEmpresa(job.creatorId).subscribe({
          next: perfil => {
            job.logoUrl = perfil.logoUrl || '/assets/images/default-company.png';
          },
          error: () => {
            job.logoUrl = '/assets/images/default-company.png';
          }
        });
      }
    }
  });
}
}
