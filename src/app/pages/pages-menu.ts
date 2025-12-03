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
        title: 'Students',
        link: '/pages/master/students',
      },
      {
        title: 'Rooms',
        link: '/pages/master/rooms',
     },
    //   {
    //     title: 'Pay Components',
    //     link: '/pages/master/payablecomponent',
    //   },
    // //   {
    // //   title: 'Tax Components',
    // //   link: '/pages/master/taxablecomponent',
    // // },
    //   {
    //     title: 'Employee Master',
    //     link: '/pages/master/employeemaster',
    //   },
      
      
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
        title: 'Bookings',
        pathMatch: 'prefix',
        link: '/pages/transactions/bookings',
      },
      {
        title: 'Bills',
        pathMatch: 'prefix',
        link: '/pages/transactions/bills',
       },
      {
        title: 'Payments',
        pathMatch: 'prefix',
        link: '/pages/transactions/payments',
      },
      {
        title: 'Payment Register',
        pathMatch: 'prefix',
        link: '/pages/transactions/paymentregister',
      },
      {
      title: 'Daybook view',
      pathMatch: 'prefix',
      link: '/pages/transactions/daybookview',
    },
  
    ],
  },
  // {
  //   title: 'Reports',
  //   icon: 'file-text-outline',
  //   children: [
  //     {
  //       title: 'Payslip View',
  //       link: '/pages/reports/payslipview',
  //     },
  //     // {
  //     //   title: 'Payslip Report',
  //     //   link: '/pages/ui-features/icons',
  //     // },
  //     // {
  //     //   title: 'PF Report',
  //     //   link: '/pages/reports/pfreport',
  //     // },
  //     // {
  //     //   title: 'Esi Rerport',
  //     //   link: '/pages/reports/esireport',
  //     // }
  //     // ,
  //     // {
  //     //   title: 'PT Report',
  //     //   link: '/pages/reports/ptreport',
  //     //  },
  //     // {
  //     //   title: 'Bank Transfer',
  //     //   link: '/pages/reports/btreport',
  //     // },
  //   ],
  // // },
  // // {
  // //   title: 'Settings',
  // //   icon: 'settings-outline',
  // //   children: [
  // //     {
  // //       title: 'Profile',
  // //       link: '/pages/modal-overlays/dialog',
  // //     },
  // //     {
      
  // //       title: 'Preferences',
  // //       link: '/pages/modal-overlays/window',
  // //     },
  // //   ],
  // }
];
