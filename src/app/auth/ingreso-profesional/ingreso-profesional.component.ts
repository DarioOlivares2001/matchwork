// src/app/auth/ingreso-profesional/ingreso-profesional.component.ts
import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService }    from '../../services/auth.service';
import { switchMap } from 'rxjs';

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
    private auth: AuthService
  ) {}

 

  login() {
      this.auth.login(this.email, this.password).pipe(
        // login() guarda token y resuelve el payload...
        switchMap(() => this.auth.loadUser())  // aquí esperamos a que loadUser() emita
      ).subscribe({
        next: user => {
          if (user?.rol.toUpperCase() === 'TRABAJADOR') {
            this.router.navigate(['/dashboard-profesional']);
          } else {
            this.error = 'No tienes rol de Profesional';
            this.auth.logout();
          }
        },
        error: () => {
          this.error = 'Credenciales incorrectas';
        }
      });
    }


}
