import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'ngx-attendance-settings',
  templateUrl: './attendance-settings.component.html',
  styleUrls: ['./attendance-settings.component.scss']
})
export class AttendanceSettingsComponent {
  constructor( private router: Router) {}
  onCancel()
  {
    this.router.navigate(['/pages/transactions/attendance']);
  }
}
