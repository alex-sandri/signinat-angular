import { Component, OnInit } from '@angular/core';
import { ISerializedAccount } from 'api/src/models/Account';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  accounts: ISerializedAccount[] = [];

  constructor(api: ApiService) {
    api.listAccounts().then(accounts => this.accounts = accounts);
  }

  ngOnInit(): void {
  }

}
