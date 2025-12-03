import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class PayComponentServiceService {


  private apiUrl = `${environment.apiBaseUrl}/paycomponents`;

  constructor(
    private http: HttpClient,
    private toastrService: NbToastrService
  ) { }

  getAll(): Observable<PayComponent[]> {
    return this.http.get<PayComponent[]>(this.apiUrl);
  }

  getById(id: number): Observable<PayComponent> {
    return this.http.get<PayComponent>(`${this.apiUrl}/${id}`);
  }

  create(component: PayComponent): Observable<PayComponent> {
    return this.http.post<PayComponent>(this.apiUrl, component);
  }

  update(id: number, component: PayComponent): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, component);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPayGroups(): Observable<PayGroup[]> {
    return this.http.get<PayGroup[]>(`${this.apiUrl}/paygroups`);
  }

  showSuccessToast(message: string, title: string = 'Success') {
    this.toastrService.success(message, title, { duration: 3000 });
  }

  showErrorToast(message: string, title: string = 'Error') {
    this.toastrService.danger(message, title, { duration: 3000 });
  }



}


export interface PayComponent {
  id: number;
  componentName: string;
  payGroupId: number;
  payGroupName?: string;
  calculationType: string;
  isProrated: boolean;
  prorationBase: string;
  isTaxable: boolean;
  isDeduction: boolean;
  displayInPayslip: boolean;
  formula: string;
}

export interface PayGroup {
  id: number;
  categoryName: string;
  payableType: string;
  fixedDays?: number;
}