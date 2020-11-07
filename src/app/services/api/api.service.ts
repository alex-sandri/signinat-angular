import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiRequest } from 'api/src/typings/ApiRequest';
import { ApiResponse } from 'api/src/typings/ApiResponse';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedSession } from 'api/src/models/Session';
import { SettingsService } from '../settings/settings.service';
import { ISerializedAccount } from 'api/src/models/Account';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private static readonly BASE_ENDPOINT = "http://localhost:3000/api";

  private static readonly ENDPOINTS = {
    USERS: `${ApiService.BASE_ENDPOINT}/users`,
    APPS: `${ApiService.BASE_ENDPOINT}/apps`,
    SESSIONS: `${ApiService.BASE_ENDPOINT}/sessions`,
    ACCOUNTS: `${ApiService.BASE_ENDPOINT}/accounts`,
  };

  public createUser = async (data: ApiRequest.Users.Create): Promise<ApiResponse.Users.Create> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.USERS, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }).toPromise();

    return response as ApiResponse.Users.Create;
  }

  public retrieveAccount = async (id: string): Promise<ISerializedAccount> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.ACCOUNTS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedAccount;
  }

  public listAccounts = async (): Promise<ISerializedAccount[]> =>
  {
    const response = await this.http.get(ApiService.ENDPOINTS.ACCOUNTS, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedAccount[];
  }

  public unlinkAccount = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.ACCOUNTS}/${id}/unlink`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
      responseType: "text",
    }).toPromise();
  }

  public deleteAccount = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.ACCOUNTS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
      responseType: "text",
    }).toPromise();
  }

  public createApp = async (data: ApiRequest.Apps.Create): Promise<ApiResponse.Apps.Create> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.APPS, JSON.stringify(data), {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse.Apps.Create;
  }

  public retrieveApp = async (id: string): Promise<ISerializedApp> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.APPS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedApp;
  }

  public listApps = async (): Promise<ISerializedApp[]> =>
  {
    const response = await this.http.get(ApiService.ENDPOINTS.APPS, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedApp[];
  }

  public deleteApp = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.APPS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
      responseType: "text",
    }).toPromise();
  }

  public createSession = async (data: ApiRequest.Sessions.Create): Promise<ApiResponse.Sessions.Create> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.SESSIONS, JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse.Sessions.Create;
  }

  public retrieveSession = async (id: string): Promise<ISerializedSession> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.SESSIONS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedSession;
  }

  public deleteSession = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.SESSIONS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session")}`,
      },
      responseType: "text",
    }).toPromise();
  }
}
