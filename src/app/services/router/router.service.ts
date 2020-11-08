import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  navigateToSignIn(route: ActivatedRouteSnapshot) {
    this.router.navigate([ "signin" ], {
      queryParams: {
        ref: route.url.toString().replace(/,/g, "/")
      },
    });
  }

  constructor(private router: Router) { }
}
