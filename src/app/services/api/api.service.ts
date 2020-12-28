import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiRequest } from 'api/src/typings/ApiRequest';
import { ApiResponse } from 'api/src/typings/ApiResponse';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedAccount } from 'api/src/models/Account';
import { ISerializedScope } from 'api/src/models/Scope';
import { ISerializedAuthToken } from 'api/src/models/AuthToken';
import { SettingsService } from '../settings/settings.service';
import { IApp, IUser } from 'api/src/utilities/Validator';

@Injectable({
  providedIn: 'root'
})
export class ApiService
{
  constructor(private http: HttpClient)
  {}

  private static readonly BASE_ENDPOINT = "http://localhost:3000/api";

  private static readonly ENDPOINTS = {
    USERS: `${ApiService.BASE_ENDPOINT}/users`,
    APPS: `${ApiService.BASE_ENDPOINT}/apps`,
    ACCOUNTS: `${ApiService.BASE_ENDPOINT}/accounts`,
    SCOPES: `${ApiService.BASE_ENDPOINT}/scopes`,
    TOKENS: `${ApiService.BASE_ENDPOINT}/tokens`,
  };

  public createUser = async (data: IUser): Promise<ApiResponse> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.USERS, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }).toPromise();

    return response as ApiResponse;
  }

  public updateUser = async (data: IUser): Promise<ApiResponse> =>
  {
    const response = await this.http.put(
      `${ApiService.ENDPOINTS.USERS}/${SettingsService.get("session.userId")}`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SettingsService.get("session.token")}`,
        },
      },
    ).toPromise();

    return response as ApiResponse;
  }

  public deleteUser = async (): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.USERS}/${SettingsService.get("session.userId")}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();
  }

  public createAccount = async (id: string): Promise<void> =>
  {
    await this.http.post(ApiService.ENDPOINTS.ACCOUNTS, JSON.stringify({ id }), {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();
  }

  public retrieveAccount = async (id: string): Promise<ISerializedAccount> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.ACCOUNTS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();

    return response as ISerializedAccount;
  }

  public listAccounts = async (): Promise<ISerializedAccount[]> =>
  {
    const response = await this.http.get(ApiService.ENDPOINTS.ACCOUNTS, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();

    return response as ISerializedAccount[];
  }

  public deleteAccount = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.ACCOUNTS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();
  }

  public createApp = async (data: IApp): Promise<ApiResponse> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.APPS, JSON.stringify(data), {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse;
  }

  public retrieveApp = async (id: string): Promise<ISerializedApp> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.APPS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();

    return response as ISerializedApp;
  }

  public listApps = async (): Promise<ISerializedApp[]> =>
  {
    const response = await this.http.get(ApiService.ENDPOINTS.APPS, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();

    return response as ISerializedApp[];
  }

  public updateApp = async (id: string, data: IApp): Promise<ApiResponse> =>
  {
    const response = await this.http.put(`${ApiService.ENDPOINTS.APPS}/${id}`, JSON.stringify(data), {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse;
  }

  public deleteApp = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.APPS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();
  }

  public listScopes = async (): Promise<ISerializedScope[]> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.SCOPES}`, {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
      },
    }).toPromise();

    return response as ISerializedScope[];
  }

  public createUserToken = async (data: ApiRequest.Tokens.Create): Promise<ApiResponse> =>
  {
    const response = await this.http.post(`${ApiService.ENDPOINTS.TOKENS}/users`, JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse;
  }

  public createAppToken = async (data: ApiRequest.Tokens.Create): Promise<ISerializedAuthToken> =>
  {
    const response = await this.http.post(`${ApiService.ENDPOINTS.TOKENS}/apps`, JSON.stringify(data), {
      headers: {
        "Authorization": `Bearer ${SettingsService.get("session.token")}`,
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ISerializedAuthToken;
  }

  public retrieveToken = async (id: string): Promise<ISerializedAuthToken> =>
  {
    const response = await this.http.get(`${ApiService.ENDPOINTS.TOKENS}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ISerializedAuthToken;
  }

  public deleteToken = async (id: string): Promise<void> =>
  {
    await this.http.delete(`${ApiService.ENDPOINTS.TOKENS}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    }).toPromise();
  }
}
