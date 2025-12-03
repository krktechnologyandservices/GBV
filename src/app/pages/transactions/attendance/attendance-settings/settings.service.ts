import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment'; 
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = `${environment.apiBaseUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Grace Periods
  getGracePeriods(): Observable<GracePeriodSetting[]> {
    return this.http.get<GracePeriodSetting[]>(`${this.apiUrl}/grace-periods`);
  }

  upsertGracePeriod(model: GracePeriodSetting): Observable<any> {
    if (model.id && model.id > 0) {
      return this.http.put(`${this.apiUrl}/grace-periods/${model.id}`, model);
    }
    return this.http.post(`${this.apiUrl}/grace-periods`, model);
  }

  deleteGracePeriod(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/grace-periods/${id}`);
  }

  // Work Hours
getWorkHours(): Observable<WorkHoursSetting[]> {
  return this.http.get<WorkHoursSetting[]>(`${this.apiUrl}/work-hours`);
}

upsertWorkHours(model: WorkHoursSetting): Observable<any> {
  if (model.id && model.id > 0) {
    return this.http.put(`${this.apiUrl}/work-hours/${model.id}`, model);
  }
  return this.http.post(`${this.apiUrl}/work-hours`, model);
}

deleteWorkHours(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/work-hours/${id}`);
}

// Attendance Reasons
getAttendanceReasons(): Observable<AttendanceReason[]> {
  return this.http.get<AttendanceReason[]>(`${this.apiUrl}/attendance-reasons`);
}

upsertAttendanceReason(model: AttendanceReason): Observable<any> {
  if (model.code) {
    // PUT for update (code immutable)
    return this.http.put(`${this.apiUrl}/attendance-reasons/${model.code}`, model);
  }
  return this.http.post(`${this.apiUrl}/attendance-reasons`, model);
}

deleteAttendanceReason(code: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/attendance-reasons/${code}`);
}

  // TODO: similarly add WorkHours and AttendanceReasons CRUD methods
}

export interface GracePeriodSetting {
  id: number;
  department: string;
  graceMinutes: number;
}

export interface WorkHoursSetting {
  id: number;
  department: string;
  morningStart: string; // HH:mm:ss
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

export interface AttendanceReason {
  code: string;
  description: string;
  requiresApproval: boolean;
}
