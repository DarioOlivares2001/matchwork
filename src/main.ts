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

import { stompConfig }                        from './app/config/stomp.config';

import { AppComponent }                      from './app/app.component';
import { appRoutes }                         from './app/app.routes';
import { AuthInterceptor }                   from './app/interceptors/auth.interceptor';



bootstrapApplication(AppComponent, {
  providers: [
  
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

   
    provideHttpClient(withInterceptorsFromDi()),

  
    provideRouter(appRoutes),
   
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
