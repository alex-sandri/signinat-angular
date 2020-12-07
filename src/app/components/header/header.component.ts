import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AccountMenuComponent } from '../account-menu/account-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit
{
  user = this.auth.user;

  openAccountMenu = (accountMenu: AccountMenuComponent) => accountMenu.visible = true;

  constructor(private auth: AuthService, public router: Router)
  {}

  ngOnInit(): void
  {}
}
