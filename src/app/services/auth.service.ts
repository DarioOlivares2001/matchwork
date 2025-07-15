// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
// } from './auth-wrapper';
import { environment } from '../../environments/environments';
import { catchError } from 'rxjs/operators';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  comuna?: string;
  habilidades?: any[];
  fotoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/usuarios`;
  private userSub = new BehaviorSubject<User | null>(null);
  public user$ = this.userSub.asObservable();

  get userSnapshot(): User | null {
    return this.userSub.value;
  }

  constructor(private http: HttpClient) {
    this.checkAuthState();
  }

  private async checkAuthState() {
    try {

      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        const usuario: User = JSON.parse(userFromStorage);
        this.userSub.next(usuario);
        return; // ya tienes todo
      }


      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      if (session.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        const payload = JSON.parse(atob(token.split('.')[1]));

        const usuario: User = {
          id: 0,
          nombre: payload.name || user.username,
          correo: payload.email || user.username,
          rol: payload['custom:rol'] || 'usuario',
        };

        this.userSub.next(usuario);
        localStorage.setItem('token', token);
      }
    } catch {
      this.userSub.next(null);
    }
  }

  obtenerUsuarioDesdeDb(correo: string): Observable<User> {
    return this.http.get<User>(`${this.api}/by-email/${correo}`);
  }

  async signUpCognito(nombre: string, correo: string, password: string, rol: string): Promise<any> {
    return await signUp({
      username: correo,
      password: password,
      options: {
        userAttributes: {
          name: nombre,
          'custom:rol': rol,
        },
      },
    });
  }

  async confirmSignUp(correo: string, code: string): Promise<any> {
    return await confirmSignUp({
      username: correo,
      confirmationCode: code,
    });
  }

  async getCognitoSub(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async syncUserInDb(user: User): Promise<Observable<any>> {
    const sub = await this.getCognitoSub();
    return this.http.post(`${this.api}/sync`, {
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      comuna: user.comuna || null,
      cognitoSub: sub,
      usaCognito: true,
    });
  }

  async loginCognito(correo: string, password: string): Promise<{ token: string; userBase: User }> {
    const result = await signIn({ username: correo, password: password });

    if (result.isSignedIn) {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) throw new Error('Token no encontrado');

      localStorage.setItem('token', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const usuarioBase: User = {
        id: 0,
        nombre: payload.name,
        correo: payload.email,
        rol: payload['custom:rol'],
      };

      const syncObservable = await this.syncUserInDb(usuarioBase);
      await firstValueFrom(syncObservable);

      return { token, userBase: usuarioBase };
    }

    throw new Error('Autenticación incompleta');
  }

  async loginEmpresa(correo: string, password: string): Promise<{ usuario: User, tienePerfil: boolean }> {
    const { token, userBase } = await this.loginCognito(correo, password);
    const usuario = await firstValueFrom(this.obtenerUsuarioDesdeDb(userBase.correo));

    if (usuario.rol.toUpperCase() !== 'EMPRESA') {
      await this.logout();
      throw new Error('Rol inválido para empresa');
    }

    this.userSub.next(usuario);
    localStorage.setItem('user', JSON.stringify(usuario));

    // Verificar si tiene perfil de empresa
    const perfil = await firstValueFrom(
      this.http.get<any>(`${environment.apiBaseUrl}/usuarios/${usuario.id}/perfil-empresa`).pipe(
        catchError(err => {
          if (err.status === 404) return of(null); // No tiene perfil aún
          throw err;
        })
      )
    );

    return { usuario, tienePerfil: !!perfil };
  }


  async loginProfesional(correo: string, password: string): Promise<{ usuario: User, perfil: any }> {
    const { token, userBase } = await this.loginCognito(correo, password);
    const usuario = await firstValueFrom(this.obtenerUsuarioDesdeDb(userBase.correo));

    if (usuario.rol.toUpperCase() !== 'TRABAJADOR') {
      await this.logout();
      throw new Error('Rol inválido para trabajador');
    }

    this.userSub.next(usuario);
    localStorage.setItem('user', JSON.stringify(usuario));

    // Obtener el perfil del trabajador
    const perfil = await firstValueFrom(
      this.http.get<any>(`${environment.apiBaseUrl}/usuarios/${usuario.id}/perfil-profesional/completo`).pipe(
        catchError(err => {
          if (err.status === 404) return of(null);
          throw err;
        })
      )
    );

    return { usuario, perfil };
  }

  saveUserInDb(nombre: string, correo: string, rol: string): Observable<User> {
    return this.http.post<User>(`${this.api}/register`, {
      nombre,
      correo,
      rol,
      contrasena: '',
    });
  }

  async logout(): Promise<void> {
    try {
      await signOut();
    } catch { }
    localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSub.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
