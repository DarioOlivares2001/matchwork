// src/app/dashboard-empresa/verpostulante/verpostulante.component.ts
import { Component, OnInit }               from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl }             from '@angular/platform-browser';
import { PerfilService, PerfilProfesionalCompleto } from '../../services/perfil.service';
import { ChatOverlayService }   from '../../services/chat-overlay.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-verpostulante',
  standalone: true,
  imports: [
    CommonModule,   
    RouterModule
  ],
  templateUrl: './verpostulante.component.html',
  styleUrls: ['./verpostulante.component.css']
})
export class VerpostulanteComponent implements OnInit {
  perfil!: PerfilProfesionalCompleto;
  cargando = true;
  error = '';

  showCvModal = false;
  sanitizedCvUrl!: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perfilService: PerfilService,
    private overlay: ChatOverlayService,
    private sanitizer: DomSanitizer
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
    const contacto: Contact = {
      userId:  this.perfil.usuario.id,
      nombre:  this.perfil.usuario.nombre,
      fotoUrl: this.perfil.fotoUrl ?? '/assets/images/default-avatar.png',
      unread:  0
    };
    this.overlay.open(contacto);
  }

  openCvModal() {
    if (!this.perfil.cvUrl) return;
    this.sanitizedCvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.perfil.cvUrl);
    this.showCvModal = true;
  }

  closeCvModal() {
    this.showCvModal = false;
  }
  
}
