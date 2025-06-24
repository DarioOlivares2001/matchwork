// src/app/interceptors/auth.interceptor.ts
import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const auth = this.injector.get(AuthService);
    const token = auth.getToken();
    const url = req.url.toLowerCase();

    // --- 1) RUTAS PÚBLICAS (no necesitan token) ---
    if (
      req.method === 'POST' &&
      (url.endsWith('/api/usuarios/login') ||
       url.endsWith('/api/usuarios/register') ||
       url.endsWith('/api/usuarios/confirm'))
    ) {
      return next.handle(req);
    }

    // --- 2) Resto de /api/** → SIEMPRE token (si lo tienes) ---
    if (url.startsWith('https://ponkybonk.com/api') && token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    // --- 3) Demás peticiones que no sean /api/** (p.ej. estáticos) ---
    return next.handle(req);
  }
}
