import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PendingBill {
  billId: number;
  period?: string;
  roomNo?: string;
  billAmount: number;
  paidAmount: number;
  balance: number;
  dueDate?: string;
}

export interface BillAdjustmentDto {
  billId: number;
  adjustedAmount: number;
  remarks?: string;
}

export interface AdditionalChargeDto {
  expenseHeadId: number;
  amount: number;
  remarks?: string;
}

export interface PaymentCreateDto {
  studentId: number;
  bookingId?: number | null;
  paymentDate: string;
  paymentMode: string;
  totalAmount: number;
  referenceNumber?: string;
  remarks?: string;
  paymentType: 'BILL' | 'ADVANCE' | 'OLD';
  billAdjustments?: BillAdjustmentDto[];
  additionalCharges?: AdditionalChargeDto[];
}

export interface PaymentView {
  id: number;
  bookingId: number;
  studentId: number;
  paymentDate: string;
  paymentMode: string;
  amount: number;
  referenceNumber?: string;
  remarks?: string;
  paymentType: string;
  studentName:string;
  roomNo:String;
  status:string;
}

export interface PaymentRegisterReport {
  paymentId: number;
  paymentDate: string;      // ISO string or Date
  studentName: string;
  roomNo?: string;
  paymentType: string;
  paymentMode: string;
  paymentAmount: number;
  paymentStatus: string;

  roomRents?: RoomRentItem[];
  otherCharges?: OtherChargeItem[];
  advances?: AdvanceItem[];
}

export interface RoomRentItem {
  billNo: number;
  month: string;           // e.g., 'Jun', 'Jul'
  amount: number;
}

export interface OtherChargeItem {
  particulars: string;     // e.g., 'Fine'
  amount: number;
}

export interface AdvanceItem {
  amount: number;
  createdAt: string;       // ISO string or Date
}




export interface ExpenseHead {
  id: number;
  name: string;
}

export interface BillAdjustmentView {
  billId: number;
  period?: string;
  adjustedAmount: number;
  remarks?: string;
}

export interface AdditionalChargeView {
  expenseHeadId: number;
  expenseHeadName?: string;
  amount: number;
  remarks?: string;
}

export interface PaymentReceiptView extends PaymentView {
  denominations?: string;
  billAdjustments?: BillAdjustmentView[];
  additionalCharges?: AdditionalChargeView[];
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) {}

  /** Get all payments */
  getAll(): Observable<PaymentView[]> {
    return this.http.get<PaymentView[]>(this.api);
  }

  /** Get a single payment by ID */
  getById(id: number): Observable<PaymentView> {
    return this.http.get<PaymentView>(`${this.api}/${id}`);
  }

  /** Get pending bills for a student */
  getPendingBills(studentId: number): Observable<PendingBill[]> {
    return this.http.get<PendingBill[]>(`${this.api}/pending-bills/${studentId}`);
  }

  /** Get available expense heads */
  getExpenseHeads(): Observable<ExpenseHead[]> {
    return this.http.get<ExpenseHead[]>(`${this.api}/expense-heads`);
  }

  /** Create new payment */
  create(dto: PaymentCreateDto): Observable<any> {
    return this.http.post(this.api, dto);
  }

  /** Update existing payment */
  update(paymentId: number, dto: PaymentCreateDto): Observable<any> {
    return this.http.put(`${this.api}/${paymentId}`, dto);
  }

  /** Delete payment */
  delete(paymentId: number): Observable<any> {
    return this.http.delete(`${this.api}/${paymentId}`);
  }

  UpdateVerification(paymentId: number): Observable<any> {
    return this.http.put(`${this.api}/${paymentId}/Verification`,paymentId);
  }
  getReceipt(paymentId: number): Observable<PaymentRegisterReport> {
    return this.http.get<PaymentRegisterReport>(`${this.api}/${paymentId}/receipt`);
  }


}
