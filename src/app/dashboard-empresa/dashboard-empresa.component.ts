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
   
    this.user$ = this.auth.user$;

    this.perfilEmpresa$ = this.auth.user$.pipe(
      filter((usr): usr is User => usr !== null), 
      switchMap((usr) => {
       
        return this.perfilEmpSvc.getPerfilEmpresa(usr.id).pipe(
         
          catchError((err) => {
            if (err.status === 404) {
              return of(null);
            }
            
            throw err;
          })
        );
      })
    );

    
    this.perfilEmpresa$.subscribe((pe) => {
      
      if (pe === null) {
        this.router.navigate(['/dashboard-empresa/perfil-empresa']);
      }
    });
  }
}
