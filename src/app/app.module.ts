/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, isDevMode } from '@angular/core';
import { HttpClientModule,HTTP_INTERCEPTORS  } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
``
import { NbAuthModule, NbPasswordAuthStrategy, NbAuthJWTToken } from '@nebular/auth';
import { environment } from '../environments/environment';
import { NbAuthJWTInterceptor } from '@nebular/auth';


import { MyJwtInterceptor } from './pages/shared/jwt-interceptor.service';


//import { JwtInterceptor } from './pages/shared/jwt-interceptor.service';

import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
  NbInputModule,NbLayoutModule,NbContextMenuModule
} from '@nebular/theme';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [AppComponent]
,

imports:[
  BrowserModule,
  BrowserAnimationsModule,
  HttpClientModule,
  AppRoutingModule,
  NbInputModule,
  NbLayoutModule,
  NbSidebarModule.forRoot(),
  NbMenuModule.forRoot(),
  NbDatepickerModule.forRoot(),
  NbDialogModule.forRoot(),
  NbWindowModule.forRoot(),
  NbToastrModule.forRoot(),
  NbContextMenuModule,
  NbChatModule.forRoot({
    messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
  }),
  CoreModule.forRoot(),
  ThemeModule.forRoot(),
 ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: !isDevMode(),
    // Register the ServiceWorker as soon as the application is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000'
  }),

  NbAuthModule.forRoot({
    strategies: [
      NbPasswordAuthStrategy.setup({
        name: 'email',
        baseEndpoint: `${environment.apiBaseUrl}`,
        login: {
          endpoint: '/auth/login',
          method: 'post',
        },
        logout: { 
          endpoint: '/auth/logout',
          method: 'post',
        },
        token: {
          class: NbAuthJWTToken,
          key: 'token', // Matches { token: 'JWT_TOKEN' } from API
        },
      }),
    ],
    forms: {
      login: {
        redirectDelay: 500,
        strategy: 'email',
      },
    },
  }),

]
,
  bootstrap: [AppComponent],
  providers: [
    // // ... other providers
    // { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    // JwtHelperService,
    // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: NbAuthJWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MyJwtInterceptor, multi: true },
  ]
})
export class AppModule {
}
