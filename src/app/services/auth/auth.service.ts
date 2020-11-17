import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';
import { RouterService } from '../router/router.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static get token () { return SettingsService.get("session.token"); }

  static get userId () { return SettingsService.get("session.userId"); }

  static get isSignedIn () { return SettingsService.exists("session.token"); }

  async signOut() {
    await this.api.deleteToken(AuthService.token as string).finally(() =>
    {
      SettingsService.delete("session.token");
      SettingsService.delete("session.userId");

      this.router.navigateToSignIn(this.route.snapshot);
    });
  }

  constructor(private api: ApiService, private router: RouterService, private route: ActivatedRoute) { }
}
