// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../../environments/environment';
// @Injectable({ providedIn: 'root' })
// export class DashboardService {
//   private baseUrl = `${environment.apiBaseUrl}/dashboard`;
//   constructor(private http: HttpClient) {}

//   getOccupancy(): Observable<any> { return this.http.get(`${this.baseUrl}/occupancy`); }
//   getRevenue(): Observable<any> { return this.http.get(`${this.baseUrl}/revenue`); }
//   getPendingDues(): Observable<any> { return this.http.get(`${this.baseUrl}/pending-dues`); }
//   getUpcomingBills(): Observable<any> { return this.http.get(`${this.baseUrl}/upcoming-bills`); }
//   getLateFees(): Observable<any> { return this.http.get(`${this.baseUrl}/late-fees`); }
//   getRoomUtilization(): Observable<any> { return this.http.get(`${this.baseUrl}/room-utilization`); }
//   getStudentStats(): Observable<any> { return this.http.get(`${this.baseUrl}/student-stats`); }
//   generateBills(): Observable<any> {
//     return this.http.post(`${this.baseUrl}/generate-bills`, {});
//   }
// }


// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class DashboardService {

//   constructor() { }

//   // Mock Rooms Data
//   getRooms(): Observable<any[]> {
//     const rooms = [
//       { Id: 1, RoomNumber: '101', Capacity: 4, VacantCount: 2 },
//       { Id: 2, RoomNumber: '102', Capacity: 3, VacantCount: 0 },
//       { Id: 3, RoomNumber: '103', Capacity: 2, VacantCount: 1 },
//       { Id: 4, RoomNumber: '104', Capacity: 5, VacantCount: 5 }
//     ];
//     return of(rooms);
//   }

//   // Mock Occupants Data for a Room
//   getRoomOccupants(roomId: number): Observable<any[]> {
//     const occupants = {
//       1: [
//         { FullName: 'Alice Johnson', Gender: 'Female', Phone: '9876543210', Email: 'alice@example.com', IsTemporary: false, PaymentPending: true },
//         { FullName: 'Bob Smith', Gender: 'Male', Phone: '9123456780', Email: 'bob@example.com', IsTemporary: true, PaymentPending: false }
//       ],
//       2: [
//         { FullName: 'Charlie Brown', Gender: 'Male', Phone: '9988776655', Email: 'charlie@example.com', IsTemporary: false, PaymentPending: true },
//         { FullName: 'Diana Prince', Gender: 'Female', Phone: '9112233445', Email: 'diana@example.com', IsTemporary: false, PaymentPending: false },
//         { FullName: 'Eve Adams', Gender: 'Female', Phone: '9001122334', Email: 'eve@example.com', IsTemporary: true, PaymentPending: true }
//       ],
//       3: [
//         { FullName: 'Frank Miller', Gender: 'Male', Phone: '9876501234', Email: 'frank@example.com', IsTemporary: false, PaymentPending: false }
//       ],
//       4: []
//     };
//     return of(occupants[roomId] || []);
//   }

//     // Mock students data
//     getStudents(): Observable<any[]> {
//       const students = [
//         { Id: 1, Name: 'Alice Johnson', Gender: 'Female', Course: 'B.Tech', AdmissionDate: new Date('2025-10-01'), RoomNumber: '101', Active: true },
//         { Id: 2, Name: 'Bob Smith', Gender: 'Male', Course: 'B.Sc', AdmissionDate: new Date('2025-10-03'), RoomNumber: null, Active: false },
//         { Id: 3, Name: 'Charlie Brown', Gender: 'Male', Course: 'B.Tech', AdmissionDate: new Date('2025-10-02'), RoomNumber: '102', Active: true },
//         { Id: 4, Name: 'Diana Prince', Gender: 'Female', Course: 'B.Sc', AdmissionDate: new Date('2025-09-25'), RoomNumber: null, Active: false },
//         { Id: 5, Name: 'Eve Adams', Gender: 'Female', Course: 'B.Tech', AdmissionDate: new Date('2025-10-05'), RoomNumber: '103', Active: true }
//       ];
//       return of(students);
//     }
  
//     getCourses(): Observable<string[]> {
//       return of(['B.Tech', 'B.Sc', 'MCA', 'MBA']);
//     }


//     getPayments(criteria: string): Observable<any[]> {
//       const mockData = [
//         { StudentName: 'Asha Menon', PaymentDate: '2025-10-06', PaymentMode: 'UPI', TotalAmount: 25000, DueAmount: 0, Status: 'Verified' },
//         { StudentName: 'Ravi Kumar', PaymentDate: '2025-10-05', PaymentMode: 'Card', TotalAmount: 15000, DueAmount: 5000, Status: 'Pending' },
//         { StudentName: 'Sneha Raj', PaymentDate: '', PaymentMode: '-', TotalAmount: 0, DueAmount: 30000, Status: 'Pending' },
//         { StudentName: 'Manoj Iyer', PaymentDate: '2025-09-30', PaymentMode: 'Cash', TotalAmount: 20000, DueAmount: 10000, Status: 'Verified' }
//       ];
  
//       let filtered = mockData;
  
//       if (criteria === 'today') {
//         filtered = mockData.filter(p => p.PaymentDate === '2025-10-06');
//       } else if (criteria === 'month') {
//         filtered = mockData.filter(p => p.PaymentDate?.startsWith('2025-10'));
//       } else if (criteria === 'pending') {
//         filtered = mockData.filter(p => p.Status === 'Pending');
//       } else if (criteria === 'due') {
//         filtered = mockData.filter(p => p.DueAmount > 0);
//       }
  
//       return of(filtered);
//     }



// }
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiBaseUrl}/DashboardNew`;

  constructor(private http: HttpClient) {}

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rooms`);
  }

  getRoomOccupants(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rooms/${roomId}/occupants`);
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  getCourses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/courses`);
  }

  getPayments(criteria?: string): Observable<any[]> {
    const url = criteria
      ? `${this.baseUrl}/payments?criteria=${criteria}`
      : `${this.baseUrl}/payments`;
    return this.http.get<any[]>(url);
  }
  
}
