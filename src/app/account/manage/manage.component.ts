import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedAccount } from 'api/src/models/Account';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent
{
  account?: ISerializedAccount;

  async delete()
  {
    if (!this.account) return;

    await this.api.deleteAccount(this.account.id);

    this.router.navigateByUrl("/account");
  }

  constructor(private api: ApiService, private router: Router, route: ActivatedRoute)
  {
    api
      .retrieveAccount(route.snapshot.params["id"])
      .then(response =>
      {
        if (response.status && response.status.code !== 200)
        {
          router.navigateByUrl("/account");

          return;
        }

        this.account = response.resource;
      });
  }
}
