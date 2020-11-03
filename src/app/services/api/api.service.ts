import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiRequest } from 'api/src/typings/ApiRequest';
import { ApiResponse } from 'api/src/typings/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private static readonly BASE_ENDPOINT = "http://localhost:3000/api";

  public createUser = async (data: ApiRequest.Users.Create): Promise<ApiResponse.Users.Create> =>
  {
    const response = await this.http.post(`${ApiService.BASE_ENDPOINT}/users`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }).toPromise();

    return response as ApiResponse.Users.Create;
  }
}
