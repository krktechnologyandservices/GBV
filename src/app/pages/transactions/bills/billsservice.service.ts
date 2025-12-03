import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface Bill {
  id: number;
  studentName: string;
  phone: string;
  roomType: string;
  period: string;
  amount: number;
  status: string;
  dueDate: string;
  paymentMode?: string;
  receiptUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private baseUrl = `${environment.apiBaseUrl}/billing`; // .NET Core API

  constructor(private http: HttpClient) {}

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/list`);
  }

  payOnline(billId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/pay-online/${billId}`, {});
  }

  uploadOfflinePayment(payment: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('billId', payment.billId);
    formData.append('amount', payment.amount);
    formData.append('paymentMode', payment.paymentMode);
    formData.append('referenceNumber', payment.referenceNumber); // if available
    formData.append('paymentDate', payment.paymentDate); // ISO string or formatted date
    if (payment.paidAmount) formData.append('paidAmount', payment.paidAmount.toString());
    if (payment.remarks) formData.append('remarks', payment.remarks);
    
    if (file) {
      formData.append('receiptSnapshot', file, file.name);
    }
  
    return this.http.post(`${this.baseUrl}/offline-payment`, formData);
  }

  getOfflinePayments(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/offline-pending`);
  }

  approvePayment(billId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/approve/${billId}`, {});
  }

  rejectPayment(billId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reject/${billId}`, {});
    
  }

  softDeleteBill(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/soft-delete/${id}`, {});
  }


}
