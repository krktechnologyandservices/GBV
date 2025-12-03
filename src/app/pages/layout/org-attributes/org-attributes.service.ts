import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
export interface OrgAttributeDefinition {
  id?: number;
  attributeName: string;
  dataType: 'Text' | 'Number' | 'Date' | 'Dropdown';
  isRequired: boolean;
  isUnique: boolean;
  isDeleted?: boolean;
}

export interface OrgAttributeDropdownValue {
  id?: number;
  attributeId: number;
  Value: string;
  isDeleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrgAttributesService {
  private baseUrl = `${environment.apiBaseUrl}/org-attributes`;

  constructor(private http: HttpClient) {}

  getAttributes(): Observable<OrgAttributeDefinition[]> {
    return this.http.get<OrgAttributeDefinition[]>(`${this.baseUrl}/definitions`).pipe(
      catchError(this.handleError)
    );
  }

  createAttribute(attribute: OrgAttributeDefinition): Observable<{ Id: number }> {
    return this.http.post<{ Id: number }>(`${this.baseUrl}/definitions`, attribute).pipe(
      catchError(this.handleError)
    );
  }

  deleteAttribute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/definitions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getDropdownValues(attributeId: number): Observable<OrgAttributeDropdownValue[]> {
    return this.http.get<OrgAttributeDropdownValue[]>(`${this.baseUrl}/dropdown-values/${attributeId}`).pipe(
      catchError(this.handleError)
    );
  }

  addDropdownValue(value: OrgAttributeDropdownValue): Observable<{ Id: number }> {
    return this.http.post<{ Id: number }>(`${this.baseUrl}/dropdown-values`, value).pipe(
      catchError(this.handleError)
    );
  }

  deleteDropdownValue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dropdown-values/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Better error handling can be added here
    console.error('API Error:', error);
    return throwError(error);
  }
}
