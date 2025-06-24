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
  rol: string;           
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
    
    const stored = localStorage.getItem(this.storageUser);
    if (stored) {
      this.userSub.next(JSON.parse(stored));
    }
  }


  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { correo, contrasena })
      .pipe(
        tap(res => {
       
          localStorage.setItem(this.tokenKey, res.token);
        
          this.userSub.next(res.usuario);
          
          localStorage.setItem(this.storageUser, JSON.stringify(res.usuario));
        })
      );
  }

 
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.storageUser);
    this.userSub.next(null);
  }

  
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

 
  get userSnapshot(): User | null {
    return this.userSub.getValue();
  }

  
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

 
  confirmAccount(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/confirm`,
      { email, code }
    );
  }
}
