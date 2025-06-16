// src/app/job-detail/job-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { JobService, Job } from '../services/job.service';
import { AuthService, User } from '../services/auth.service';
import { PostulacionService, Postulacion } from '../services/postulacion.service';
import { PerfilService, PerfilProfesional } from '../services/perfil.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  cargando = false;

  // Estado de la modal
  showPostularModal = false;
  // Paso interno: elegir o subir
  modalStep: 'choose' | 'upload' = 'choose';
  // URL del CV de perfil (si existe)
  profileCvUrl: string | null = null;

  // Postulación
  yaPostulado = false;
  fechaPostulacion: string | null | undefined = null;

  // Toast
  mensajeToast: string | null = null;

  private fromRoute: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    public auth: AuthService,
    private postulacionService: PostulacionService,
    private perfilService: PerfilService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? null;
  }

  ngOnInit() {
    this.cargando = true;
    this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        return this.jobService.getJobById(id).pipe(
          switchMap(job => {
            this.job = job;
            this.cargando = false;
            if (this.auth.isLoggedIn()) {
              const u = this.auth.userSnapshot!;
              return this.postulacionService.yaPostulado(u.id, id).pipe(
                tap(ex => this.yaPostulado = ex),
                switchMap(() => of(job))
              );
            }
            return of(job);
          })
        );
      })
    ).subscribe({
      next: () => {
        if (this.yaPostulado) {
          const u = this.auth.userSnapshot!;
          this.postulacionService.getPostulacionesPorUsuario(u.id)
            .subscribe(list => {
              const p = list.find(x => x.trabajo.id === this.job!.id);
              this.fechaPostulacion = p?.fechaPostulacion ?? null;
            });
        }
      },
      error: err => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  volver() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/jobs']);
      return;
    }
    switch (this.fromRoute) {
      case 'match':        this.router.navigate(['/dashboard-profesional', 'match']); break;
      case 'otros-trabajos': this.router.navigate(['/dashboard-profesional', 'otros-trabajos']); break;
      case 'postulaciones':  this.router.navigate(['/dashboard-profesional', 'postulaciones']); break;
      default:              this.router.navigate(['/dashboard-profesional', 'otros-trabajos']); break;
    }
  }

  // Abre la modal y decide el paso según si tienes CV en perfil
  openPostularModal() {
    const u = this.auth.userSnapshot;
    if (!u) return;
    this.perfilService.getPerfil(u.id).subscribe(perf => {
      this.profileCvUrl = perf.cvUrl;
      this.modalStep = perf.cvUrl ? 'choose' : 'upload';
      this.showPostularModal = true;
    });
  }

  closeModal() {
    this.showPostularModal = false;
  }

  // Caso: usar el CV existente
  postularConCvExistente() {
    const u = this.auth.userSnapshot!;
    this.postular(u.id, this.job!.id, this.profileCvUrl!);
    this.closeModal();
  }

  // Ir al paso de subir nuevo CV
  irAPasoUpload() {
    this.modalStep = 'upload';
  }

  // Maneja el `<input type="file">` del modal
  onCvFileSelected(event: Event) {
    const u = this.auth.userSnapshot!;
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // 1) sube al perfil
    this.perfilService.uploadCV(u.id, file).subscribe({
      next: res => {
        this.profileCvUrl = res.cvUrl;
        // 2) postula con la nueva URL
        this.postular(u.id, this.job!.id, res.cvUrl);
        this.closeModal();
      },
      error: err => {
        console.error('Error subiendo CV:', err);
        this.mostrarToast('⚠ No pudimos subir tu CV.');
      }
    });
  }

  // Llama internamente a la API de postulación
  private postular(usuarioId: number, trabajoId: number, cvUrl: string) {
    this.postulacionService.postular(usuarioId, trabajoId, cvUrl).subscribe({
      next: () => {
        this.yaPostulado = true;
        this.mostrarToast('✔ Te postulaste con tu CV.');
      },
      error: err => {
        console.error('Error al postular:', err);
        this.mostrarToast('⚠ Error al enviar tu postulación.');
      }
    });
  }

  private mostrarToast(texto: string) {
    this.mensajeToast = texto;
    setTimeout(() => this.mensajeToast = null, 3000);
  }
}
