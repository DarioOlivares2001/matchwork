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
    // 1) Si no hay token, redirijo a login profesional
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/ingreso-profesional']);
    }

    // 2) Recupero el usuario completo de memoria
    const user = this.auth.userSnapshot;
    if (!user) {
      // algo ha fallado: limpio todo y vuelvo al login
      this.auth.logout();
      return this.router.createUrlTree(['/ingreso-profesional']);
    }

    const role = user.rol.toUpperCase(); // "EMPRESA" | "TRABAJADOR"
    const url  = state.url;

    // 3) Sólo EMPRESA puede entrar a /dashboard-empresa
    if (url.startsWith('/dashboard-empresa')) {
      return role === 'EMPRESA'
        ? true
        : this.router.createUrlTree(['/dashboard-profesional']);
    }

    // 4) Sólo TRABAJADOR puede entrar a /dashboard-profesional
    if (url.startsWith('/dashboard-profesional')) {
      return role === 'TRABAJADOR'
        ? true
        : this.router.createUrlTree(['/dashboard-empresa']);
    }

    // 5) Resto de rutas → permitido
    return true;
  }
}
