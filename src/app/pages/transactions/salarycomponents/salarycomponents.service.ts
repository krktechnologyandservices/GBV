import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class EmployeePayService {

  private apiUrl = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient) {}

  searchEmployeeByCode(code: string) {
    return this.http.get(`${this.apiUrl}/EmployeeAttrubute/search-by-code?code=${code}`);
  }

  getPayComponentsByType(type: string) {
    return this.http.get(`${this.apiUrl}/paycomponents/by-type?type=${type}`);
  }

  getPayPeriods() {
    return this.http.get(`${this.apiUrl}/payperiods`);
  }

  getAll(employeeId: number) {
    return this.http.get(`${this.apiUrl}/EmployeePayComponent/${employeeId}`);
  }

  add(data: any) {
    return this.http.post(`${this.apiUrl}/EmployeePayComponent`, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/EmployeePayComponent/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/EmployeePayComponent/${id}`);
  }
}
