import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { PerfilService }     from '../../services/perfil.service';
import { take }              from 'rxjs/operators';

@Component({
  selector: 'app-crear-perfil',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './crear-perfil.component.html',
  styleUrls: ['./crear-perfil.component.css']
})
export class CrearPerfilComponent implements OnInit {
  user?: User | null;
  editable = {
    titulo: '',
    presentacion: '',
    disponibilidad: '',
    modoTrabajo: ''
  };

  constructor(
    private auth: AuthService,
    private perfilSvc: PerfilService,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.user$.pipe(take(1)).subscribe(u => this.user = u);
  }

  crearPerfil() {
    if (!this.user) return;
    this.perfilSvc.updatePerfil(this.user.id, this.editable)
      .subscribe(() => {
        // tras crear, vamos a la vista de perfil
       this.router.navigateByUrl('dashboard-profesional/perfil');
      }, err => console.error(err));
  }
}
