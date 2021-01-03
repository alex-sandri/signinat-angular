import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from 'src/app/services/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class SignedOutGuard implements CanActivate {
  constructor(private settings: SettingsService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {
    if (this.settings.get("session.token"))
    {
      this.router.navigateByUrl("/");
    }

    return true;
  }
  
}
