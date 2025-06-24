// src/app/auth/registro-profesional/registro-profesional.component.ts
import { Component }        from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService }      from '../../services/auth.service';

@Component({
  selector: 'app-registro-profesional',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './registro-profesional.component.html',
  styleUrls: ['./registro-profesional.component.css']
})
export class RegistroProfesionalComponent {
  nombre = '';
  correo = '';
  contrasena = '';
  confirm = '';
  error = '';


  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  register() {
    if (this.contrasena !== this.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.auth.register(
      this.nombre,
      this.correo,
      this.contrasena,
      'TRABAJADOR'
    ).subscribe({
      next: () => {
       // en lugar de login, vamos a confirmación de cuenta
       this.router.navigate(['/confirmar-cuenta'], {
          queryParams: {
            email: this.correo,
            role: 'TRABAJADOR',
            redirect: '/ingreso-profesional'
          }
        });
     },
      error: err => {
        this.error = err.error?.message || 'Error al registrar';
      }
    });
  }
}
