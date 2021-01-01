import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ISerializedApp } from 'api/src/models/App';
import { ISerializedAccount } from 'api/src/models/Account';
import { ISerializedScope } from 'api/src/models/Scope';
import { ISerializedAuthToken } from 'api/src/models/AuthToken';
import { SettingsService } from '../settings/settings.service';
import { IApp, IToken, IUser } from 'api/src/utilities/Validator';
import { IResponseData } from 'api/src/utilities/Response';

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

  private async send(method: "DELETE" | "GET" | "POST" | "PUT", url: string, data?: any): Promise<any>
  {
    return new Promise(resolve =>
    {
      switch (method)
      {
        case "DELETE":
        {
          this.http
            .delete(url, {
              headers: {
                "Authorization": `Bearer ${SettingsService.get("session.token")}`,
              },
            })
            .toPromise()
            .then(resolve)
            .catch(e => resolve(e.error));

          break;
        }
        case "GET":
        {
          this.http
            .get(url, {
              headers: {
                "Authorization": `Bearer ${SettingsService.get("session.token")}`,
              },
            })
            .toPromise()
            .then(resolve)
            .catch(e => resolve(e.error));

          break;
        }
        case "POST":
        {
          this.http
            .post(url, JSON.stringify(data), {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SettingsService.get("session.token")}`,
              },
            })
            .toPromise()
            .then(resolve)
            .catch(e => resolve(e.error));

          break;
        }
        case "PUT":
        {
          this.http
            .put(url, JSON.stringify(data), {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SettingsService.get("session.token")}`,
              },
            })
            .toPromise()
            .then(resolve)
            .catch(e => resolve(e.error));

          break;
        }
      }
    });
  }

  public createUser(data: IUser): Promise<IResponseData>
  {
    return this.send("POST", ApiService.ENDPOINTS.USERS, data);
  }

  public updateUser(data: IUser): Promise<IResponseData>
  {
    return this.send("PUT", `${ApiService.ENDPOINTS.USERS}/${SettingsService.get("session.userId")}`, data);
  }

  public async deleteUser(): Promise<void>
  {
    await this.send("DELETE", `${ApiService.ENDPOINTS.USERS}/${SettingsService.get("session.userId")}`);
  }

  public async createAccount(id: string): Promise<void>
  {
    await this.send("POST", ApiService.ENDPOINTS.ACCOUNTS, { id });
  }

  public retrieveAccount(id: string): Promise<IResponseData>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.ACCOUNTS}/${id}`);
  }

  public listAccounts(): Promise<ISerializedAccount[]>
  {
    return this.send("GET", ApiService.ENDPOINTS.ACCOUNTS);
  }

  public async deleteAccount(id: string): Promise<void>
  {
    await this.send("DELETE", `${ApiService.ENDPOINTS.ACCOUNTS}/${id}`);
  }

  public createApp(data: IApp): Promise<IResponseData>
  {
    return this.send("POST", ApiService.ENDPOINTS.APPS, data);
  }

  public retrieveApp(id: string): Promise<ISerializedApp>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.APPS}/${id}`);
  }

  public listApps(): Promise<ISerializedApp[]>
  {
    return this.send("GET", ApiService.ENDPOINTS.APPS);
  }

  public updateApp(id: string, data: IApp): Promise<IResponseData>
  {
    return this.send("PUT", `${ApiService.ENDPOINTS.APPS}/${id}`, data);
  }

  public async deleteApp(id: string): Promise<void>
  {
    await this.send("DELETE", `${ApiService.ENDPOINTS.APPS}/${id}`);
  }

  public listScopes(): Promise<ISerializedScope[]>
  {
    return this.send("GET", ApiService.ENDPOINTS.SCOPES)
  }

  public createUserToken(data: IToken): Promise<IResponseData>
  {
    return this.send("POST", `${ApiService.ENDPOINTS.TOKENS}/users`, data);
  }

  public createAppToken(data: IToken): Promise<ISerializedAuthToken>
  {
    return this.send("POST", `${ApiService.ENDPOINTS.TOKENS}/apps`, data);
  }

  public retrieveToken(id: string): Promise<ISerializedAuthToken>
  {
    return this.send("GET", `${ApiService.ENDPOINTS.TOKENS}/${id}`);
  }

  public async deleteToken(id: string): Promise<void>
  {
    await this.send("DELETE", `${ApiService.ENDPOINTS.TOKENS}/${id}`);
  }
}
