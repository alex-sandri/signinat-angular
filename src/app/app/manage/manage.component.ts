import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  app!: ISerializedApp;

  async delete() {
    await this.api.deleteApp(this.app.id);
  }

  copyApiKey() {
    navigator.clipboard.writeText(this.app.api.key);
  }

  constructor(private api: ApiService, private router: Router, route: ActivatedRoute) {
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
