import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get sessionId () { return SettingsService.get("session")?.split(";")[1]; }

  isSignedIn = () => SettingsService.exists("session");

  async signOut() {
    await this.api.deleteSession(this.sessionId as string).finally(() =>
    {
      SettingsService.delete("session");

      this.router.navigate([ "signin" ]);
    });
  }

  constructor(private api: ApiService, private router: Router) { }
}
