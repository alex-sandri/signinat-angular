import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  app!: ISerializedApp;

  requestsFullAccess!: boolean;

  isSignInButtonDisabled!: boolean;

  async onSignIn(): Promise<void> {
    await this.api.createAccount(this.app.id);

    this.redirect(this.app);
  }

  async redirect(app: ISerializedApp): Promise<void> {
    const token = await this.api.createAppToken({ app: app.id });

    let url = new URL(app.url);

    url.searchParams.append("SignInAtSession", token.data.id);

    location.href = url.toString();
  }

  constructor(private api: ApiService, router: Router, route: ActivatedRoute) {
    api.listAccounts().then(accounts =>
    {
      const appId: string = route.snapshot.params["id"];

      const account = accounts.find(account => account.app.id === appId);

      api
        .retrieveApp(appId)
        .then(app =>
        {
          if (account)
          {
            this.redirect(app.data);

            return;
          }

          this.app = app.data;

          this.requestsFullAccess = this.app.scopes[0].value === "user";

          this.isSignInButtonDisabled = this.requestsFullAccess;
        })
        .catch(() =>
        {
          router.navigateByUrl("/account");
        });
    });
  }

  ngOnInit(): void {
  }

}
