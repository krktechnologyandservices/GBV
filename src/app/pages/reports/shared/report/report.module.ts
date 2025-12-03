import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Reportparent} from './reportparent.component';
import { ThemeModule } from '../../../../@theme/theme.module';
import { ReportsRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { ReactiveFormsModule } from '@angular/forms';
import {PayslipviewComponent} from '../../payslipview/payslipview.component';
import { FormsModule } from '@angular/forms';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule, NbUserModule,NbCheckboxModule,NbInputModule ,NbSelectModule,
  NbIconModule,
  NbFormFieldModule

} from '@nebular/theme';

@NgModule({
  declarations: [Reportparent,ReportComponent,PayslipviewComponent],
  imports: [
    CommonModule,
    ThemeModule,
    NbTabsetModule,
    NbRouteTabsetModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
    NbAccordionModule,
    NbUserModule,
    NbCheckboxModule,
    NbInputModule ,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    FormsModule
  ]
})
export class ReportModule { }
