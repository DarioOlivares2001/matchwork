import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterModule, Router }   from '@angular/router';
import { AuthService, User }      from '../services/auth.service';
import { PerfilService, PerfilProfesional } from '../services/perfil.service';
import { merge, Observable, of }         from 'rxjs';
import { switchMap, catchError, filter, startWith, take }  from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-profesional',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './dashboard-profesional.component.html',
  styleUrls: ['./dashboard-profesional.component.css']
})
export class DashboardProfesionalComponent implements OnInit {
  user$!: Observable<User | null>;
  perfilProfesional$!: Observable<PerfilProfesional | null>;

  constructor(
    private auth: AuthService,
    private perfilSvc: PerfilService,
    private router: Router
  ) {} 

  ngOnInit(): void {
   
    this.user$ = this.auth.user$;

    
    this.perfilProfesional$ = merge(
    this.user$.pipe(filter((u): u is User => u !== null)),
    this.perfilSvc.perfilRefresh$.pipe(startWith(void 0))
    ).pipe(
      switchMap(() =>
        this.auth.user$.pipe(
          filter((u): u is User => u !== null),
          take(1)
        )
      ),
      switchMap(user =>
        this.perfilSvc.getPerfil(user.id).pipe(catchError(() => of(null)))
      )
    );

   
    this.perfilProfesional$.subscribe((perfil) => {
      const url = this.router.url;

      if (perfil === null
          && !url.endsWith('/crear-perfil')    
          && !url.includes('/registro-profesional') 
      ) {
        
        this.router.navigate(['dashboard-profesional','crear-perfil']);
      }
    });
  }
}
