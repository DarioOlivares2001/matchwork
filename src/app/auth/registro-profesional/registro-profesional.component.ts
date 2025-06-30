// src/app/auth/registro-profesional/registro-profesional.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  ) {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombre = '';
    this.correo = '';
    this.contrasena = '';
    this.confirm = '';
    this.error = '';
  }

  async register() {
    if (this.contrasena !== this.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.auth.signUpCognito(this.nombre, this.correo, this.contrasena, 'TRABAJADOR');
      this.router.navigate(['/confirmar-cuenta'], {
        queryParams: {
          email: this.correo,
          role: 'TRABAJADOR',
          redirect: '/ingreso-profesional'
        }
      });
    } catch (err: any) {
      this.error = err?.message || 'Error al registrar';
    }
  }
}