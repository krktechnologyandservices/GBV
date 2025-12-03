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
  NbFormFieldModule,NbRadioModule,NbLayoutModule,NbBadgeModule

} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';
import { Tab1Component, Tab2Component, TabsComponent } from './tabs/tabs.component';
import { StepperComponent } from './stepper/stepper.component';
import { ListComponent } from './list/list.component';
import { NewsService } from './news.service';
import { PayableCategoriesComponent } from './payablecategores/payablecategores.component';
import { OrgAttributesComponent } from './org-attributes/org-attributes.component';
import {OrgAttributesService} from  './org-attributes/org-attributes.service';
import { PayComponent } from './payablecomponent/payablecomponent.component';
import { TaxcomponentComponent } from './taxcomponent/taxcomponent.component';

import { EmployeeNewComponent } from './employee-new/employee-new.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { StudentsComponent } from './students/students.component';
import { StudentsFormComponent } from './students/studentsform/studentsform.component';
import { RoomComponent } from './rooms/rooms.component';
import { RoomFormComponent } from './rooms/rooms-form/rooms-form.component';
import { DashboardComponent } from './datshboard/datshboard.component';
import { NbTooltipModule } from '@nebular/theme';

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
    NbRadioModule,
    NbLayoutModule,
    NbTooltipModule,
    NbBadgeModule
    
  ],
  declarations: [
    MasterComponent,
    TabsComponent,
    Tab1Component,
    Tab2Component,
    StepperComponent,
    ListComponent,
 
    PayableCategoriesComponent,
    OrgAttributesComponent,
    PayComponent,
    TaxcomponentComponent,
  
    EmployeeNewComponent,
       EmployeeFormComponent,
       StudentsComponent,
       StudentsFormComponent,
       RoomComponent,
       RoomFormComponent,
       DashboardComponent,

  
  ],
  providers: [
    NewsService,
    OrgAttributesService
  ],
})
export class MasterModule { }
