import { NgModule } from '@angular/core';
import { NbMenuModule,
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule, NbUserModule,NbCheckboxModule,NbInputModule ,NbSelectModule,
  NbIconModule,
  NbFormFieldModule,NbLayoutModule,NbActionsModule ,
  NbContextMenuModule,
  NbSidebarModule 

} from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import {ConfirmDialogModule} from '../pages/shared/confirm-dialog/confirm-dialog.module';
import {ReactiveFormsModule } from  '@angular/forms';
import { PayslipviewComponent } from './reports/payslipview/payslipview.component';



@NgModule({
  imports: [
    NbFormFieldModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    ConfirmDialogModule,
    NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbListModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbTabsetModule, 
  NbUserModule,
  NbCheckboxModule,
  NbInputModule ,
  NbSelectModule,
  NbSidebarModule ,
  NbIconModule,NbLayoutModule,NbActionsModule ,NbContextMenuModule,
 
  
  ],
  declarations: [
    PagesComponent,
    
    

    
  ],
})
export class PagesModule {
}
