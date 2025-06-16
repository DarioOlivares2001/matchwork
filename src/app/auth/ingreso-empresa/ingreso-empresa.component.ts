// src/app/auth/ingreso-empresa/ingreso-empresa.component.ts
import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, AuthPayload } from '../../services/auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-ingreso-empresa',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './ingreso-empresa.component.html',
  styleUrls: ['./ingreso-empresa.component.css']
})
export class IngresoEmpresaComponent {
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
        if (user?.rol.toUpperCase() === 'EMPRESA') {
          this.router.navigate(['/dashboard-empresa']);
        } else {
          this.error = 'No tienes rol de Empresa';
          this.auth.logout();
        }
      },
      error: () => {
        this.error = 'Credenciales incorrectas';
      }
    });
  }



}
