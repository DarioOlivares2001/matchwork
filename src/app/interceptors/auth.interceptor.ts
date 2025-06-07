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
    // 1) Definimos las rutas que NO queremos interceptar (login y register)
    const url = req.url.toLowerCase();
    if (
      url.endsWith('/api/usuarios/login') ||
      url.endsWith('/api/usuarios/register')
    ) {
      // No adjuntar ningún token aquí
      return next.handle(req);
    }

    // 2) Para el resto de peticiones, inyectamos el token si existe
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
