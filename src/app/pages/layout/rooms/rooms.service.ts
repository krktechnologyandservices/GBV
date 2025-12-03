import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface RoomTariff {
  id?: number;
  roomId?: number;
  period: string;
  rate: number;
}

export interface Room {
  id?: number;
  roomNumber: string;
  capacity: number;
  occupiedCount?: number;
  tariffs: RoomTariff[];
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private api = `${environment.apiBaseUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }
  getAll(): Observable<Room[]> { return this.http.get<Room[]>(this.api); }
  get(id: number): Observable<Room> { return this.http.get<Room>(`${this.api}/${id}`); }
  add(room: Room): Observable<any> { return this.http.post(this.api, room); }
  update(id: number, room: Room): Observable<any> { return this.http.put(`${this.api}/${id}`, room); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
}
