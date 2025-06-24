import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { JobService, Job } from '../services/job.service';
import { AuthService, User } from '../services/auth.service';
import { PostulacionService, Postulacion } from '../services/postulacion.service';
import { PerfilService, PerfilProfesional } from '../services/perfil.service';

import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  cargando = false;
  showPostularModal = false;
  modalStep: 'choose' | 'upload' = 'choose';
  cvFile?: File | null = null;

  yaPostulado: boolean = false;
  fechaPostulacion: string | null | undefined = null;
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

    this.route.params
      .pipe(
        switchMap(params => {
          const trabajoId = +params['id'];

          return this.jobService.getJobById(trabajoId).pipe(
            switchMap(jobData => {
              this.job = jobData;
              this.cargando = false;

              if (this.auth.isLoggedIn()) {
                const user: User | null = this.auth.userSnapshot;
                if (user) {
                  return this.postulacionService
                    .yaPostulado(user.id, trabajoId)
                    .pipe(
                      tap(existe => {
                        this.yaPostulado = existe;
                      }),
                      switchMap(() => of(jobData))
                    );
                }
              }
              return of(jobData);
            })
          );
        })
      )
      .subscribe({
        next: (_job) => {
          if (this.yaPostulado) {
            const user: User | null = this.auth.userSnapshot;
            if (user && this.job) {
              this.postulacionService.getPostulacionesPorUsuario(user.id).subscribe(lista => {
                const encontrada = lista.find(p => p.trabajo.id === this.job!.id);
                if (encontrada) {
                  this.fechaPostulacion = encontrada.fechaPostulacion;
                }
              });
            }
          }
        },
        error: (err) => {
          console.error('Error al cargar detalle de trabajo o verificar postulación:', err);
          this.cargando = false;
        }
      });
  }

  volver(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/jobs']);
      return;
    }

    switch (this.fromRoute) {
      case 'match':
        this.router.navigate(['/dashboard-profesional', 'match']);
        return;
      case 'otros-trabajos':
        this.router.navigate(['/dashboard-profesional', 'otros-trabajos']);
        return;
      case 'postulaciones':
        this.router.navigate(['/dashboard-profesional', 'postulaciones']);
        return;
      default:
        this.router.navigate(['/dashboard-profesional', 'otros-trabajos']);
        return;
    }
  }

  apply(trabajoId: number) {
    if (!this.auth.isLoggedIn()) return;

    const user: User | null = this.auth.userSnapshot;
    if (!user) {
      console.error('No se pudo obtener usuario logueado.');
      return;
    }

    this.postulacionService.postular(user.id, trabajoId).subscribe({
      next: (resp: Postulacion) => {
        this.yaPostulado = true;
        this.fechaPostulacion = resp.fechaPostulacion ?? null;
        this.mostrarToast('✔ Tu postulación ha sido enviada con éxito.');
      },
      error: (err) => {
        console.error('Error al postularse:', err);
        if (err?.error?.message?.includes('Ya estás postulado')) {
          this.yaPostulado = true;
          const user2 = this.auth.userSnapshot;
          if (user2 && this.job) {
            this.postulacionService.getPostulacionesPorUsuario(user2.id)
              .subscribe(lista => {
                const encontrada = lista.find(p => p.trabajo.id === this.job!.id);
                if (encontrada) {
                  this.fechaPostulacion = encontrada.fechaPostulacion ?? null;
                }
              });
          }
          this.mostrarToast('✔ Ya estabas postulando a este trabajo.');
        } else {
          this.mostrarToast('⚠ Ocurrió un error al postularte. Intenta nuevamente.');
        }
      }
    });
  }

  openPostularModal() {
    this.modalStep = 'choose';
    this.showPostularModal = true;
  }

  closeModal() {
    this.showPostularModal = false;
  }

  applyWithCv() {
    const user = this.auth.userSnapshot;
    if (!user || !this.job) return;

    this.perfilService.getPerfil(user.id).pipe(
      tap(perf => {
        const cvUrl = perf.cvUrl || null;
        this.postulacionService.postular(user.id, this.job!.id, cvUrl)
          .subscribe(() => {
            this.closeModal();
            this.mostrarToast('✔ Te postulaste y se adjuntó tu CV.');
            this.yaPostulado = true;
          });
      })
    ).subscribe();
  }

  applyWithoutCv() {
    const user = this.auth.userSnapshot;
    if (!user || !this.job) return;

    this.postulacionService.postular(user.id, this.job.id, null)
      .subscribe(() => {
        this.closeModal();
        this.mostrarToast('✔ Te postulaste sin CV.');
        this.yaPostulado = true;
      });
  }

  postularConCvExistente() {
    this.applyWithCv();
  }

  irAPasoUpload() {
    this.modalStep = 'upload';
  }

  onCvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cvFile = input.files[0];

      const user = this.auth.userSnapshot;
      if (!user || !this.job) return;

      this.perfilService.uploadCV(user.id, this.cvFile).subscribe({
        next: (resp: { cvUrl: string; message: string }) => {
          const cvUrl = resp.cvUrl;

          this.postulacionService.postular(user.id, this.job!.id, cvUrl).subscribe(() => {
            this.closeModal();
            this.mostrarToast(`✔ Te postulaste con el nuevo CV.`);
            this.yaPostulado = true;
          });
        },
        error: (err) => {
          console.error('Error al subir el CV:', err);
          this.mostrarToast('⚠ Error al subir el CV. Intenta nuevamente.');
        }
      });
    }
  }

  private mostrarToast(texto: string) {
    this.mensajeToast = texto;
    setTimeout(() => {
      this.mensajeToast = null;
    }, 3000);
  }
}
