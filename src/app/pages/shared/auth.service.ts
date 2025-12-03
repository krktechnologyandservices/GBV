// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    const user = this.currentUserValue;
    return user && user.roles && user.roles.includes('Admin');
  }

  public get currentUserId(): number {
    const user = this.currentUserValue;
    return user ? user.id : null;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(map(response => {
        // Store user details and jwt token in local storage
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        return response.user;
      }));
  }

  logout() {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<any> {
    return this.http.get(`@${environment.apiBaseUrl}/auth/profile`);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string {
    return localStorage.getItem('token');
  }
}