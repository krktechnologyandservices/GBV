import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
export interface PayPeriod {
  id: number;
  payableCategoryId: number;
  attendanceFrom: string;
  attendanceTo: string;
  payDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PayPeriodService {
  private baseUrl = `${environment.apiBaseUrl}/payperiods`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PayPeriod[]> {
    return this.http.get<PayPeriod[]>(this.baseUrl);
  }

  getById(id: number): Observable<PayPeriod> {
    return this.http.get<PayPeriod>(`${this.baseUrl}/${id}`);
  }

  create(model: PayPeriod): Observable<any> {
    return this.http.post(this.baseUrl, model);
  }

  update(model: PayPeriod): Observable<any> {
    return this.http.put(`${this.baseUrl}/${model.id}`, model);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}