import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SignupComponent } from './signup/signup.component';
import { RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { SigninComponent } from './signin/signin.component';
import { AccountComponent } from './account/account.component';
import { SettingsComponent } from './account/settings/settings.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SignupComponent,
    IndexComponent,
    SigninComponent,
    AccountComponent,
    SettingsComponent,
    AccountMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot([
      { path: "", component: IndexComponent },
      { path: "signup", component: SignupComponent },
      { path: "signin", component: SigninComponent },
      { path: "account", component: AccountComponent, canActivate: [ AuthGuard ] },
      { path: "account/settings", component: SettingsComponent, canActivate: [ AuthGuard ] }
    ]),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
