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
    this.api.createAccount(this.app.id);

    // TODO
    // Generate session id to send to the app

    let url = new URL(this.app.url);

    url.searchParams.append("SignInAtSession", "TODO");

    location.href = url.toString();
  }

  constructor(private api: ApiService, router: Router, route: ActivatedRoute) {
    api
      .retrieveApp(route.snapshot.params["id"])
      .then(app => this.app = app)
      .catch(() =>
      {
        router.navigateByUrl("/account");
      });
  }

  ngOnInit(): void {
  }

}
