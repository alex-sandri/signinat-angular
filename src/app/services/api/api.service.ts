import { Injectable } from '@angular/core';

import { SettingsService } from '../settings/settings.service';
import { IApp, IToken, IUser } from 'api/src/utilities/Validator';
import { IResponseData } from 'api/src/utilities/Response';

@Injectable({
  providedIn: 'root'
})
export class ApiService
{
  constructor(private settings: SettingsService)
  {}

  private static readonly BASE_ENDPOINT = "http://localhost:3000/api";

  private static readonly ENDPOINTS = {
    USERS: `${ApiService.BASE_ENDPOINT}/users`,
    APPS: `${ApiService.BASE_ENDPOINT}/apps`,
    ACCOUNTS: `${ApiService.BASE_ENDPOINT}/accounts`,
    SCOPES: `${ApiService.BASE_ENDPOINT}/scopes`,
    TOKENS: `${ApiService.BASE_ENDPOINT}/tokens`,
  };

  private async send(method: "DELETE" | "GET" | "POST" | "PUT", url: string, body?: any): Promise<any>
  {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Authorization": `Bearer ${this.settings.get("session.token")}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  public createUser(data: IUser): Promise<IResponseData>
  {
    return this.send("POST", ApiService.ENDPOINTS.USERS, data);
  }

  public updateUser(data: IUser): Promise<IResponseData>
  {
    return this.send("PUT", `${ApiService.ENDPOINTS.USERS}/${this.settings.get("session.userId")}`, data);
  }

  public deleteUser(): Promise<IResponseData>
  {
    return this.send("DELETE", `${ApiService.ENDPOINTS.USERS}/${this.settings.get("session.userId")}`);
  }

  public createAccount(id: string): Promise<IResponseData>
  {
    return this.send("POST", ApiService.ENDPOINTS.ACCOUNTS, { app: id });
  }

  public retrieveAccount(id: string): Promise<IResponseData>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.ACCOUNTS}/${id}`);
  }

  public listAccounts(): Promise<IResponseData>
  {
    return this.send("GET", ApiService.ENDPOINTS.ACCOUNTS);
  }

  public deleteAccount(id: string): Promise<IResponseData>
  {
    return this.send("DELETE", `${ApiService.ENDPOINTS.ACCOUNTS}/${id}`);
  }

  public createApp(data: IApp): Promise<IResponseData>
  {
    return this.send("POST", ApiService.ENDPOINTS.APPS, data);
  }

  public retrieveApp(id: string): Promise<IResponseData>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.APPS}/${id}`);
  }

  public listApps(): Promise<IResponseData>
  {
    return this.send("GET", ApiService.ENDPOINTS.APPS);
  }

  public updateApp(id: string, data: IApp): Promise<IResponseData>
  {
    return this.send("PUT", `${ApiService.ENDPOINTS.APPS}/${id}`, data);
  }

  public deleteApp(id: string): Promise<IResponseData>
  {
    return this.send("DELETE", `${ApiService.ENDPOINTS.APPS}/${id}`);
  }

  public listScopes(): Promise<IResponseData>
  {
    return this.send("GET", ApiService.ENDPOINTS.SCOPES)
  }

  public createUserToken(data: IToken): Promise<IResponseData>
  {
    return this.send("POST", `${ApiService.ENDPOINTS.TOKENS}/users`, data);
  }

  public createAppToken(data: IToken): Promise<IResponseData>
  {
    return this.send("POST", `${ApiService.ENDPOINTS.TOKENS}/apps`, data);
  }

  public retrieveToken(id: string): Promise<IResponseData>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.TOKENS}/${id}`);
  }

  public deleteToken(id: string): Promise<IResponseData>
  {
    return this.send("DELETE", `${ApiService.ENDPOINTS.TOKENS}/${id}`);
  }
}
