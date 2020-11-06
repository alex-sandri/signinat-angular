import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISerializedAccount } from 'api/src/models/Account';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  account?: ISerializedAccount;

  unlink() {
    // TODO
  }

  delete() {
    // TODO
  }

  constructor(api: ApiService, route: ActivatedRoute) {
    api
      .retrieveAccount(route.snapshot.params["id"])
      .then(account => this.account = account);
  }

  ngOnInit(): void {
  }

}
