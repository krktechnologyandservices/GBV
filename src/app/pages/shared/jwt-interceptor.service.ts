// // jwt.interceptor.ts
// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AuthService } from './auth.service';

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {}

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // Add authorization header with jwt token if available
//     const token = this.authService.getToken();
//     if (token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//     }

//     return next.handle(request);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NbTokenService, NbAuthJWTToken } from '@nebular/auth';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class MyJwtInterceptor implements HttpInterceptor {

  constructor(private tokenService: NbTokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.endsWith('/auth/login') || req.url.endsWith('/refresh-token')) {
      return next.handle(req); } // Don't attach token for anonymous APIs
    // Get the token from Nebular storage
    return this.tokenService.get()
      .pipe(
        take(1), // take only the latest token value
        switchMap((token: NbAuthJWTToken) => {
          if (token && token.getValue()) {
            // Clone the request and add the Authorization header
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token.getValue()}`
              }
            });
            return next.handle(clonedReq);
          } else {
            // No token found, proceed without modifying the request
            return next.handle(req);
          }
        })
      );
  }
}
