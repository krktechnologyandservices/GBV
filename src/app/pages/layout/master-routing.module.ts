import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterComponent } from './master.component';
// import { Tab1Component, Tab2Component, TabsComponent } from './tabs/tabs.component';
// import { AccordionComponent } from './accordion/accordion.component';
// import { InfiniteListComponent } from './infinite-list/infinite-list.component';
// import { ListComponent } from './list/list.component';
// import { StepperComponent } from './stepper/stepper.component';

import { StudentsComponent } from './students/students.component';
import { StudentsFormComponent } from './students/studentsform/studentsform.component';
import { RoomComponent } from './rooms/rooms.component';
import { RoomFormComponent } from './rooms/rooms-form/rooms-form.component';
const routes: Routes = [{
  path: '',
  component: MasterComponent,
  children: [
    // {
    //   path: 'stepper',
    //   component: StepperComponent,
    // },
    {
      path: 'students',
      component: StudentsComponent,
      
    }
    ,{ path: 'students/add', component: StudentsFormComponent },
    { path: 'students/edit/:id', component: StudentsFormComponent },
    { path: '', redirectTo: 'students', pathMatch: 'full' },
    {
      path: 'rooms',
      component: RoomComponent,
      
    },
    { path: 'rooms/add', component: RoomFormComponent },
{ path: 'rooms/edit/:id', component: RoomFormComponent },

   
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
