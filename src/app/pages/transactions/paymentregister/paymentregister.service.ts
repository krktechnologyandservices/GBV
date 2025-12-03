import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentRegisterService {

  private apiUrl =`${environment.apiBaseUrl}/paymentregister`;

  constructor(private http: HttpClient) { }

  getPayments(filters: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/get`, filters);
  }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rooms`);
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students`);
  }
}
