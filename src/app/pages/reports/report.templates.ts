import { ReportConfig } from '../reports/shared/report/report.models';

export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  payslip: {
    title: 'Payslip Report',
    apiUrl: '/api/report/payslip',
    filters: [
      { name: 'employeeCode', label: 'Employee Code', type: 'text' },
      { name: 'month', label: 'Month', type: 'number' },
      { name: 'year', label: 'Year', type: 'number' }
    ],
    columns: [
      { field: 'EmployeeName', header: 'Name' , type: 'number'},
      { field: 'Month', header: 'Month', type: 'number' },
      { field: 'GrossSalary', header: 'Gross Salary' , type: 'number'},
      { field: 'EISAmount', header: 'EIS' , type: 'number'}
    ],
    enableManualEntry: false
  },

  esireport: {
    title: 'ESI Statement for the month of [monthText]',
    apiUrl: '/reports',
    filters: [
     
      // { name: 'paydate', label: 'PayDate', type: 'date' },
     
    ],
    columns: [
      { field: 'SNo', header: 'S.No' , type: 'number'},
      { field: 'EmployeeName', header: 'Employee Name' , type: 'number'},
      { field: 'EsiNo', header: 'ESI Number/IP Number' , type: 'number'},
      { field: 'EsiWages', header: 'Esi Wages' , type: 'number'},
      { field: 'EsiAmount', header: 'Employee Contribution(0.75%)' , type: 'number'},
      { field: 'EsiEmployerAmount', header: 'Employer Contribution(3.25)' , type: 'number'},
      { field: 'TotalContribution', header: 'Total Contribution' , type: 'number'},
      { field: 'WorkDays', header: 'Working Days' , type: 'number'},
      { field: 'Remarks', header: 'Remarks' , type: 'number'}
    
    ],
    enableManualEntry: false
  },
  pfreport: {
    title: 'PF Statement for the month of [monthText]',
    apiUrl: '/reports',
    filters: [
      
      // { name: 'paydate', label: 'Paydate', type: 'date' }
    ],
    columns: [
      { field: 'SNo', header: 'S.No' , type: 'number'},
      { field: 'EmployeeName', header: 'Employee Name' , type: 'number'},
      { field: 'UAN', header: 'UAN  ' , type: 'number'},
      { field: 'PFNo', header: 'PF Account No  ' , type: 'number'},
      { field: 'Wages', header: 'Wages' , type: 'number'},
      { field: 'PF', header: 'Employee Contribution  ' , type: 'number'},
      { field: 'EPF', header: 'Employer Contribution(EPF)  ' , type: 'number'},
      { field: 'EPS', header: 'Employer Pension(EPS)  ' , type: 'number'},
      { field: 'Total', header: 'Total Contribution' , type: 'number'},
    ],
    enableManualEntry: false
  }
  ,
  ptreport: {
    title: 'PT Statement for the month of [monthText]',
    apiUrl: '/reports',
    filters: [
      
      // { name: 'paydate', label: 'Paydate', type: 'date' }
    ],
    columns: [
      { field: 'SNo', header: 'S.No' , type: 'number'},
      { field: 'EmployeeName', header: 'Employee Name' , type: 'number'},
      { field: 'UAN', header: 'UAN  ' , type: 'number'},
      { field: 'PFNo', header: 'PF Account No  ' , type: 'number'},
      { field: 'wages', header: 'Wages' , type: 'number'},
      { field: 'PF', header: 'Employee Contribution  ' , type: 'number'},
      { field: 'EPF', header: 'Employer Contribution(EPF)  ', type: 'number' },
      { field: 'EPS', header: 'Employer Pension(EPS)  ' , type: 'number'},
      { field: 'Total', header: 'Total Contribution', type: 'number' },
    ],
    enableManualEntry: false
  },
  lwfreport: {
    title: 'Lwf Statement for the Year of [monthText]',
    apiUrl: '/reports',
    filters: [
      
      // { name: 'paydate', label: 'Paydate', type: 'date' }
    ],
    columns: [
      { field: 'SNo', header: 'S.No', type: 'number' },
      { field: 'EmployeeName', header: 'Employee Name' , type: 'number'},
      { field: 'EmployeeCode', header: 'Employee Code', type: 'number' },
      { field: 'WorkDays', header: 'Work Days', type: 'number' },
      { field: 'Lwf', header: 'Employee Contribution' , type: 'number'},
      { field: 'LwfEmplR', header: 'Employer Contribution', type: 'number' },
      { field: 'TotalContribution', header: 'Total Contribution', type: 'number' }
    
    ],
    enableManualEntry: false
  }
  ,
  btreport: {
    title: 'Bank Transfer Report of the Month [monthText]',
    apiUrl: '/reports',
    filters: [
      { name: 'BankName', label: 'Select Banks', type: 'select' }
    ],
    columns: [
      { field: 'SNo', header: 'S.No', type: 'number' },
      { field: 'EmployeeName', header: 'Employee Name', type: 'text' },
      { field: 'AccountNo', header: 'Account No', type: 'text' },
      { field: 'NameofBank', header: 'Name of Bank', type: 'text' },
      { field: 'IfscCode', header: 'Ifsc Code', type: 'text' },
      { field: 'TransactionType', header: 'Transaction Type', type: 'text' },
      { field: 'Amount', header: 'Amount', type: 'number' }
    ],
    enableManualEntry: true,
    maxManualRows: 1
  }
  // Add more reports here...
};
