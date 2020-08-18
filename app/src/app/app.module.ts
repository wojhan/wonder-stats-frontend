import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/interceptors/http-config.interceptor';
import localePl from '@angular/common/locales/pl';
import localePlExtra from '@angular/common/locales/extra/pl';
import { registerLocaleData } from '@angular/common';
import { UserService } from './core/services/user.service';
import { ErrorComponent } from './error.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpinnerOverlayService } from './core/services/spinner-overlay.service';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebsocketService } from './core/services/websocket.service';

registerLocaleData(localePl, localePlExtra);
@NgModule({
  declarations: [AppComponent, ErrorComponent],
  imports: [
    BrowserModule,
    NgbModule,
    RouterModule.forRoot(AppRoutes),
    HttpClientModule,
    FontAwesomeModule,
    SharedModule,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    UserService,
    WebsocketService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
