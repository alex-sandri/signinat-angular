import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { SettingsService } from './services/settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent
{
  title = "signinat-angular";

  canLoad = false;

  constructor(auth: AuthService, settings: SettingsService)
  {
    if (!settings.get("session.token"))
    {
      this.canLoad = true;

      return;
    }

    auth.signIn().then(() =>
    {
      this.canLoad = true;
    });
  }
}
