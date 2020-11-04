import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  linkedAccounts: ISerializedLinkedAccount[] = [];

  constructor(api: ApiService) {
    api.listLinkedAccounts().then(linkedAccounts => this.linkedAccounts = linkedAccounts);
  }

  ngOnInit(): void {
  }

}
