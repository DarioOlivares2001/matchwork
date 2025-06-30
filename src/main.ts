/// <reference types="@angular/localize" />

import { enableProdMode, LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { registerLocaleData } from '@angular/common'; // ✅ AGREGAR ESTA LÍNEA
import localeEsCL from '@angular/common/locales/es-CL'; // ya la tienes

import { RxStomp } from '@stomp/rx-stomp';

import { stompConfig } from './app/config/stomp.config';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';

Amplify.configure(awsConfig);
registerLocaleData(localeEsCL, 'es-CL'); 

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
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-CL' // ✅ Opcional pero recomendado
    }
  ]
})
.catch(err => console.error(err));
