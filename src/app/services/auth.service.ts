// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environments';



export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;            // "TRABAJADOR" | "EMPRESA"
  fotoUrl?: string;
  habilidades?: any[];
  comuna?: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
 private readonly baseUrl = `https://ponkybonk.com/api/usuarios`;
  private readonly tokenKey    = 'token';
  private readonly storageUser = 'usuario';

  private userSub = new BehaviorSubject<User | null>(null);
  public  user$   = this.userSub.asObservable();

  constructor(private http: HttpClient) {
    // Al iniciar, cargo el usuario si está en localStorage
    const stored = localStorage.getItem(this.storageUser);
    if (stored) {
      this.userSub.next(JSON.parse(stored));
    }
  }

  /**
   * Hace login, guarda token + usuario completo,
   * y emite el usuario para toda la app.
   */
  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { correo, contrasena })
      .pipe(
        tap(res => {
          // 1) guardo el token para el interceptor
          localStorage.setItem(this.tokenKey, res.token);
          // 2) actualizo el BehaviorSubject con el usuario que viene del backend
          this.userSub.next(res.usuario);
          // 3) persisto ese usuario en localStorage
          localStorage.setItem(this.storageUser, JSON.stringify(res.usuario));
        })
      );
  }

  /** Limpia todo y vuelve al estado no autenticado */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.storageUser);
    this.userSub.next(null);
  }

  /** Comprueba si hay un token presente */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /** Devuelve el token para el interceptor */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Snapshot síncrono del usuario actual (o null si no hay) */
  get userSnapshot(): User | null {
    return this.userSub.getValue();
  }

  /** Registro de nuevo usuario */
  register(
    nombre: string,
    correo: string,
    contrasena: string,
    rol: 'TRABAJADOR' | 'EMPRESA'
  ): Observable<User> {
    return this.http.post<User>(
      `${this.baseUrl}/register`,
      { nombre, correo, contrasena, rol }
    );
  }

  /** Confirmación de cuenta con código */
  confirmAccount(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/confirm`,
      { email, code }
    );
  }
}
