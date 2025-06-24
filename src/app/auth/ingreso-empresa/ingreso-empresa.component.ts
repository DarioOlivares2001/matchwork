// src/app/auth/ingreso-empresa/ingreso-empresa.component.ts
import { Component }            from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, LoginResponse, User } from '../../services/auth.service';
import { ChatOverlayService }   from '../../services/chat-overlay.service';

@Component({
  selector: 'app-ingreso-empresa',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './ingreso-empresa.component.html',
  styleUrls: ['./ingreso-empresa.component.css']
})
export class IngresoEmpresaComponent {
  email    = '';
  password = '';
  error    = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private overlay: ChatOverlayService
  ) {}

  login() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res: LoginResponse) => {
        this.overlay.close();
        const user: User = res.usuario;
        if (user.rol.toUpperCase() === 'EMPRESA') {
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
