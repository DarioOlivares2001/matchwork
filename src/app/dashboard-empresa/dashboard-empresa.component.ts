// src/app/dashboard-empresa/dashboard-empresa.component.ts
import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { RouterModule, Router }     from '@angular/router';
import { AuthService, User }        from '../services/auth.service';
import { PerfilEmpresaService }      from '../services/perfil-empresa.service';
import { PerfilEmpresa }             from '../models/perfil-empresa';
import { firstValueFrom, Observable, of }           from 'rxjs';
import { switchMap, catchError, filter, take }    from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  selector: 'app-dashboard-empresa',
  templateUrl: './dashboard-empresa.component.html',
  styleUrls: ['./dashboard-empresa.component.css'],
})
export class DashboardEmpresaComponent implements OnInit {
  user$!: Observable<User | null>;
  perfilEmpresa$!: Observable<PerfilEmpresa | null>;
  cargando = true;
  user!: User | null;

  constructor(
    private auth: AuthService,
    private perfilEmpSvc: PerfilEmpresaService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.user = this.auth.userSnapshot;

    if (!this.user || this.user.rol.toUpperCase() !== 'EMPRESA') {
      this.router.navigate(['/ingreso-empresa']);
      return;
    }

    this.perfilEmpresa$ = this.perfilEmpSvc.getPerfilEmpresa(this.user.id).pipe(
      catchError(err => {
        if (err.status === 404) return of(null);
        throw err;
      })
    );

    try {
      const perfil = await firstValueFrom(
        this.perfilEmpSvc.getPerfilEmpresa(this.user.id).pipe(
          catchError(err => {
            if (err.status === 404) return of(null);
            throw err;
          })
        )
      );

      if (!perfil) {
        this.router.navigate(['/dashboard-empresa/perfil-empresa']);
        return;
      }
    } catch (e) {
      console.error('Error al obtener perfil de empresa:', e);
      this.router.navigate(['/ingreso-empresa']);
      return;
    } finally {
      this.cargando = false;
    }
  }
}
