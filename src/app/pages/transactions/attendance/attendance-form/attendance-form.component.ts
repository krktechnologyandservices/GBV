import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../attendance.service';
import { AttendanceSession } from '../attendance.service';

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss'],
})
export class AttendanceFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private service: AttendanceService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [0],
      employeeId: [0],
      attendanceDate: [''],
      checkInTime: [''],
      checkOutTime: [''],
      status: [''],
      attendanceType: ['Manual'],
      remarks: [''],
      reasonCode: [''],
      requiresApproval: [false],
    });
  }


  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    const type = this.route.snapshot.queryParamMap.get('type');
  
    this.isEdit = !!this.id;
  
    if (!this.isEdit && type === 'manual') {
      this.form.patchValue({
        attendanceType: 'Manual',
        requiresApproval: true,
      });
    }
  
    if (this.isEdit) {
      this.service.getById(this.id!).subscribe((data) => {
        this.form.patchValue(data);
      });
    }
  }
  

  onSubmit() {
    const model: AttendanceSession = this.form.value;
    model.checkInTime = this.formatTime(this.form.value.checkInTime);
    model.checkOutTime = this.form.value.checkOutTime
      ? this.formatTime(this.form.value.checkOutTime)
      : null;

    if (this.isEdit) {
      this.service.update(model).subscribe(() => this.router.navigate(['/pages/transactions/attendance']));
    } else {
      this.service.create(model).subscribe(() => this.router.navigate(['/pages/transactions/attendance']));
    }
  }
  formatTime(time: string | Date): string {
    const t = new Date(`1970-01-01T${time}`);
    return t.toTimeString().split(' ')[0]; // returns "HH:mm:ss"
  }

}

