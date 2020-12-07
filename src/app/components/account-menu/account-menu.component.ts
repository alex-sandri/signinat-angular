import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss']
})
export class AccountMenuComponent implements OnInit
{
  visible: boolean = false;

  user = this.auth.user;

  signOut = this.auth.signOut;

  constructor(private auth: AuthService)
  {}

  ngOnInit(): void
  {}

  onClick(e: Event, accountMenu: HTMLElement)
  {
    if (
      !accountMenu.contains(e.target as HTMLElement)
      || (e.target as HTMLElement).tagName === "A" // Links
    )
    {
      this.visible = false;
    }
  }
}
