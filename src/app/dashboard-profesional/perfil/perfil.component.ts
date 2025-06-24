// src/app/dashboard-profesional/perfil/perfil.component.ts

import { Component, OnInit }         from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule }               from '@angular/forms';

import { Subject, of }               from 'rxjs';
import {
  switchMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap
} from 'rxjs/operators';

import {
  PerfilService,
  PerfilProfesional,
  Habilidad      // <-- importamos la interfaz Habilidad
} from '../../services/perfil.service';

import { AuthService, User }         from '../../services/auth.service';

interface Experiencia {
  empresa: string;
  cargo: string;
  descripcion: string;
  fechaDesde: string; // formato "YYYY-MM"
  fechaHasta?: string;
}

interface Estudio {
  titulo: string;
  institucion: string;
  descripcion: string;
  fechaDesde: string; // formato "YYYY-MM"
  fechaHasta?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ CommonModule, FormsModule, NgIf, NgFor ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  perfil?: PerfilProfesional;
  user?: User | null;

  // Control de modo “ver” vs “editar”
  isEditing = false;

  // Objeto que contendrá TODOS LOS VALORES editables del formulario
  editable = {
    // ──────────────────────
    // 1) DATOS PROFESIONALES
    // ──────────────────────
    titulo: '',
    fotoUrl: null as string | null,
    presentacion: '',
    disponibilidad: '',
    modoTrabajo: '',

    // ──────────────────────
    // 2) HABILIDADES (solo nombres, para mostrar chips)
    // ──────────────────────
    habilidades: [] as string[],

    // ──────────────────────
    // 3) EXPERIENCIAS
    // ──────────────────────
    experiencias: [] as Experiencia[],

    // ──────────────────────
    // 4) ESTUDIOS
    // ──────────────────────
    estudios: [] as Estudio[]
  };

  /*** ────────────────────────────────────── ***/
  /***   Variables auxiliares para “HABILIDADES”  ***/
  /*** ────────────────────────────────────── ***/
  newHabilidadInput = '';               // Texto que el usuario escribe en el input
  sugerencias: Habilidad[] = [];        // Lista de sugerencias traídas desde el servidor
  cargandoSugerencias = false;          // Flag para mostrar “Buscando…” o spinner

  // → Para eliminar necesitamos saber el ID de cada habilidad (no solo el nombre).
  //   Por eso mantenemos un mapa nombre→id.  
  mapaNombreAId: { [nombre: string]: number } = {};

