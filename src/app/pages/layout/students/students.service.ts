import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {formatDate} from '@angular/common';
import { environment } from '../../../../environments/environment';
export interface Student {
  studentId?: number;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAlternativeMobile:string;
  admissionDate?: string;
    bloodGroup:string ;
   idProof:string;
   relationship:string;
   roomId :string;
   photoUrl:string;
   courseName:string;
   roomNo:string;
}

export interface LedgerItem {
  date: string;
  description: string;
  type: 'Bill' | 'Payment' | 'Adjustment' | 'Advance';
  amount: number;
}


export interface LedgerEntry {
  date: string;
  type: 'Bill' | 'Payment' | 'Adjustment' | 'Advance';
  description: string;
  amount: number;
  debit?: number;
  credit?: number;
  particulars?: string; // For showing bill adjustment or additional payment breakdown
  balance?:number;
  roomNo?:string;
}




@Injectable({ providedIn: 'root' })
export class StudentService {
  private api =`${environment.apiBaseUrl}/students`;

  constructor(private http: HttpClient) {}
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.api}/${id}`);
  }
  
  getAll(): Observable<Student[]> { return this.http.get<Student[]>(this.api); }
  get(id: number): Observable<Student> { return this.http.get<Student>(`${this.api}/${id}`); }
  add(student: Student): Observable<any> { return this.http.post(this.api, student); }
  update(id: number, student: Student): Observable<any> { return this.http.put(`${this.api}/${id}`, student); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }

  // uploadPhoto(id: number, formData: FormData): Observable<{ photoUrl: string }> {
  //   return this.http.post<{ photoUrl: string }>(`${this.api}/${id}/upload-photo`, formData);
  // }
  

  uploadPhoto(studentId: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file);
  
    return this.http.post(`${this.api}/${studentId}/upload-photo`, formData);
  }

  

  deletePhoto(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}/delete-photo`);
  }
  
  getPhoto(studentId: number): Observable<Blob> {
    return this.http.get(`${this.api}/${studentId}/photo`, { responseType: 'blob' });
  }

  getLedger(studentId: number, fromDate?: Date, toDate?: Date) {
    let params: any = {};
    if (fromDate) params.fromDate = fromDate.toISOString(); // 2025-10-05T00:00:00.000Z
    if (toDate) params.toDate = toDate.toISOString();
    return this.http.get<LedgerEntry[]>(`${this.api}/${studentId}/ledger`, { params });
  }
  
  


}
