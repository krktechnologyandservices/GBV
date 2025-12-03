import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceService } from '..//attendance.service';

@Component({
  selector: 'ngx-attendance-list',
  templateUrl: './attendance-list.component.html',
})
export class AttendanceListComponent implements OnInit {
  attendanceList: any[] = [];
  loading = false;

  menuItems = [
    { title: 'Edit' },
    { title: 'Delete' },
    { title: 'Settings', link: '/pages/attendance/settings' },
  ];

  constructor(private attendanceService: AttendanceService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        this.attendanceList = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
  createManualEntry() {
    this.router.navigate(['/pages/transactions/attendanceentry'], { queryParams: { type: 'manual' } });
  }
  goToSettings() {
    this.router.navigate(['/pages/transactions/attendancesettings'] );
  }
  processLOP() {
    this.router.navigate(['/pages/transactions/processlop'] );
  }

  onActionClick(item: any, session: any) {
    switch (item.title) {
      case 'Edit':
        this.router.navigate(['/pages/attendance/edit', session.id]);
        break;
      case 'Delete':
        if (confirm('Are you sure to delete?')) {
          this.attendanceService.delete(session.id).subscribe(() => this.load());
        }
        break;
      case 'Settings':
        this.router.navigateByUrl(item.link);
        break;
    }
  }
}
