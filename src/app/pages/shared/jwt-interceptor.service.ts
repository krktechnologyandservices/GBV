import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NbTokenService, NbAuthJWTToken } from '@nebular/auth';
import { switchMap, take, catchError } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Injectable()
export class MyJwtInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: NbTokenService,
    private toastrService: NbToastrService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Allow login & refresh endpoints to pass through without token
    if (req.url.endsWith('/auth/login') || req.url.endsWith('/refresh-token')) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
    }

    return this.tokenService.get().pipe(
      take(1),
      switchMap((token: NbAuthJWTToken) => {
        let clonedReq = req;
        if (token && token.getValue()) {
          clonedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token.getValue()}`
            }
          });
        }
        return next.handle(clonedReq).pipe(
          catchError((error: HttpErrorResponse) => this.handleError(error))
        );
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Something went wrong!';
    if (error.error && typeof error.error === 'string') {
      message = error.error;
    } else if (error.error && error.error.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    // ✅ If token expired or invalid (401), redirect to login
    if (error.status === 401) {
      this.toastrService.warning('Session expired. Please log in again.', 'Unauthorized', {
        duration: 4000,
        icon: 'alert-triangle-outline',
        status: 'warning',
        destroyByClick: true,
      });

      // Clear token to avoid using invalid one
      this.tokenService.clear().subscribe(() => {
        this.router.navigate(['/auth/login']);  // 👈 redirect
      });
    } else {
      // For other errors, show danger toast
      this.toastrService.danger(message, 'Error', {
        duration: 4000,
        icon: 'alert-circle-outline',
        status: 'danger',
        destroyByClick: true,
        preventDuplicates: true
      });
    }

    return throwError(() => error);
  }
}
