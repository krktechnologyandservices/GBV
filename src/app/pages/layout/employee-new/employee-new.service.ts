import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Models
export interface EmployeeDto {
  employeeId?: number;
  employeeCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfJoining: string;
  aadharNo: string;
  emailId: string;
  activeStatus: boolean;
  attributes: Attribute[];
  certificates: Certificate[];
  addresses: Address[];
  banks: Bank[];
}

export interface Attribute {
  dataType:string,
  attributeId:number
  attributeName: string;
  value: string;
}

export interface Certificate {
  certificateName: string;
  issuer: string;
  issueDate: string;
  verifiedStatus: string;
}

export interface Address {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  pincode: string;
  mobile: string;
}

export interface Bank {
  bankName: string;
  branchName:string;
  accountNo: string;
  ifscCode: string;
}

export interface OrgAttributeValueDto {
  id: number;
  value: string;
}

export interface OrgAttributeDto {
  id: number;
  attributeName: string;
  dataType: string;
  isRequired: boolean;
  values: OrgAttributeValueDto[];
}

// Safe Minimal Interface for Caching
export interface EmployeeListItem {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  emailId: string;
  activeStatus: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = `${environment.apiBaseUrl}/employees`;
  private attrUrl = `${environment.apiBaseUrl}/org-attributes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeDto[]> {
    return new Observable<EmployeeDto[]>(observer => {
      this.http.get<EmployeeDto[]>(this.api).subscribe({
        next: data => {
          // Cache minimal safe list
          const minimalList = data.map(emp => ({
            employeeId: emp.employeeId!,
            employeeCode: emp.employeeCode,
            firstName: emp.firstName,
            lastName: emp.lastName,
            emailId: emp.emailId,
            activeStatus: emp.activeStatus
          }));
          localStorage.setItem('employeesCache', JSON.stringify(minimalList));
          observer.next(data);
          observer.complete();
        },
        error: () => {
          const cache = localStorage.getItem('employeesCache');
          if (cache) {
            const cachedData: EmployeeListItem[] = JSON.parse(cache);
            observer.next(cachedData as any);  // Cast to match EmployeeDto[]
          } else {
            observer.error('No cached data available');
          }
          observer.complete();
        }
      });
    });
  }

  get(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.api}/${id}`);
  }

  create(emp: EmployeeDto): Observable<any> {
    return this.http.post(this.api, emp);
  }

  update(id: number, emp: EmployeeDto): Observable<any> {
    return this.http.put(`${this.api}/${id}`, emp);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  uploadCertificate(formData: FormData): Observable<{ filePath: string }> {
    return this.http.post<{ filePath: string }>(`${this.api}/Certificate/upload`, formData);
  }

  getAttributesWithValues(): Observable<OrgAttributeDto[]> {
    return this.http.get<OrgAttributeDto[]>(`${this.attrUrl}/with-values`);
  }

  clearCache() {
    localStorage.removeItem('employeesCache');
  }
}
