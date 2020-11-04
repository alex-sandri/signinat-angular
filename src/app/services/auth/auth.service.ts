import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isSignedIn = () => SettingsService.exists("session");

  async signOut() {
    await this.api.deleteSession(SettingsService.get("session") as string);

    SettingsService.delete("session");
  }

  constructor(private api: ApiService) { }
}
