import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { BookingFormComponent } from './booking/bookingforms/bookingforms.component';
import { PaymentFormComponent } from './payments/paymentsforms/paymentsforms.component';
import { BillsComponent } from './bills/bills.component';
import { PaymentListComponent } from './payments/payments.component';
import { DayBookComponent } from './daybook/daybook.component';
import {PaymentRegisterComponent} from './paymentregister/paymentregister.component'
const routes: Routes = [
    
  { path: 'bookings', component: BookingComponent },
  { path: 'bookings/add', component: BookingFormComponent },
  { path: 'bookings/edit/:id', component:BookingFormComponent },
  { path: 'bookings/payment/:id', component: PaymentFormComponent },
  { path: 'bills', component: BillsComponent },
  { path: 'payments', component: PaymentListComponent },
  { path: 'payments/new', component: PaymentFormComponent },      // New payment
  { path: 'payments/:id/edit', component: PaymentFormComponent }, // Edit payment
  { path: 'daybookview', component: DayBookComponent }, // Edit payment
  { path: 'paymentregister', component: PaymentRegisterComponent }, // Edit payment
  
  
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {
}
