import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiRequest } from 'api/src/typings/ApiRequest';
import { ApiResponse } from 'api/src/typings/ApiResponse';
import { ISerializedApp } from 'api/src/models/App';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private static readonly BASE_ENDPOINT = "http://localhost:3000/api";

  private static readonly ENDPOINTS = {
    USERS: `${ApiService.BASE_ENDPOINT}/users`,
    APPS: `${ApiService.BASE_ENDPOINT}/apps`,
  };

  public createUser = async (data: ApiRequest.Users.Create): Promise<ApiResponse.Users.Create> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.USERS, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }).toPromise();

    return response as ApiResponse.Users.Create;
  }

  public createApp = async (data: ApiRequest.Apps.Create): Promise<ApiResponse.Apps.Create> =>
  {
    const response = await this.http.post(ApiService.ENDPOINTS.APPS, JSON.stringify(data), {
      headers: {
        "Authorization": `Bearer ${Settings.get("session")}`,
        "Content-Type": "application/json",
      },
    }).toPromise();

    return response as ApiResponse.Apps.Create;
  }

  public listApps = async (): Promise<ISerializedApp[]> =>
  {
    const response = await this.http.get(ApiService.ENDPOINTS.APPS, {
      headers: {
        "Authorization": `Bearer ${Settings.get("session")}`,
      },
    }).toPromise();

    return response as ISerializedApp[];
  }
}
