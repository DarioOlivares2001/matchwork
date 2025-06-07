// src/main.ts
import { enableProdMode }                    from '@angular/core';
import { bootstrapApplication }              from '@angular/platform-browser';
import { provideRouter }                     from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { RxStomp }                           from '@stomp/rx-stomp';
import { stompConfig }                       from './app/config/stomp.config';

import { AppComponent }                      from './app/app.component';
import { appRoutes }                         from './app/app.routes';
import { AuthInterceptor }                   from './app/interceptors/auth.interceptor';


// 1) Modo producción
if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // 2) Tu interceptor de Auth en primer lugar
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // 3) HttpClient con interceptores desde DI
    provideHttpClient(withInterceptorsFromDi()),

    // 4) Router
    provideRouter(appRoutes),

    // 5) Proveedor de RxStomp para WebSocket/Stomp
    {
      provide: RxStomp,
      useFactory: () => {
        const rxStomp = new RxStomp();
        rxStomp.configure(stompConfig);
        rxStomp.activate();
        return rxStomp;
      }
    }
  ]
})
.catch(err => console.error(err));
