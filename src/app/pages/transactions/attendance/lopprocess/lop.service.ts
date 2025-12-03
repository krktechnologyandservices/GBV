import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LopService {
  private baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  processPeriod(year: number, month: number) {
    return this.http.get<LopResult>(`${this.baseUrl}/lop/process-period/${year}/${month}`);
  }
  
  saveCorrections(periodId: number, lopCorrectionDto: { employeeId: number; 
    calculatedLopDays:number,CorrectedLopDays:number ,Year: number,month:number }[]
    
    ) {
    return this.http.post(`${this.baseUrl}/lop/save-corrections`, 
      lopCorrectionDto
    );
  }
}


export interface LopResult {
  year: number;
  month: number;
  totalDays: number;
  summaries: LopSummary[];
}

export interface LopSummary {
  employeeId: number;
  calculatedLopDays: number;
  correctedLopDays: number;
  manualCorrection?: number; // bound to UI input
}