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
