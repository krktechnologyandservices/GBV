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
  NbFormFieldModule

} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';

import { PayableCategoriesComponent } from './payablecategores/payablecategores.component';
import { OrgAttributesComponent } from './org-attributes/org-attributes.component';
import {OrgAttributesService} from  './org-attributes/org-attributes.service';
import { PayComponent } from './payablecomponent/payablecomponent.component';
import { TaxcomponentComponent } from './taxcomponent/taxcomponent.component';

import { EmployeeNewComponent } from './employee-new/employee-new.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';


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
    MasterRoutingModule,
    NbCheckboxModule,
    NbInputModule ,
    NbSelectModule,
    NbIconModule,
    NbFormFieldModule,
  ],
  declarations: [
    MasterComponent,
  
  
    PayableCategoriesComponent,
    OrgAttributesComponent,
    PayComponent,
    TaxcomponentComponent,
  
    EmployeeNewComponent,
       EmployeeFormComponent,

  
  ],
  providers: [
    OrgAttributesService
  ],
})
export class MasterModule { }
