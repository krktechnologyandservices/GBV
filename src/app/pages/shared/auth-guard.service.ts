// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Check if route is restricted by role
      const expectedRole = route.data.expectedRole;
      if (expectedRole) {
        const user = this.authService.currentUserValue;
        if (user && user.roles && user.roles.includes(expectedRole)) {
          return true;
        }
        // Role not authorized so redirect to home
        this.router.navigate(['/']);
        return false;
      }
      
      // No role restriction
      return true;
    }

    // Not logged in so redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}