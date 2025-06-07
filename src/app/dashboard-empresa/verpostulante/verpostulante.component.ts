// src/app/dashboard-empresa/verpostulante/verpostulante.component.ts
import { Component, OnInit }               from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PerfilService, PerfilProfesionalCompleto } from '../../services/perfil.service';

@Component({
  selector: 'app-verpostulante',
  standalone: true,
  imports: [
    CommonModule,    // NgIf, NgFor, date pipe...
    RouterModule
  ],
  templateUrl: './verpostulante.component.html',
  styleUrls: ['./verpostulante.component.css']
})
export class VerpostulanteComponent implements OnInit {
  perfil!: PerfilProfesionalCompleto;
  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('usuarioId'));
    this.perfilService.getPerfilCompleto(userId).subscribe({
      next: p => {
        this.perfil = p;
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudo cargar el perfil.';
        this.cargando = false;
      }
    });
  }

  iniciarConversacion() {
    // redirige o abre modal de chat; aquí ejemplo:
    this.router.navigate(['/dashboard-empresa/chat', this.perfil.usuario.id]);
  }
}
