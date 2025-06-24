// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/ingreso-profesional']);
    }

  
    const user = this.auth.userSnapshot;
    if (!user) {
     
      this.auth.logout();
      return this.router.createUrlTree(['/ingreso-profesional']);
    }

    const role = user.rol.toUpperCase(); 
    const url  = state.url;

   
    if (url.startsWith('/dashboard-empresa')) {
      return role === 'EMPRESA'
        ? true
        : this.router.createUrlTree(['/dashboard-profesional']);
    }

    
    if (url.startsWith('/dashboard-profesional')) {
      return role === 'TRABAJADOR'
        ? true
        : this.router.createUrlTree(['/dashboard-empresa']);
    }

    
    return true;
  }
}
