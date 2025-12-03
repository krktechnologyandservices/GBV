import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PayPeriodService, PayPeriod } from '../attendance/lopprocess/payperiod.service';

@Component({
  selector: 'app-pay-period-list',
  templateUrl: './payperiod.component.html'
})
export class PayPeriodListComponent implements OnInit {
  payPeriods: PayPeriod[] = [];

  constructor(private service: PayPeriodService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getAll().subscribe((res) => (this.payPeriods = res));
  }

  edit(id: number) {
    this.router.navigate(['/pages/transactions/payperiods/form', id]);
  }

  create() {
    this.router.navigate(['/pages/transactions/payperiods/form']);
  }

  delete(id: number) {
    if (confirm('Delete this Pay Period?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}