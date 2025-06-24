// src/app/dashboard-empresa/perfil-empresa/perfil-empresa.component.ts

import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { RouterModule, Router }     from '@angular/router';
import { AuthService, User }        from '../../services/auth.service';
import { PerfilEmpresaService }      from '../../services/perfil-empresa.service';
import { PerfilEmpresa }             from '../../models/perfil-empresa';
import { Observable, of }           from 'rxjs';
import { switchMap, catchError, filter, take }    from 'rxjs/operators';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent implements OnInit {
  
  user$!: Observable<User>;

  perfil?: PerfilEmpresa | null;

  isEditing = false;

  editable = {
    nombreFantasia: '',
    logoUrl: '',
    descripcion: '',
    industria: '',
    ubicacion: ''
  };

  constructor(
    private auth: AuthService,
    private perfilSvc: PerfilEmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.user$ = this.auth.user$.pipe(
      filter((u): u is User => u !== null) 
    );

    
    this.user$.pipe(
      switchMap((usr) => {
        return this.perfilSvc.getPerfilEmpresa(usr.id).pipe(
          catchError((err) => {
            if (err.status === 404) {
              return of(null);
            }
            throw err;
          })
        );
      })
    ).subscribe((pe) => {
      this.perfil = pe;

      if (this.perfil === null) {
        this.isEditing = true;
        this.initializeEmptyEditable();
      } else {
        this.isEditing = false;
        this.loadEditableFromPerfil();
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      if (this.perfil) {
        this.loadEditableFromPerfil();
      } else {
        this.router.navigate(['/dashboard-empresa']);
      }
    }
  }

  private initializeEmptyEditable(): void {
    this.editable.nombreFantasia = '';
    this.editable.logoUrl        = '';
    this.editable.descripcion    = '';
    this.editable.industria      = '';
    this.editable.ubicacion      = '';
  }

  private loadEditableFromPerfil(): void {
    if (!this.perfil) return;
    this.editable.nombreFantasia = this.perfil.nombreFantasia || '';
    this.editable.logoUrl        = this.perfil.logoUrl || '';
    this.editable.descripcion    = this.perfil.descripcion || '';
    this.editable.industria      = this.perfil.industria || '';
    this.editable.ubicacion      = this.perfil.ubicacion || '';
  }

  saveChanges(): void {
    this.user$.pipe(
      take(1), 
      switchMap((usr) => {
       
        const payload: PerfilEmpresa = {
          id: usr.id, 
          nombreFantasia: this.editable.nombreFantasia,
          logoUrl:        this.editable.logoUrl,
          descripcion:    this.editable.descripcion,
          industria:      this.editable.industria,
          ubicacion:      this.editable.ubicacion
        };
        return this.perfilSvc.savePerfilEmpresa(usr.id, payload).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe((saved) => {
      if (saved) {
      
        this.perfil = saved;
        this.isEditing = false;
        this.loadEditableFromPerfil();
      }
    });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.user$.pipe(take(1)).subscribe(user => {
      this.perfilSvc.uploadLogo(user.id, file).subscribe({
        next: res => {
          this.editable.logoUrl = res.logoUrl;
        },
        error: err => console.error('Error subiendo logo:', err)
      });
    });
  }
}
