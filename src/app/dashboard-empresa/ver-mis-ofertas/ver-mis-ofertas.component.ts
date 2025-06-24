// src/app/dashboard-empresa/ver-mis-ofertas/ver-mis-ofertas.component.ts
import { Component, OnInit }       from '@angular/core';
import { CommonModule }            from '@angular/common';
import { RouterModule, Router }    from '@angular/router';

import { JobService, Job }         from '../../services/job.service';
import { AuthService, User }       from '../../services/auth.service';

@Component({
  selector: 'app-ver-mis-ofertas',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './ver-mis-ofertas.component.html',
  styleUrls: ['./ver-mis-ofertas.component.css']
})
export class VerMisOfertasComponent implements OnInit {

  misOfertas: Job[] = [];
  cargando: boolean = false;
  errorMsg: string = '';

  constructor(
    private jobService: JobService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.errorMsg = '';

   
    this.jobService.getJobsByCreator().subscribe({
      next: (lista: Job[]) => {
        this.misOfertas = lista;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener mis ofertas:', err);
        this.errorMsg = 'No se pudieron cargar tus ofertas. Intenta más tarde.';
        this.cargando = false;
      }
    });
  }


  irADetalle(oferta: Job) {
    this.router.navigate(['/dashboard-empresa', 'mis-ofertas', oferta.id]);
  }

 
  crearNuevaOferta() {
    this.router.navigate(['/dashboard-empresa', 'cargar-oferta']);
  }
}
