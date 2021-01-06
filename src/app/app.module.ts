import { BrowserModule } from '@angular/platform-browser';
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
import { SignedInGuard } from './guards/signed-in/signed-in.guard';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { SignedOutGuard } from './guards/signed-out/signed-out.guard';
import { ManageComponent as AppManageComponent } from './app/manage/manage.component';
import { SigninComponent as AppSignInComponent } from './app/signin/signin.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AboutComponent } from './about/about.component';
import { ScopeListComponent } from './components/scope-list/scope-list.component';
import { FormComponent } from './components/form/form.component';
import { InputComponent } from './components/form/input/input.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SignupComponent,
    IndexComponent,
    SigninComponent,
    AccountComponent,
    AccountMenuComponent,
    AppManageComponent,
    AppSignInComponent,
    SpinnerComponent,
    AboutComponent,
    ScopeListComponent,
    FormComponent,
    InputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot([
      { path: "", component: IndexComponent },
      { path: "about", component: AboutComponent },
      { path: "signup", component: SignupComponent, canActivate: [ SignedOutGuard ] },
      { path: "signin", component: SigninComponent, canActivate: [ SignedOutGuard ] },
      { path: "account", component: AccountComponent, canActivate: [ SignedInGuard ] },
      { path: "account/general", component: AccountComponent, canActivate: [ SignedInGuard ] },
      { path: "account/advanced", component: AccountComponent, canActivate: [ SignedInGuard ] },
      { path: "account/developer", component: AccountComponent, canActivate: [ SignedInGuard ] },
      { path: "app/manage/:id", component: AppManageComponent, canActivate: [ SignedInGuard ] },
      { path: "app/signin/:id", component: AppSignInComponent, canActivate: [ SignedInGuard ] }
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
