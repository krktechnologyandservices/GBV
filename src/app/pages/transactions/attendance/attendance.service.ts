import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = `${environment.apiBaseUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AttendanceSession[]> {
    return this.http.get<AttendanceSession[]>(this.apiUrl);
  }

  getById(id: number): Observable<AttendanceSession> {
    return this.http.get<AttendanceSession>(`${this.apiUrl}/${id}`);
  }

  create(session: AttendanceSession): Observable<any> {
    return this.http.post(this.apiUrl, session);
  }

  update(session: AttendanceSession): Observable<any> {
    return this.http.put(`${this.apiUrl}/${session.id}`, session);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
export interface AttendanceSessionDto {
  id: number;
  employeeId: number;
  attendanceDate: string;     // ISO date string, e.g. '2025-07-10'
  checkInTime: string;        // Time string, e.g. '09:00:00'
  checkOutTime?: string | null;  // Nullable time string
  status: string;             // e.g. 'Present', 'Absent', 'Late'
  attendanceType: string;     // e.g. 'PunchIn', 'ManualEntry'
  remarks?: string | null;
  reasonCode?: string | null; // Link to attendance reason code
  requiresApproval: boolean;
}


export interface AttendanceSession {
  id: number;
  employeeId: number;
  attendanceDate: string; // ISO Date string yyyy-MM-dd
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string;
  status: string;
  attendanceType: string;
  remarks: string;
  reasonCode: string;
  requiresApproval: boolean;
}
