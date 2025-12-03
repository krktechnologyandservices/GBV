import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(NbAuthService);
  const router = inject(Router);

  return authService.isAuthenticatedOrRefresh().pipe(
    map((authenticated) => {
      if (!authenticated) {
        router.navigate(['auth/login']);
        return false;
      }
      return true;
    }),
  );
};