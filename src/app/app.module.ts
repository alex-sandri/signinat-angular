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
import { SignedInGuard } from './guards/signed-in/signed-in.guard';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { ManageComponent as AccountManageComponent } from './account/manage/manage.component';
import { SignedOutGuard } from './guards/signed-out/signed-out.guard';
import { ManageComponent as AppManageComponent } from './app/manage/manage.component';
import { SigninComponent as AppSignInComponent } from './app/signin/signin.component';

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
    AccountMenuComponent,
    AccountManageComponent,
    AppManageComponent,
    AppSignInComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot([
      { path: "", component: IndexComponent },
      { path: "signup", component: SignupComponent, canActivate: [ SignedOutGuard ] },
      { path: "signin", component: SigninComponent, canActivate: [ SignedOutGuard ] },
      { path: "account", component: AccountComponent, canActivate: [ SignedInGuard ] },
      { path: "account/settings", component: SettingsComponent, canActivate: [ SignedInGuard ] },
      { path: "account/manage/:id", component: AccountManageComponent, canActivate: [ SignedInGuard ] },
      { path: "app/manage/:id", component: AppManageComponent, canActivate: [ SignedInGuard ] },
      { path: "app/signin/:id", component: AppSignInComponent }
    ]),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
