import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {AppRoutes} from './app.routes';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpConfigInterceptor} from './core/interceptors/http-config.interceptor';
import localePl from '@angular/common/locales/pl';
import localePlExtra from '@angular/common/locales/extra/pl';
import {registerLocaleData} from '@angular/common';
import {UserService} from './core/services/user.service';
import { ErrorComponent } from './error.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


registerLocaleData(localePl, localePlExtra);
@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    RouterModule.forRoot(AppRoutes),
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true }, UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
