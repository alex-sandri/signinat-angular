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

  get user() { return this._user; }

  async signIn(): Promise<ISerializedUser | null>
  {
    const userId = this.settings.get("session.userId");

    if (!userId) return null;

    await this.api
      .retrieveUser(userId)
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

  public signOut()
  {
    this.settings.clear();

    this.router.navigateToSignIn(this.route.snapshot);
  }

  constructor(private api: ApiService, private router: RouterService, private route: ActivatedRoute, private settings: SettingsService)
  {}
}
