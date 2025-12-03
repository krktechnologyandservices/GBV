import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PayPeriodService, PayPeriod } from '../../attendance/lopprocess/payperiod.service';

@Component({
  selector: 'app-pay-period-form',
  templateUrl: './payperiod-form.component.html',
  styleUrls: ['./payperiod-form.component.scss']
})
export class PayPeriodFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private service: PayPeriodService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [0],
      payableCategoryId: [0, Validators.required],
      attendanceFrom: ['', Validators.required],
      attendanceTo: ['', Validators.required],
      payDate: ['', Validators.required],
      status: ['Active', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((res) =>{ ;
        const transformed = {
          ...res,
          attendanceFrom: this.formatDate(res.attendanceFrom),
          attendanceTo: this.formatDate(res.attendanceTo),
          payDate: this.formatDate(res.payDate),
          // Add more fields if needed
        };
        this.form.patchValue(transformed)
      
      });
    }
  }
  private formatDate(dateTimeString: string): string {
    return dateTimeString ? dateTimeString.split('T')[0] : '';
  }
  onSubmit() {
    const model: PayPeriod = this.form.value;
    if (this.isEdit) {
      this.service.update(model).subscribe(() => this.router.navigate(['/pages/transactions/payperiods']));
    } else {
      this.service.create(model).subscribe(() => this.router.navigate(['/pages/transactions/payperiods']));
    }
  }
}
