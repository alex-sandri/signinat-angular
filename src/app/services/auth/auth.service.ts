import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';
import { RouterService } from '../router/router.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get userId () { return SettingsService.get("session")?.split(";")[0]; }

  get sessionId () { return SettingsService.get("session")?.split(";")[1]; }

  isSignedIn = () => SettingsService.exists("session");

  async signOut() {
    await this.api.deleteSession(this.sessionId as string).finally(() =>
    {
      SettingsService.delete("session");

      this.router.navigateToSignIn(this.route.snapshot);
    });
  }

  constructor(private api: ApiService, private router: RouterService, private route: ActivatedRoute) { }
}
