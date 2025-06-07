// src/app/dashboard-profesional/dashboard-profesional.component.ts

import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterModule, Router }   from '@angular/router';
import { AuthService, User }      from '../services/auth.service';
import { PerfilService, PerfilProfesional } from '../services/perfil.service';
import { Observable, of }         from 'rxjs';
import { switchMap, catchError }  from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-profesional',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './dashboard-profesional.component.html',
  styleUrls: ['./dashboard-profesional.component.css']
})
export class DashboardProfesionalComponent implements OnInit {
  user$!: Observable<User | null>;
  perfilProfesional$!: Observable<PerfilProfesional | null>;

  constructor(
    private auth: AuthService,
    private perfilSvc: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Obtener el usuario logueado
    this.user$ = this.auth.user$;

    // 2) En cuanto tengamos el user.id, llamamos a getPerfil( userId ).
    //    Si 404 o error, devolvemos `null` en el stream.
    this.perfilProfesional$ = this.auth.user$.pipe(
      switchMap((usr) => {
        if (usr && usr.id) {
          return this.perfilSvc.getPerfil(usr.id).pipe(
            // Si el servidor responde con 404 o falla, emito null
            catchError(() => of(null))
          );
        } else {
          return of(null);
        }
      })
    );

    // 3) Si `perfilProfesional$` emite `null`, redirijo a la ruta de "crear perfil"
    this.perfilProfesional$.subscribe((perfil) => {
      if (perfil === null) {
        // Ajusta esta ruta al path donde esté tu formulario de crear/editar perfil-profesional
        this.router.navigate(['/dashboard-profesional/perfil']);
      }
      // Si `perfil` viene no-null, se queda en este dashboard normalmente
    });
  }
}
