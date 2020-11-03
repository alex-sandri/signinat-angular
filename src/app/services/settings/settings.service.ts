import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  static get = (key: string) => localStorage.getItem(key);

  static set = (key: string, value: string) => localStorage.setItem(key, value);

  static delete = (key: string) => localStorage.removeItem(key);

  static exists = (key: string): boolean => SettingsService.get(key) !== null;

  static clear = () => localStorage.clear();
}
