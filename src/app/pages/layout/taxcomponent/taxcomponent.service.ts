import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaxCategory, TaxComponent, TaxComponentDto } from './taxcomponent.model';
import { environment } from '../../../../environments/environment';
import { NbToastrService } from '@nebular/theme';
@Injectable({
  providedIn: 'root'
})
export class TaxcomponentService {

  private apiUrl = `${environment.apiBaseUrl}/taxcomponents`;

  constructor(private http: HttpClient, private toastr: NbToastrService) {}

  getAllComponents(): Observable<TaxComponentDto[]> {
    return this.http.get<TaxComponentDto[]>(this.apiUrl);
  }

  getComponentById(id: number): Observable<TaxComponentDto> {
    return this.http.get<TaxComponentDto>(`${this.apiUrl}/${id}`);
  }

  createComponent(component: TaxComponent): Observable<TaxComponent> {
    return this.http.post<TaxComponent>(this.apiUrl, component);
  }

  updateComponent(id: number, component: TaxComponent): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, component);
  }

  toggleComponentStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
  }

  getTaxCategories(): Observable<TaxCategory[]> {
    return this.http.get<TaxCategory[]>(`${this.apiUrl}/categories`);
  }

  getComponentsBySection(sectionCode: string): Observable<TaxComponentDto[]> {
    return this.http.get<TaxComponentDto[]>(`${this.apiUrl}/sections/${sectionCode}`);
  }

  getActiveComponents(): Observable<TaxComponentDto[]> {
    return this.http.get<TaxComponentDto[]>(`${this.apiUrl}/active`);
  }

  searchComponents(term: string): Observable<TaxComponentDto[]> {
    return this.http.get<TaxComponentDto[]>(`${this.apiUrl}/search`, { params: { term } });
  }

  showSuccess(message: string, title: string = 'Success') {
    this.toastr.success(message, title, { duration: 3000 });
  }

  showError(message: string, title: string = 'Error') {
    this.toastr.danger(message, title, { duration: 3000 });
  }

}


