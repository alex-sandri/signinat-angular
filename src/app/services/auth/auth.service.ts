import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';
import { RouterService } from '../router/router.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get token () { return SettingsService.get("session") }

  isSignedIn = () => SettingsService.exists("session");

  async signOut() {
    await this.api.deleteToken(this.token as string).finally(() =>
    {
      SettingsService.delete("session");

      this.router.navigateToSignIn(this.route.snapshot);
    });
  }

  constructor(private api: ApiService, private router: RouterService, private route: ActivatedRoute) { }
}
