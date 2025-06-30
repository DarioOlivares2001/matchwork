// src/app/auth/ingreso-empresa/ingreso-empresa.component.ts
import { Component }            from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
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
    this.auth.loginEmpresa(this.email, this.password).then(({ usuario, tienePerfil }) => {
      this.overlay.close();
      if (!tienePerfil) {
        this.router.navigate(['/dashboard-empresa', 'perfil-empresa']);
      } else {
        this.router.navigate(['/dashboard-empresa']);
      }
    }).catch(err => {
      this.error = err.message || 'Credenciales incorrectas';
    });
  }

}
