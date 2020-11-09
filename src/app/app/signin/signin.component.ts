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

  async onSubmit(e: Event, form: HTMLFormElement): Promise<void> {
    e.preventDefault();

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    // TODO
  }

  constructor(api: ApiService, router: Router, route: ActivatedRoute) {
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
