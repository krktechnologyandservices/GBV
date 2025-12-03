import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DayBookService {

  private api= environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/daybook/rooms`);
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/daybook/students`);
  }

  getDayBook(filters: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.api}/daybook/list`, filters);
  }
}
