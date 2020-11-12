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

  async onSignIn(): Promise<void> {
    await this.api.createAccount(this.app.id);

    this.redirect(this.app);
  }

  redirect(app: ISerializedApp): void {
    // TODO
    // Generate session id to send to the app

    let url = new URL(app.url);

    url.searchParams.append("SignInAtSession", "TODO");

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
