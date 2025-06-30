// src/app/auth/registro-empresa/registro-empresa.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './registro-empresa.component.html',
  styleUrls: ['./registro-empresa.component.css']
})
export class RegistroEmpresaComponent {
  nombre = '';
  correo = '';
  contrasena = '';
  confirm = '';
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  async register() {
    if (this.contrasena !== this.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      await this.auth.signUpCognito(this.nombre, this.correo, this.contrasena, 'EMPRESA');
      this.router.navigate(['/confirmar-cuenta'], {
        queryParams: {
          email: this.correo,
          role: 'EMPRESA',
          redirect: '/ingreso-empresa'
        }
      });
    } catch (err: any) {
      this.error = err?.message || 'Error al registrar';
    }
  }

}
