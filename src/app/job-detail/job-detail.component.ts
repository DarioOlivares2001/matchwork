import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule }       from '@angular/common';

import { JobService, Job }    from '../services/job.service';
import { AuthService, User }  from '../services/auth.service';
import { PostulacionService, Postulacion } from '../services/postulacion.service';

import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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

  // Bandera para saber si el usuario YA se postuló
  yaPostulado: boolean = false;
  // Fecha en que se postuló (puede ser string, null o undefined)
  fechaPostulacion: string | null | undefined = null;

  // Mensaje que se mostrará en el “toast” (éxito / error)
  mensajeToast: string | null = null;
  private fromRoute: string | null = null;

  

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    public auth: AuthService,                  // para saber si está logueado
    private postulacionService: PostulacionService
  ) {
     // Al crear el componente, intentamos leer el state “from”
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? null;
    // Si no viene state, quedará null
  }

  ngOnInit() {
    this.cargando = true;

    // 1) Obtenemos el ID de trabajo desde la URL
    this.route.params
      .pipe(
        switchMap(params => {
          const trabajoId = +params['id'];

          // 2) Primero: cargo el detalle del trabajo
          return this.jobService.getJobById(trabajoId)
            .pipe(
              switchMap(jobData => {
                this.job = jobData;
                this.cargando = false;

                // 3) Si el usuario está logueado, consulto si ya se postuló a este trabajo:
                if (this.auth.isLoggedIn()) {
                  const user: User | null = this.auth.userSnapshot;
                  if (user) {
                    return this.postulacionService
                      .yaPostulado(user.id, trabajoId)
                      .pipe(
                        tap(existe => {
                          this.yaPostulado = existe;
                        }),
                        // Después de marcar `yaPostulado`, regreso el `jobData` para seguir
                        switchMap(() => of(jobData))
                      );
                  }
                }
                // Si no está logueado o no hay usuario, simplemente devuelvo el jobData
                return of(jobData);
              })
            );
        })
      )
      .subscribe({
        next: (_job) => {
          // Ya tenemos job cargado y yaPostulado definido
          if (this.yaPostulado) {
            // Si resultó ser que ya postularon, obtenemos la Postulacion para sacar la fecha
            const user: User | null = this.auth.userSnapshot;
            if (user && this.job) {
              // 4) Llamo a GET /api/postulaciones/usuario/{usuarioId} y busco la que tenga trabajo.id === this.job.id
              this.postulacionService.getPostulacionesPorUsuario(user.id)
                .subscribe(lista => {
                  const encontrada = lista.find(p => p.trabajo.id === this.job!.id);
                  if (encontrada) {
                    // Aquí puede venir un string o undefined; fechaPostulacion admite ambos
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
    // 1) Si NO está logueado => regreso a /jobs
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/jobs']);
      return;
    }

    // 2) Si está logueado y tengo un fromRoute específico,
    //    navego a la ruta correspondiente dentro del dashboard-profesional:
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

      // Si no vino ningún from (o vino null), podemos usar una ruta por defecto:
      default:
        // Por ejemplo, “Otros Trabajos” como vista por defecto:
        this.router.navigate(['/dashboard-profesional', 'otros-trabajos']);
        return;
    }
  }

  /**
   * Este método se dispara cuando el usuario hace click en “Postular”.
   * 1) Obtiene el `usuarioId` desde AuthService
   * 2) Llama a PostulacionService.postular(usuarioId, trabajoId)
   * 3) Maneja la respuesta: guarda `yaPostulado=true` y asigna fechaPostulacion,
   *    además de mostrar un “toast” estilizado.
   */
  apply(trabajoId: number) {
    if (!this.auth.isLoggedIn()) {
      // Si no está logueado no permitimos continuar
      return;
    }

    const user: User | null = this.auth.userSnapshot;
    if (!user) {
      console.error('No se pudo obtener usuario logueado.');
      return;
    }

    this.postulacionService.postular(user.id, trabajoId).subscribe({
      next: (resp: Postulacion) => {
        // Si se creó correctamente la postulacion...
        this.yaPostulado = true;
        // `resp.fechaPostulacion` puede ser string | undefined; lo guardamos:
        this.fechaPostulacion = resp.fechaPostulacion ?? null;

        // Mostramos un toast de éxito
        this.mostrarToast('✔ Tu postulación ha sido enviada con éxito.');
      },
      error: (err) => {
        console.error('Error al postularse:', err);
        // Si el backend devolvió “Ya estás postulado...”, igualmente marcamos yaPostulado=true
        if (err?.error?.message?.includes('Ya estás postulado')) {
          this.yaPostulado = true;
          // Obtenemos la fecha de la postulación existente (opcional):
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

 

  /**
   * Asigna `mensajeToast` (para mostrarlo en pantalla) y
   * al cabo de 3 segundos lo limpia para que desaparezca.
   */
  private mostrarToast(texto: string) {
    this.mensajeToast = texto;
    setTimeout(() => {
      this.mensajeToast = null;
    }, 3000);
  }
}
