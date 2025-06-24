// src/app/auth/ingreso-profesional/ingreso-profesional.component.ts
import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User }    from '../../services/auth.service';
import { of }                      from 'rxjs';
import { switchMap, map, catchError, filter } from 'rxjs/operators';
import { ChatOverlayService }from '../../services/chat-overlay.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-ingreso-profesional',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './ingreso-profesional.component.html',
  styleUrls: ['./ingreso-profesional.component.css']
})
export class IngresoProfesionalComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private perfilService: PerfilService, 
    private overlay: ChatOverlayService
  ) {}

 

 login() {
    this.auth.login(this.email, this.password).pipe(
      // 1) recibo el { token, usuario } que devolvió tu backend
      switchMap(({ usuario }) =>
        // 2) hago el GET de perfil usando el ID de tu BD
        this.perfilService.getPerfil(usuario.id).pipe(
          map(perfil => ({ usuario, perfil })),
          catchError(err => {
            if (err.status === 404) return of({ usuario, perfil: null });
            throw err;
          })
        )
      )
    )
    .subscribe({
      next: ({ usuario, perfil }) => {
        this.overlay.close();
        if (!perfil) {
          this.router.navigate(['/dashboard-profesional','crear-perfil']);
        } else {
          this.router.navigate(['/dashboard-profesional','perfil']);
        }
      },
      error: () => this.error = 'Credenciales incorrectas'
    });
  }
}
