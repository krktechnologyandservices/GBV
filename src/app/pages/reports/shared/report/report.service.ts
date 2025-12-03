import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseApi = '/api';

  constructor(private http: HttpClient) {}

  getData(url: string, params: any = {}): Observable<any[]> {
    return this.http.get<any[]>(url, { params });
  }

  saveReportTemplate(payload: any): Observable<any> {
    return this.http.post(`${this.baseApi}/report/template/save`, payload);
  }

  getSavedTemplate(reportKey: string, filterKey: string): Observable<any> {
    // Pass filterKey as query param
    return this.http.get<any>(`${this.baseApi}/report/template/${reportKey}`, {
      params: { filterKey }
    });
  }
}
