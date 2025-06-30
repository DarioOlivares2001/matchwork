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
    this.auth.loginProfesional(this.email, this.password).then(({ usuario, perfil }) => {
      this.overlay.close();
      if (!perfil) {
        this.router.navigate(['/dashboard-profesional', 'crear-perfil']);
      } else {
        this.router.navigate(['/dashboard-profesional', 'perfil']);
      }
    }).catch(err => {
      this.error = err.message || 'Credenciales incorrectas';
    });
  }


}
