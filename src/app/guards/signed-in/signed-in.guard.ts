import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RouterService } from 'src/app/services/router/router.service';

@Injectable({
  providedIn: 'root'
})
export class SignedInGuard implements CanActivate {
  constructor(private router: RouterService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (AuthService.isSignedIn)
    {
      this.router.navigateToSignIn(route);
    }

    return true;
  }
  
}
