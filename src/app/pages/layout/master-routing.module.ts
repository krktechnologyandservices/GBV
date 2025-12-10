import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterComponent } from './master.component';
// import { Tab1Component, Tab2Component, TabsComponent } from './tabs/tabs.component';
// import { AccordionComponent } from './accordion/accordion.component';
// import { InfiniteListComponent } from './infinite-list/infinite-list.component';
// import { ListComponent } from './list/list.component';
// import { StepperComponent } from './stepper/stepper.component';

import { PayableCategoriesComponent } from './payablecategores/payablecategores.component';
import { OrgAttributesComponent } from './org-attributes/org-attributes.component';

import  {PayComponent} from './payablecomponent/payablecomponent.component';

import  {TaxcomponentComponent} from './taxcomponent/taxcomponent.component';
import  {EmployeeNewComponent} from './employee-new/employee-new.component';
import  {EmployeeFormComponent} from './employee-form/employee-form.component';
const routes: Routes = [{
  path: '',
  component: MasterComponent,
  children: [
    // {
    //   path: 'stepper',
    //   component: StepperComponent,
    // },
    {
      path: 'payablecategories',
      component: PayableCategoriesComponent,
    },
    
    {
      path: 'OrgAttributes',
      component: OrgAttributesComponent,
    },
    {
      path: 'payablecomponent',
      component: PayComponent,
    },
    {
      path: 'taxablecomponent',
      component: TaxcomponentComponent,
    },
    {
      path: 'employeemaster',
      component: EmployeeNewComponent,
    },
    {
      path: 'createmployee',
      component: EmployeeFormComponent,
    },
    {
      path: 'editemployee/:id',
      component: EmployeeFormComponent,
    }

   
    // {
    //   path: 'tabs',
    //   component: TabsComponent,
    //   children: [
    //     {
    //       path: '',
    //       redirectTo: 'tab1',
    //       pathMatch: 'full',
    //     },
    //     {
    //       path: 'tab1',
    //       component: Tab1Component,
    //     },
    //     {
    //       path: 'tab2',
    //       component: Tab2Component,
    //     },
    //   ],
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {
}
