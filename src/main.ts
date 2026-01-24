import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeDe);
bootstrapApplication(App, {
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }, provideRouter(routes), provideHttpClient()],
}).catch(console.error);
