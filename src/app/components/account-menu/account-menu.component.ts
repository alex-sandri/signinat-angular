import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss']
})
export class AccountMenuComponent implements OnInit {

  firstName: string = "";
  lastName: string = "";
  email: string = "";

  signOut = () => this.authService.signOut();

  constructor(private authService: AuthService, private api: ApiService) {
    api.retrieveSession(authService.sessionId as string).then(session =>
    {
      this.firstName = session.user.name.first;
      this.lastName = session.user.name.last;
      this.email = session.user.email;
    });
  }

  ngOnInit(): void {
  }

}
