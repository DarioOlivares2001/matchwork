import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { PostulacionService, Postulacion } from '../../services/postulacion.service';

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './postulaciones.component.html',
  styleUrls: ['./postulaciones.component.css']
})
export class PostulacionesComponent implements OnInit {
  postulaciones: Postulacion[] = [];
  cargando = false;

  constructor(
    private auth: AuthService,
    private postulacionService: PostulacionService
  ) {}

  ngOnInit(): void {
    // Solo cargamos si el usuario está logueado
    if (!this.auth.isLoggedIn()) {
      return;
    }
    const user: User | null = this.auth.userSnapshot;
    if (!user) {
      return;
    }

    this.cargando = true;
    this.postulacionService.getPostulacionesPorUsuario(user.id)
      .subscribe({
        next: lista => {
          // Opcionalmente podemos ordenar por fechaPostulacion descendiente:
          this.postulaciones = lista.sort((a, b) => {
            const fA = a.fechaPostulacion ? new Date(a.fechaPostulacion).getTime() : 0;
            const fB = b.fechaPostulacion ? new Date(b.fechaPostulacion).getTime() : 0;
            return fB - fA;
          });
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar mis postulaciones:', err);
          this.cargando = false;
        }
      });
  }
}
