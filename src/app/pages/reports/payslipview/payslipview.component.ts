import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'ngx-payslipview',
  templateUrl: './payslipview.component.html',
  styleUrls: ['./payslipview.component.scss']
})
export class PayslipviewComponent {
  employees: any[] = [];
  selectedEmployeeId: number | null = null;
  payslip: any = {};
  showAll = false;
  apiUrl=environment.apiReportUrl;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load employee list for the dropdown
    this.http.get(`${this.apiUrl}/Payslip/employee/list`).subscribe((res: any) => {
      this.employees = res;
    });
  }

  onEmployeeChange() {
    if (this.selectedEmployeeId) {
      // Use your actual processId or add a way to select it
      const processId = 1106; 
      this.http.get(`${this.apiUrl}/payslip/${this.selectedEmployeeId}/${processId}`).subscribe((res: any) => {
        this.payslip = res;
      });
    } else {
      this.payslip = {};
    }
  }

  get earnings() {
    return this.payslip.components?.filter((c: any) =>
      this.showAll ? !c.isDeduction 
      && c.componentName!=="GROSSDEDUCTION" &&  c.componentName!=="GROSSEARNINGS" 
      && c.componentName!=="NETPAY"  
      : !c.isDeduction && c.netAmount > 0 
      && c.componentName!=="GROSSDEDUCTION" &&  c.componentName!=="GROSSEARNINGS" 
      && c.componentName!=="NETPAY"  
    ) || [];
  }

  get deductions() {
    return this.payslip.components?.filter((c: any) =>
      this.showAll ? c.isDeduction 
      && c.componentName!=="GROSSDEDUCTION" &&  c.componentName!=="GROSSEARNINGS" 
      && c.componentName!=="NETPAY"  
      : c.isDeduction && c.netAmount > 0 
      && c.componentName!=="GROSSDEDUCTION" &&  c.componentName!=="GROSSEARNINGS" 
      && c.componentName!=="NETPAY"  
    ) || [];
  }

  get grossEarnings() {
    return this.payslip.components?.find((c: any) => c.componentName === "GROSSEARNINGS")?.netAmount ?? 0;
  }

  get grossDeductions() {
    return this.payslip.components?.find((c: any) => c.componentName === "GROSSDEDUCTION")?.netAmount ?? 0;
  }

  get netPay() {     
    return this.payslip.components?.find((c: any) => c.componentName === "NETPAY")?.netAmount ?? 0;
  }

  downloadPDF(): void {
    const content = document.getElementById('payslip-content');
    if (!content) return;
  
    html2canvas(content, {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
  
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      const imgProps = {
        width: pageWidth,
        height: (canvas.height * pageWidth) / canvas.width
      };
  
      // If image height > page, scale to fit
      let position = 0;
      if (imgProps.height > pageHeight) {
        const ratio = pageHeight / imgProps.height;
        imgProps.width = imgProps.width * ratio;
        imgProps.height = pageHeight;
      }
  
      pdf.addImage(imgData, 'PNG', 0, position, imgProps.width, imgProps.height);
  
      // Optional: add a footer/seal
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text('This document is system-generated and confidential.', 10, 290);
  
      pdf.save(`Payslip_${this.payslip?.employeeCode || 'Employee'}.pdf`);
    });
  }
}
