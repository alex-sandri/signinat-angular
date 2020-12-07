import { Component } from '@angular/core';
import { ISerializedUser } from 'api/src/models/User';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent
{
  title = "signinat-angular";

  user?: ISerializedUser;

  canLoad = false;

  constructor(auth: AuthService)
  {
    if (!auth.token)
    {
      this.canLoad = true;

      return;
    }

    auth.signIn().then(user =>
    {
      if (!user) return;

      this.user = user;

      this.canLoad = true;
    });
  }
}
