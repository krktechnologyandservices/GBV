import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'FEATURES',
    group: true,
  },
  {
    title: 'Masters',
    icon: 'layers-outline',
    children: [
      {
        title: 'Payable Categories',
        link: '/pages/master/payablecategories',
      },
      {
        title: 'Organization Attribute Categories',
        link: '/pages/master/OrgAttributes',
      },
      {
        title: 'Pay Components',
        link: '/pages/master/payablecomponent',
      },
    //   {
    //   title: 'Tax Components',
    //   link: '/pages/master/taxablecomponent',
    // },
      {
        title: 'Employee Master',
        link: '/pages/master/employeemaster',
      },
      
      
    ],
  },
  {
    title: 'Transactions',
    icon: 'briefcase-outline',
    children: [
  
      // {
      //   title: 'Work Allocation Entry ',
      //   pathMatch: 'prefix',
      //   link: '/pages/layout/tabs',
      // },
      {
        title: 'Pay Periods',
        pathMatch: 'prefix',
        link: '/pages/transactions/payperiods',
      },
      {
        title: 'Attendance Entry',
        pathMatch: 'prefix',
        link: '/pages/transactions/attendance',
      },
      {
      title: 'Salary Pay component',
      pathMatch: 'prefix',
      link: '/pages/transactions/salarypaycomponent',
    },
  
    ],
  },
  {
    title: 'Reports',
    icon: 'file-text-outline',
    children: [
      {
        title: 'Payslip View',
        link: '/pages/reports/payslipview',
      },
      // {
      //   title: 'Payslip Report',
      //   link: '/pages/ui-features/icons',
      // },
      // {
      //   title: 'PF Report',
      //   link: '/pages/reports/pfreport',
      // },
      // {
      //   title: 'Esi Rerport',
      //   link: '/pages/reports/esireport',
      // }
      // ,
      // {
      //   title: 'PT Report',
      //   link: '/pages/reports/ptreport',
      //  },
      {
        title: 'Bank Transfer',
        link: '/pages/reports/btreport',
      },
    ],
  // },
  // {
  //   title: 'Settings',
  //   icon: 'settings-outline',
  //   children: [
  //     {
  //       title: 'Profile',
  //       link: '/pages/modal-overlays/dialog',
  //     },
  //     {
      
  //       title: 'Preferences',
  //       link: '/pages/modal-overlays/window',
  //     },
  //   ],
  }
];
