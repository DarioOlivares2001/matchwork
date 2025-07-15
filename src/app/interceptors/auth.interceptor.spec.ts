// import { TestBed } from '@angular/core/testing';
// import { AuthInterceptor } from './auth.interceptor';
// import { AuthService } from '../services/auth.service';
// import { HttpRequest } from '@angular/common/http';

// // Creamos un AuthService “fake” que devuelva un token fijo
// class FakeAuthService {
//   getToken(): string | null {
//     return 'TOKEN_DE_PRUEBA';
//   }
// }

// describe('AuthInterceptor (creación básica)', () => {
//   let interceptor: AuthInterceptor;
//   let authService: FakeAuthService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         AuthInterceptor,
//         { provide: AuthService, useClass: FakeAuthService }
//       ]
//     });

//     // Inyectamos el interceptor y el AuthService “fake”
//     interceptor = TestBed.inject(AuthInterceptor);
//     authService = TestBed.inject(AuthService) as any;
//   });

//   it('debería crearse', () => {
//     expect(interceptor).toBeTruthy();
//   });

//   it('debería inyectar AuthService correctamente', () => {
//     expect(authService).toBeTruthy();
//     expect(typeof authService.getToken).toBe('function');
//     expect(authService.getToken()).toBe('TOKEN_DE_PRUEBA');
//   });
// });
