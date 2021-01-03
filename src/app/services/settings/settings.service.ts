import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService
{
  get = (key: string) => localStorage.getItem(key);

  set = (key: string, value: string) => localStorage.setItem(key, value);

  delete = (key: string) => localStorage.removeItem(key);

  exists = (key: string): boolean => this.get(key) !== null;

  clear = () => localStorage.clear();
}
