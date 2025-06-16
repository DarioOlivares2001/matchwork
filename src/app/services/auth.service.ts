// src/app/services/auth.service.ts
// -----------------------------------
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  map,
  tap,
  BehaviorSubject,of, catchError
} from 'rxjs';

export interface AuthPayload {
  id: number;
  correo: string;
  rol: string;
  exp: number;
}
export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  habilidades?: any[];
  comuna?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/usuarios';
  private tokenKey = 'token';
  private userSub = new BehaviorSubject<User | null>(null);
  public user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadUser();
    }
  }

  login(correo: string, contrasena: string): Observable<AuthPayload> {
    return this.http
      .post<{ token: string }>(`${this.baseUrl}/login`, { correo, contrasena })
      .pipe(
        tap(res => localStorage.setItem(this.tokenKey, res.token)),
        map(res => JSON.parse(atob(res.token.split('.')[1])) as AuthPayload),
        tap(() => this.loadUser())
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSub.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Método público para extraer el payload (incluido el campo "rol")
   * del token JWT que está en localStorage.
   */
  public getPayload(): AuthPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as AuthPayload;
    } catch {
      return null;
    }
  }

  public loadUser(): Observable<User|null> {
    const payload = this.getPayload();
    if (!payload) {
      this.userSub.next(null);
      return of(null);
    }
    return this.http.get<User>(`${this.baseUrl}/${payload.id}`)
      .pipe(
        tap(user => this.userSub.next(user)),
        catchError(() => {
          this.userSub.next(null);
          return of(null);
        })
      );
  }

  public get userSnapshot(): User | null {
    return this.userSub.getValue();
  }

  register(
    nombre: string,
    correo: string,
    contrasena: string,
    rol: 'TRABAJADOR' | 'EMPRESA'
  ): Observable<User> {
    const payload = { nombre, correo, contrasena, rol };
    return this.http.post<User>(`${this.baseUrl}/register`, payload);
  }

  public get currentUser(): User | null {
    return this.userSub.getValue();
  }
}
