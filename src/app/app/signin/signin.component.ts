import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  app!: ISerializedApp;

  async onSignIn(): Promise<void> {
    await this.api.createAccount(this.app.id);

    this.redirect(this.app);
  }

  async redirect(app: ISerializedApp): Promise<void> {
    const token = await this.api.createToken({ app: app.id });

    let url = new URL(app.url);

    url.searchParams.append("SignInAtSession", token);

    location.href = url.toString();
  }

  constructor(private api: ApiService, private auth: AuthService, router: Router, route: ActivatedRoute) {
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
            this.redirect(app);

            return;
          }

          this.app = app;
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
