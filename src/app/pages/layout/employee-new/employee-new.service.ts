import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Models (unchanged from your original)
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
  private cacheKey = 'employeesCache';
  private cacheTimestampKey = 'employeesCacheTimestamp';
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeDto[]> {
    return new Observable<EmployeeDto[]>(observer => {
      // Check cache first if offline
      if (!navigator.onLine) {
        const cached = this.getCachedData();
        if (cached) {
          observer.next(cached);
          observer.complete();
          return;
        }
      }

      // Fetch from API
      this.http.get<EmployeeDto[]>(this.api).pipe(
        tap(data => this.cacheData(data)),
        catchError(error => {
          console.warn('API failed, trying cache:', error);
          const cached = this.getCachedData();
          if (cached) {
            return of(cached);
          }
          throw error;
        })
      ).subscribe({
        next: data => {
          observer.next(data);
          observer.complete();
        },
        error: error => {
          observer.error(error);
          observer.complete();
        }
      });
    });
  }

  get(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.api}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching employee:', error);
        throw error;
      })
    );
  }

  create(emp: EmployeeDto): Observable<any> {
    return this.http.post(this.api, emp).pipe(
      tap(() => this.clearCache()),
      catchError(error => {
        console.error('Error creating employee:', error);
        throw error;
      })
    );
  }

  update(id: number, emp: EmployeeDto): Observable<any> {
    return this.http.put(`${this.api}/${id}`, emp).pipe(
      tap(() => this.clearCache()),
      catchError(error => {
        console.error('Error updating employee:', error);
        throw error;
      })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError(error => {
        console.error('Error deleting employee:', error);
        throw error;
      })
    );
  }

  uploadCertificate(formData: FormData): Observable<{ filePath: string }> {
    return this.http.post<{ filePath: string }>(`${this.api}/Certificate/upload`, formData).pipe(
      catchError(error => {
        console.error('Error uploading certificate:', error);
        throw error;
      })
    );
  }

  getAttributesWithValues(): Observable<OrgAttributeDto[]> {
    return this.http.get<OrgAttributeDto[]>(`${this.attrUrl}/with-values`).pipe(
      catchError(error => {
        console.error('Error fetching attributes:', error);
        throw error;
      })
    );
  }

  // Cache methods
  private cacheData(employees: EmployeeDto[]): void {
    const minimalList: EmployeeListItem[] = employees.map(emp => ({
      employeeId: emp.employeeId!,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      emailId: emp.emailId,
      activeStatus: emp.activeStatus
    }));
    
    localStorage.setItem(this.cacheKey, JSON.stringify(minimalList));
    localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
  }

  private getCachedData(): EmployeeDto[] | null {
    const cache = localStorage.getItem(this.cacheKey);
    const timestamp = localStorage.getItem(this.cacheTimestampKey);
    
    if (!cache || !timestamp) return null;
    
    const cacheAge = Date.now() - parseInt(timestamp);
    if (cacheAge > this.cacheExpiryMs) {
      this.clearCache();
      return null;
    }
    
    const cachedList: EmployeeListItem[] = JSON.parse(cache);
    // Convert back to EmployeeDto format
    return cachedList.map(item => ({
      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      firstName: item.firstName,
      middleName: '',
      lastName: item.lastName,
      dateOfJoining: '',
      aadharNo: '',
      emailId: item.emailId,
      activeStatus: item.activeStatus,
      attributes: [],
      certificates: [],
      addresses: [],
      banks: []
    }));
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.cacheTimestampKey);
  }

  // Status update method (optional)
  updateStatus(id: number, status: boolean): Observable<any> {
    // Note: You need to implement this endpoint in your API
    return this.http.patch(`${this.api}/${id}/status`, { activeStatus: status }).pipe(
      tap(() => this.clearCache()),
      catchError(error => {
        console.error('Error updating status:', error);
        throw error;
      })
    );
  }
}