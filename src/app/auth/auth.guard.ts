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
    // 1) Si no hay token → redirijo a login profesional
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/ingreso-profesional']);
    }

    // 2) Extraigo el rol directamente del token (no espero a user$)
    const payload = this.auth.getPayload();
    if (!payload) {
      // Token inválido, borro y envío a login
      this.auth.logout();
      return this.router.createUrlTree(['/ingreso-profesional']);
    }
    const role = payload.rol.toUpperCase(); // "EMPRESA" o "TRABAJADOR"
    const url = state.url;

    // 3) Si la URL comienza con '/dashboard-empresa', sólo EMPRESA puede entrar
    if (url.startsWith('/dashboard-empresa')) {
      if (role === 'EMPRESA') {
        return true;
      } else {
        // Si no es empresa, lo envío al dashboard-pro (o a otra ruta)
        return this.router.createUrlTree(['/dashboard-profesional']);
      }
    }

    // 4) Si la URL comienza con '/dashboard-profesional', sólo TRABAJADOR puede entrar
    if (url.startsWith('/dashboard-profesional')) {
      if (role === 'TRABAJADOR') {
        return true;
      } else {
        // Si no es trabajador, lo envío al dashboard-empresa
        return this.router.createUrlTree(['/dashboard-empresa']);
      }
    }

    // 5) Para cualquier otra ruta (no protegida bajo esos dashboards), dejo pasar:
    return true;
  }
}
