import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  accounts!: any[];

  constructor(api: ApiService) {
    
  }

  ngOnInit(): void {
  }

}
