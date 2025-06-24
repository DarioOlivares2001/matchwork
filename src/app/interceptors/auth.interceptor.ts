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

    
    if (
      req.method === 'POST' &&
      (url.endsWith('/api/usuarios/login') ||
       url.endsWith('/api/usuarios/register') ||
       url.endsWith('/api/usuarios/confirm'))
    ) {
      return next.handle(req);
    }

    
    if (url.startsWith('https://ponkybonk.com/api') && token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    
    return next.handle(req);
  }
}