  /*** ─────────────────────────────────────－ ***/
  /***   Campos temporales para EXPERIENCIAS y ESTUDIOS ***/
  /*** ───────────────────────────────────── ***/
  newExperiencia: Experiencia = {
    empresa: '',
    cargo: '',
    descripcion: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  newEstudio: Estudio = {
    titulo: '',
    institucion: '',
    descripcion: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  constructor(
    private perfilService: PerfilService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // 1) Cuando se emita el usuario logueado (user$), pedimos el perfil completo
    this.auth.user$
      .pipe(
        filter(u => u !== null),
        switchMap(u => {
          this.user = u!;
          return this.perfilService.getPerfil(u!.id);
        })
      )
      .subscribe({
        next: perfilData => {
          this.perfil = perfilData;

          // ───────────────────────────────────────────────────
          // Rellenamos el objeto “editable” con TODO lo que vino:
          // ───────────────────────────────────────────────────
          // 1) Datos profesionales
          this.editable.titulo         = perfilData.titulo || '';
          this.editable.fotoUrl        = perfilData.fotoUrl || null;
          this.editable.presentacion   = perfilData.presentacion || '';
          this.editable.disponibilidad = perfilData.disponibilidad || '';
          this.editable.modoTrabajo    = perfilData.modoTrabajo || '';

          // 2) HABILIDADES: pedimos ahora como Habilidad[]
          this.perfilService.getHabilidadesPorUsuario(perfilData.id)
            .subscribe({
              next: (listaHabs: Habilidad[]) => {
                // a) Rellenar sólo los nombres
                this.editable.habilidades = listaHabs.map(h => h.nombre);
                // b) Armar el mapa nombre→id para poder eliminar luego
                this.mapaNombreAId = {};
                listaHabs.forEach(h => {
                  this.mapaNombreAId[h.nombre] = h.id;
                });
              },
              error: err => {
                console.error('No se pudieron cargar las habilidades del usuario:', err);
                this.editable.habilidades = [];
                this.mapaNombreAId = {};
              }
            });

          // 3) EXPERIENCIAS: convertimos su fecha a “YYYY-MM”
          this.editable.experiencias = perfilData.experiencias.map(exp => ({
            empresa: exp.empresa,
            cargo: exp.cargo,
            descripcion: exp.descripcion,
            fechaDesde: exp.fechaDesde ? exp.fechaDesde.substring(0, 7) : '',
            fechaHasta: exp.fechaHasta ? exp.fechaHasta.substring(0, 7) : ''
          }));

          // 4) ESTUDIOS: idem
          this.editable.estudios = perfilData.estudios.map(est => ({
            titulo: est.titulo,
            institucion: est.institucion,
            descripcion: est.descripcion,
            fechaDesde: est.fechaDesde ? est.fechaDesde.substring(0, 7) : '',
            fechaHasta: est.fechaHasta ? est.fechaHasta.substring(0, 7) : ''
          }));
        },
        error: err => {
          console.error('Error al cargar perfil completo:', err);
        }
      });
  }

  /**
   * Alterna entre modo “Lectura” y “Edición”. 
   * Si el usuario cancela (toggle de editar → false), restauramos el estado original
   * a como estaba en this.perfil.
   */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.perfil) {
      // Restaurar TODO el objeto “editable” exactamente con los valores de this.perfil
      this.editable.titulo         = this.perfil.titulo || '';
      this.editable.fotoUrl        = this.perfil.fotoUrl || null;
      this.editable.presentacion   = this.perfil.presentacion || '';
      this.editable.disponibilidad = this.perfil.disponibilidad || '';
      this.editable.modoTrabajo    = this.perfil.modoTrabajo || '';

      // Volver a pedir las habilidades (AHORA como Habilidad[])
      this.perfilService.getHabilidadesPorUsuario(this.perfil.id)
        .subscribe({
          next: (listaHabs: Habilidad[]) => {
            this.editable.habilidades = listaHabs.map(h => h.nombre);
            this.mapaNombreAId = {};
            listaHabs.forEach(h => {
              this.mapaNombreAId[h.nombre] = h.id;
            });
          },
          error: () => {
            this.editable.habilidades = [];
            this.mapaNombreAId = {};
          }
        });

      // Restaurar experiencias y estudios:
      this.editable.experiencias = this.perfil.experiencias.map(exp => ({
        empresa: exp.empresa,
        cargo: exp.cargo,
        descripcion: exp.descripcion,
        fechaDesde: exp.fechaDesde ? exp.fechaDesde.substring(0, 7) : '',
        fechaHasta: exp.fechaHasta ? exp.fechaHasta.substring(0, 7) : ''
      }));
      this.editable.estudios = this.perfil.estudios.map(est => ({
        titulo: est.titulo,
        institucion: est.institucion,
        descripcion: est.descripcion,
        fechaDesde: est.fechaDesde ? est.fechaDesde.substring(0, 7) : '',
        fechaHasta: est.fechaHasta ? est.fechaHasta.substring(0, 7) : ''
      }));
    }
  }

  /**
   * Método que se dispara cuando el usuario presiona el botón “Guardar Cambios”:
   * Actualiza TODO el perfil (datos profesionales + experiencias + estudios).
   * Las habilidades ya las estamos guardando de forma independiente (al seleccionar o eliminar).
   */
  saveChanges(): void {
    if (!this.user) return;

    const payload: any = {
      titulo: this.editable.titulo,
      fotoUrl: this.editable.fotoUrl,
      presentacion: this.editable.presentacion,
      disponibilidad: this.editable.disponibilidad,
      modoTrabajo: this.editable.modoTrabajo,
      experiencias: this.editable.experiencias.map(e => ({
        empresa: e.empresa,
        cargo: e.cargo,
        descripcion: e.descripcion,
        fechaDesde: e.fechaDesde ? `${e.fechaDesde}-01` : null,
        fechaHasta: e.fechaHasta ? `${e.fechaHasta}-01` : null
      })),
      estudios: this.editable.estudios.map(e => ({
        titulo: e.titulo,
        institucion: e.institucion,
        descripcion: e.descripcion,
        fechaDesde: e.fechaDesde ? `${e.fechaDesde}-01` : null,
        fechaHasta: e.fechaHasta ? `${e.fechaHasta}-01` : null
      }))
    };

    this.perfilService.updatePerfil(this.user.id, payload).subscribe({
      next: updated => {
        this.perfil = updated;
        // Reconstruimos todo igual que en ngOnInit (incluyendo habilidades)
        this.editable.titulo       = updated.titulo;
        this.editable.fotoUrl      = updated.fotoUrl;
        this.editable.presentacion = updated.presentacion;
        this.editable.disponibilidad = updated.disponibilidad;
        this.editable.modoTrabajo  = updated.modoTrabajo;

        this.perfilService.getHabilidadesPorUsuario(updated.id)
          .subscribe({
            next: (listaHabs: Habilidad[]) => {
              this.editable.habilidades = listaHabs.map(h => h.nombre);
              this.mapaNombreAId = {};
              listaHabs.forEach(h => {
                this.mapaNombreAId[h.nombre] = h.id;
              });
            },
            error: () => {
              this.editable.habilidades = [];
              this.mapaNombreAId = {};
            }
          });

        this.editable.experiencias = updated.experiencias.map(exp => ({
          empresa: exp.empresa,
          cargo: exp.cargo,
          descripcion: exp.descripcion,
          fechaDesde: exp.fechaDesde ? exp.fechaDesde.substring(0, 7) : '',
          fechaHasta: exp.fechaHasta ? exp.fechaHasta.substring(0, 7) : ''
        }));
        this.editable.estudios = updated.estudios.map(est => ({
          titulo: est.titulo,
          institucion: est.institucion,
          descripcion: est.descripcion,
          fechaDesde: est.fechaDesde ? est.fechaDesde.substring(0, 7) : '',
          fechaHasta: est.fechaHasta ? est.fechaHasta.substring(0, 7) : ''
        }));

        this.isEditing = false;
      },
      error: err => {
        console.error('Error al guardar perfil:', err);
      }
    });
  }

