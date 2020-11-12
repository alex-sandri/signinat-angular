import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedAccount } from 'api/src/models/Account';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  account!: ISerializedAccount;

  async unlink() {
    await this.api.unlinkAccount(this.account.id);

    this.router.navigateByUrl("/account");
  }

  async delete() {
    await this.api.deleteAccount(this.account.id);

    this.router.navigateByUrl("/account");
  }

  constructor(private api: ApiService, private router: Router, route: ActivatedRoute) {
    api
      .retrieveAccount(route.snapshot.params["id"])
      .then(account => this.account = account)
      .catch(() =>
      {
        router.navigateByUrl("/account");
      });
  }

  ngOnInit(): void {
  }

}
