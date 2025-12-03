import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule, NbUserModule,NbCheckboxModule,NbInputModule ,NbSelectModule,
  NbIconModule,
  NbFormFieldModule,NbAutocompleteModule ,NbBadgeModule, NbLayoutModule

} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { TransactionRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions/transactions.component';

import { AttendanceListComponent } from './attendance/attendance-list/attendance-list.component';
import {AttendanceFormComponent} from './attendance/attendance-form/attendance-form.component';
import {GracePeriodsComponent} from './attendance/attendance-settings/grace-periods/grace-periods.component';
import {AttendanceSettingsComponent} from './attendance/attendance-settings/attendance-settings.component';
import {WorkHoursComponent} from './attendance/attendance-settings/working-hours/working-hours.component';
import {AttendanceReasonsComponent} from './attendance/attendance-settings/working-reasons/working-reasons.component';

import { LopProcessorComponent } from './attendance/lopprocess/lopprocess.component';
import { PayPeriodListComponent } from './payperiod/payperiod.component';
import { PayPeriodFormComponent } from './payperiod/payperiod-form/payperiod-form.component';
import { EmployeePayComponent } from './salarycomponents/salarycomponents.component';
import { BookingComponent } from './booking/booking.component';
import { PaymentListComponent } from './payments/payments.component';
import { PaymentFormComponent } from './payments/paymentsforms/paymentsforms.component';
import { BookingFormComponent } from './booking/bookingforms/bookingforms.component';
import { BillsComponent } from './bills/bills.component';

import { AdminApprovalComponent } from './bills/admin-approval/admin-approval.component';
import { OfflinePaymentModalComponent } from './bills/offlinepaymentmodal/offlinepaymentmodal.component';
import {DayBookComponent} from './daybook/daybook.component';
import { PaymentRegisterComponent } from './paymentregister/paymentregister.component';


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    NbTabsetModule,
    NbRouteTabsetModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
    NbAccordionModule,
    NbUserModule,
    TransactionRoutingModule,
    NbCheckboxModule,
    NbInputModule ,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,NbAutocompleteModule ,NbBadgeModule,NbLayoutModule
  ],
  declarations: [
    TransactionsComponent,
    AttendanceListComponent,
    AttendanceFormComponent,
    GracePeriodsComponent,
    AttendanceSettingsComponent,
    WorkHoursComponent,
    AttendanceReasonsComponent,

    LopProcessorComponent,
    PayPeriodListComponent,
    PayPeriodFormComponent,
    EmployeePayComponent,
    BookingComponent,
    PaymentListComponent,
    PaymentFormComponent,
    BookingFormComponent,
    BillsComponent,

    AdminApprovalComponent,
    OfflinePaymentModalComponent,
    DayBookComponent,
    PaymentRegisterComponent
    
  
  ],
  
})
export class TransactionsModule { }
