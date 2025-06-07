// src/app/dashboard-empresa/dashboard-empresa.component.ts
import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { RouterModule, Router }     from '@angular/router';
import { AuthService, User }        from '../services/auth.service';
import { PerfilEmpresaService }      from '../services/perfil-empresa.service';
import { PerfilEmpresa }             from '../models/perfil-empresa';
import { Observable, of }           from 'rxjs';
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

  constructor(
    private auth: AuthService,
    private perfilEmpSvc: PerfilEmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Stream de usuario logueado
    this.user$ = this.auth.user$;

    // 2) Esperamos A QUE user$ emita un Usuario REAL (distinto de null),
    //    sólo entonces hacemos GET /perfil-empresa:
    this.perfilEmpresa$ = this.auth.user$.pipe(
      filter((usr): usr is User => usr !== null), // filtra valores null => no entra hasta que usr ≠ null
      switchMap((usr) => {
        // Ya tengo usr.id
        return this.perfilEmpSvc.getPerfilEmpresa(usr.id).pipe(
          // catchError solo para cuando devuelva 404 (no existe perfil).
          // IMPORTANTE: detectamos si el error es un 404, devolvemos “of(null)”.
          // Si fuera otro error (500, 401, etc.), lo propagamos.
          catchError((err) => {
            if (err.status === 404) {
              return of(null);
            }
            // Si es otro error distinto a 404, lo re-lanzamos
            throw err;
          })
        );
      })
    );

    // 3) Una vez que tenemos user y perfil (o “null” explícito), chequeamos si es null:
    this.perfilEmpresa$.subscribe((pe) => {
      // Si el servidor me devolvió null (404), es que NO existe perfil: redirijo
      if (pe === null) {
        this.router.navigate(['/dashboard-empresa/perfil-empresa']);
      }
    });
  }
}