  // ───────────────────────────────────────────────────────────────
  //                      MÉTODOS PARA “HABILIDADES”
  // ───────────────────────────────────────────────────────────────

  onHabilidadInput(event: any): void {
    const texto = (event.target as HTMLInputElement).value.trim();
    this.newHabilidadInput = texto;

    if (texto.length < 3) {
      this.sugerencias = [];
      return;
    }

    this.cargandoSugerencias = true;
    of(texto).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(q => q.length >= 3),
      switchMap(q => this.perfilService.searchHabilidades(q)),
      tap(() => {
        this.cargandoSugerencias = false;
      })
    ).subscribe({
      next: lista => {
        this.sugerencias = lista || [];
      },
      error: err => {
        console.error('Error al buscar sugerencias de habilidades:', err);
        this.sugerencias = [];
        this.cargandoSugerencias = false;
      }
    });
  }

  selectHabilidad(hab: Habilidad): void {
    if (!this.user) return;

    if (this.editable.habilidades.includes(hab.nombre)) {
      this.newHabilidadInput = '';
      this.sugerencias = [];
      return;
    }

    this.perfilService.asociarHabilidadAlUsuario(this.user.id, hab.id).subscribe({
        next: () => {
            this.editable.habilidades.push(hab.nombre);
            this.mapaNombreAId[hab.nombre] = hab.id;
            this.newHabilidadInput = '';
            this.sugerencias = [];
        },
        error: err => {
            console.error('Error al asociar la habilidad:', err);
        }
    });
  }

  removeHabilidad(index: number): void {
    const nombre = this.editable.habilidades[index];
    const idHabilidad = this.mapaNombreAId[nombre];

    if (idHabilidad == null) {
        console.warn('No se encontró el ID de la habilidad a eliminar:', nombre);
        return;
    }

    this.perfilService.eliminarHabilidadDelUsuario(idHabilidad)
        .subscribe({
            next: (respuestaTexto: string) => {
                this.editable.habilidades.splice(index, 1);
                delete this.mapaNombreAId[nombre];
            },
            error: err => {
                console.error('Error al eliminar la habilidad del usuario:', err);
            }
        });
  }

  // ───────────────────────────────────────────────────────────────
  //               MÉTODOS PARA EXPERIENCIAS y ESTUDIOS (sin cambios)
  // ───────────────────────────────────────────────────────────────
  addExperiencia(): void {
    const e = this.newExperiencia;
    if (!e.empresa || !e.cargo || !e.fechaDesde) {
      return;
    }
    this.editable.experiencias.push({
      empresa: e.empresa,
      cargo: e.cargo,
      descripcion: e.descripcion,
      fechaDesde: e.fechaDesde,
      fechaHasta: e.fechaHasta
    });
    this.newExperiencia = { empresa: '', cargo: '', descripcion: '', fechaDesde: '', fechaHasta: '' };
  }

  removeExperiencia(index: number): void {
    this.editable.experiencias.splice(index, 1);
  }

  addEstudio(): void {
    const e = this.newEstudio;
    if (!e.titulo || !e.institucion || !e.fechaDesde) {
      return;
    }
    this.editable.estudios.push({
      titulo: e.titulo,
      institucion: e.institucion,
      descripcion: e.descripcion,
      fechaDesde: e.fechaDesde,
      fechaHasta: e.fechaHasta
    });
    this.newEstudio = { titulo: '', institucion: '', descripcion: '', fechaDesde: '', fechaHasta: '' };
  }

  removeEstudio(index: number): void {
    this.editable.estudios.splice(index, 1);
  }

 onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.user) return;
    const file = input.files[0];

    this.perfilService.uploadPhoto(this.user.id, file).subscribe({
      next: res => {
        // actualizo la URL en el formulario
        this.editable.fotoUrl = res.fotoUrl;
        // ya está disparado el perfilRefresh$ dentro del servicio
      },
      error: err => console.error('Error subiendo foto:', err)
    });
  }

  onCVSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.user) return;
    const file = input.files[0];
    this.perfilService.uploadCV(this.user.id, file).subscribe({
      next: res => console.log('CV URL:', res.cvUrl),
      error: err => console.error('Error subiendo CV:', err)
    });
  }
}
