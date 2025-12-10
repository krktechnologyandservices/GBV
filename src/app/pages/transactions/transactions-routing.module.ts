import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TransactionsComponent} from './transactions/transactions.component';
import { AttendanceListComponent } from './attendance/attendance-list/attendance-list.component';
import {AttendanceSettingsComponent} from'./attendance/attendance-settings/attendance-settings.component';

import {AttendanceFormComponent}  from './attendance/attendance-form/attendance-form.component';
import {PayPeriodListComponent} from './payperiod/payperiod.component';
import {PayPeriodFormComponent} from './payperiod/payperiod-form/payperiod-form.component';
import {LopProcessorComponent} from './attendance/lopprocess/lopprocess.component';
import {EmployeePayComponent} from './salarycomponents/salarycomponents.component'
const routes: Routes = [{
  path: '',
  component: TransactionsComponent,
  children: [
    // {
    //   path: 'stepper',
    //   component: StepperComponent,
    // },
    {
      path: 'attendance',
      component: AttendanceListComponent,
      }
      
      ]

    },
    {
      path:'attendanceentry',
      component:AttendanceFormComponent
    },
    {
      path: 'attendancesettings',
      component:AttendanceSettingsComponent,
      
},
{ path: 'payperiods', component: PayPeriodListComponent },
{ path: 'payperiods/form', component: PayPeriodFormComponent },
{ path: 'payperiods/form/:id', component: PayPeriodFormComponent },
{
  path:'processlop',
  component:LopProcessorComponent
},
{
  path:'salarypaycomponent',
  component:EmployeePayComponent
},
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {
}
