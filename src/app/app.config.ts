import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RxStomp } from '@stomp/rx-stomp';
import { stompConfig } from './config/stomp.config';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(appRoutes)]
};

export function rxStompServiceFactory(): RxStomp {
  const rxStomp = new RxStomp();
  rxStomp.configure(stompConfig);
  rxStomp.activate();
  return rxStomp;
}