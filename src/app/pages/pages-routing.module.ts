import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
//import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardComponent } from './layout/datshboard/datshboard.component';

import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'iot-dashboard',
      component: DashboardComponent,
    },
    {
      path: 'master',
      loadChildren: () => import('./layout/master.module')
        .then(m => m.MasterModule),
    },
    {
      path: 'transactions',
      loadChildren: () => import('./transactions/transactions.module')
        .then(m => m.TransactionsModule),
    },
    {
      path: 'reports',
      loadChildren: () => import('./reports/shared/report/report.module')
        .then(m => m.ReportModule),
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
