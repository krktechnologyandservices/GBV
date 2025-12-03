import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';

import { Reportparent } from './reportparent.component';
import {PayslipviewComponent} from '../../payslipview/payslipview.component'

const routes: Routes = [
  {
    path: 'payslipview',
    component: PayslipviewComponent,
  },
  {
  path: '',
  component:Reportparent,
  children:[
    
  
    { path:':reportType',component:ReportComponent},
    
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {
}
