import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent
{
  app!: ISerializedApp;

  requestsFullAccess!: boolean;

  isSignInButtonDisabled!: boolean;

  async redirect(): Promise<void>
  {
    const token = await this.api.createAppToken({ app: this.app.id });

    let url = new URL(this.app.url);

    url.searchParams.append("SignInAtSession", token.data.id);

    location.href = url.toString();
  }

  constructor(private api: ApiService, router: Router, route: ActivatedRoute)
  {
    const appId: string = route.snapshot.params["id"];

    api
      .retrieveApp(appId)
      .then(app =>
      {
        this.app = app.data;

        this.requestsFullAccess = this.app.scopes[0].value === "user";

        this.isSignInButtonDisabled = this.requestsFullAccess;
      })
      .catch(() =>
      {
        router.navigateByUrl("/account");
      });
  }
}
