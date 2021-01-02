import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISerializedUser } from 'api/src/models/User';
import { ApiService } from '../api/api.service';
import { RouterService } from '../router/router.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService
{
  private _user?: ISerializedUser;

  get token () { return SettingsService.get("session.token"); }

  get user() { return this._user; }

  async signIn(): Promise<ISerializedUser | null>
  {
    if (!this.token) return null;

    await this.api
      .retrieveToken(this.token)
      .then(response =>
      {
        if (response.status.code !== 200)
        {
          this.signOut();

          return;
        }

        this._user = response.data.user;
      });

    return this.user ?? null;
  }

  async signOut()
  {
    if (!this.token) return;

    await this.api.deleteToken(this.token).finally(() =>
    {
      SettingsService.delete("session.token");
      SettingsService.delete("session.userId");

      this.router.navigateToSignIn(this.route.snapshot);
    });
  }

  constructor(private api: ApiService, private router: RouterService, private route: ActivatedRoute)
  {}
}
