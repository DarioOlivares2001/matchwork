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
  // 1) user$ está filtrado para que nunca emita `null`
  user$!: Observable<User>;

  // Aquí guardamos el perfil (si existe) o `null` si aún no existe en BD
  perfil?: PerfilEmpresa | null;

  // Control de modo “ver” vs “crear/editar”
  isEditing = false;

  // Campos “editables” del formulario
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
    //
    // 1) Primero definimos user$ filtrado: sólo entrará cuando User ≠ null
    //
    this.user$ = this.auth.user$.pipe(
      filter((u): u is User => u !== null) // ahora TS sabe que `user$` solo emite `User`, nunca `null`
    );

    //
    // 2) Cuando `user$` emita un `User`, hacemos GET /perfil-empresa
    //
    this.user$.pipe(
      switchMap((usr) => {
        // usr ya no puede ser null aquí (por el filter anterior).
        return this.perfilSvc.getPerfilEmpresa(usr.id).pipe(
          // Si el GET devuelve 404, lo convertimos a `of(null)` para indicar “no existe perfil”.
          catchError((err) => {
            if (err.status === 404) {
              return of(null);
            }
            // Si es cualquier otro error distinto a 404, lo relanzamos.
            throw err;
          })
        );
      })
    ).subscribe((pe) => {
      this.perfil = pe;

      if (this.perfil === null) {
        // → Si realmente no existe en BD (404), arrancamos en modo “crear”
        this.isEditing = true;
        this.initializeEmptyEditable();
      } else {
        // → Si existe perfil, arrancamos en modo “vista” y cargamos los campos
        this.isEditing = false;
        this.loadEditableFromPerfil();
      }
    });
  }

  // Al hacer clic en “Editar” o “Cancelar”:
  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      // Si el usuario cancela:
      if (this.perfil) {
        // Si ya existe perfil (modo edición), restauramos los valores originales:
        this.loadEditableFromPerfil();
      } else {
        // Si el usuario canceló creación inicial, volvemos al dashboard:
        this.router.navigate(['/dashboard-empresa']);
      }
    }
  }

  // Inicializa el formulario “en blanco” para crear un perfil nuevo
  private initializeEmptyEditable(): void {
    this.editable.nombreFantasia = '';
    this.editable.logoUrl        = '';
    this.editable.descripcion    = '';
    this.editable.industria      = '';
    this.editable.ubicacion      = '';
  }

  // Carga `this.perfil` existente dentro de `this.editable`
  private loadEditableFromPerfil(): void {
    if (!this.perfil) return;
    this.editable.nombreFantasia = this.perfil.nombreFantasia || '';
    this.editable.logoUrl        = this.perfil.logoUrl || '';
    this.editable.descripcion    = this.perfil.descripcion || '';
    this.editable.industria      = this.perfil.industria || '';
    this.editable.ubicacion      = this.perfil.ubicacion || '';
  }

  // Se dispara cuando el usuario hace clic en “Guardar”:
  saveChanges(): void {
    this.user$.pipe(
      take(1), // Sólo necesitamos el primer valor de user$
      switchMap((usr) => {
        // Armamos el payload con los campos editables:
        const payload: PerfilEmpresa = {
          id: usr.id, // @MapsId en el back se encargará de vincular con Usuario
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
        // Si el POST fue exitoso, “saved” contiene el PerfilEmpresa recién guardado:
        this.perfil = saved;
        this.isEditing = false;
        this.loadEditableFromPerfil();
      }
    });
  }
}
