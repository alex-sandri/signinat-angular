import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss']
})
export class AccountMenuComponent implements OnInit {

  visible: boolean = false;

  firstName: string = "";
  lastName: string = "";
  email: string = "";

  signOut = () => this.authService.signOut();

  constructor(private authService: AuthService, api: ApiService) {
    if (authService.isSignedIn())
    {
      api
        .retrieveToken(authService.token as string)
        .then(token =>
        {
          this.firstName = token.user.name.first;
          this.lastName = token.user.name.last;
          this.email = token.user.email;
        })
        .catch(() =>
        {
          this.signOut();
        });
    }
  }

  ngOnInit(): void {
  }

  onClick(e: Event, accountMenu: HTMLElement) {
    if (
      !accountMenu.contains(e.target as HTMLElement)
      || (e.target as HTMLElement).tagName === "A" // Links
    )
    {
      this.visible = false;
    }
  }

}
