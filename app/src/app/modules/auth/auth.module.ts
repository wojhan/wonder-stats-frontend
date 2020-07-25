import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPage } from './pages/login/login.page';
import {RouterModule} from '@angular/router';
import {AuthRoutes} from './auth.routes';


@NgModule({
  declarations: [LoginPage],
  imports: [
    CommonModule,
    RouterModule.forChild(AuthRoutes),
  ]
})
export class AuthModule { }
