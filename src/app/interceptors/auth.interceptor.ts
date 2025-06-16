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
    const url = req.url.toLowerCase();

    // 1) Rutas públicas: login, register y GET postulaciones por usuario
    if (
      url.endsWith('/api/usuarios/login') ||
      url.endsWith('/api/usuarios/register') ||
      // Excluir GET /api/postulaciones/usuario/{id}
      url.includes('/api/postulaciones/')
      
    ) {
      return next.handle(req);
    }

    // 2) Para el resto, inyectamos el token si existe
    const auth = this.injector.get(AuthService);
    const token = auth.getToken();
    if (token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
