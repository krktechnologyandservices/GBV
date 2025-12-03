// paymentregister.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaymentRegisterService } from './paymentregister.service';
import * as jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-payment-register',
  templateUrl: './paymentregister.component.html',
  styleUrls: ['./paymentregister.component.scss']
})
export class PaymentRegisterComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  payments: any[] = [];
  rooms: any[] = [];
  students: any[] = [];
  
  // UI State
  isFiltersExpanded = true;
  isTableView = true;
  isLoading = false;
  currentPage = 1;
  totalRecords = 0;
  hasNextPage = false;
  
  // Section expansion state
  expandedSections = new Map<string, Set<string>>();

  constructor(private fb: FormBuilder, private service: PaymentRegisterService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadFilters();
    this.submitFilter();
    
    // Initialize with filters expanded on desktop, collapsed on mobile
    this.isFiltersExpanded = window.innerWidth > 768;
  }

  ngOnDestroy(): void {
    this.expandedSections.clear();
  }

  private initializeForm(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    this.filterForm = this.fb.group({
      rooms: [[]],
      students: [[]],
      fromDate: [todayStr],
      toDate: [todayStr]
    });
  }

  loadFilters(): void {
    this.service.getRooms().subscribe({
      next: (res) => this.rooms = res,
      error: (error) => console.error('Error loading rooms:', error)
    });
    
    this.service.getStudents().subscribe({
      next: (res) => this.students = res,
      error: (error) => console.error('Error loading students:', error)
    });
  }

  loadPayments(filters?: any): void {
    this.isLoading = true;
    
    const filterData = filters || this.filterForm.value;
    
    this.service.getPayments(filterData).subscribe({
      next: (res) => {
        this.payments = res;
        this.totalRecords = res.length;
        this.hasNextPage = this.payments.length > 10;
        this.isLoading = false;
        
        // Debug log to check data
        console.log('Payments loaded:', this.payments.length);
        if (this.payments.length > 0) {
          console.log('Sample payment:', this.payments[0]);
        }
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
        this.payments = [];
      }
    });
  }

  submitFilter(): void {
    this.currentPage = 1;
    const filters = this.filterForm.value;
    this.loadPayments(filters);
  }

  resetFilters(): void {
    this.initializeForm();
    this.submitFilter();
  }

  refreshData(): void {
    this.submitFilter();
  }

  toggleFilterExpansion(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  toggleViewMode(): void {
    this.isTableView = !this.isTableView;
  }

  // Section expansion methods
  toggleSection(payment: any, sectionType: string): void {
    const paymentKey = this.getPaymentKey(payment);
    if (!this.expandedSections.has(paymentKey)) {
      this.expandedSections.set(paymentKey, new Set());
    }
    
    const sections = this.expandedSections.get(paymentKey)!;
    if (sections.has(sectionType)) {
      sections.delete(sectionType);
    } else {
      sections.add(sectionType);
    }
  }

  isSectionExpanded(payment: any, sectionType: string): boolean {
    const paymentKey = this.getPaymentKey(payment);
    return this.expandedSections.get(paymentKey)?.has(sectionType) || false;
  }

  private getPaymentKey(payment: any): string {
    return `${payment.id || payment.paymentId}-${payment.studentName}`;
  }

  // Pagination methods
  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.submitFilter();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.submitFilter();
    }
  }

  // TrackBy functions for performance
  trackByPaymentId(index: number, payment: any): string {
    return payment.id || payment.paymentId || index.toString();
  }

  trackByRoomId(index: number, room: any): string {
    return room.Id || index.toString();
  }

  trackByStudentId(index: number, student: any): string {
    return student.Id || index.toString();
  }

  // FIXED: Status methods - return string instead of object
  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('completed') || statusLower === 'paid') {
      return 'status-paid';
    } else if (statusLower.includes('pending') || statusLower.includes('processing') || statusLower === 'pending') {
      return 'status-pending';
    } else if (statusLower.includes('failed') || statusLower.includes('overdue') || statusLower.includes('cancelled') || statusLower === 'failed') {
      return 'status-failed';
    }
    return 'status-pending';
  }

  getStatusIcon(status: string): string {
    if (!status) return 'clock-outline';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower.includes('completed') || statusLower === 'paid') {
      return 'checkmark-circle-outline';
    } else if (statusLower.includes('pending') || statusLower.includes('processing') || statusLower === 'pending') {
      return 'clock-outline';
    } else if (statusLower.includes('failed') || statusLower.includes('overdue') || statusLower.includes('cancelled') || statusLower === 'failed') {
      return 'close-circle-outline';
    }
    return 'clock-outline';
  }

  // Action methods
  viewPaymentDetails(payment: any): void {
    console.log('View payment details:', payment);
  }

  async exportPDF(): Promise<void> {
    if (this.payments.length === 0) {
      console.warn('No payments to export');
      return;
    }
  
    try {
      const doc = new jsPDF.default('p', 'pt', 'a4');
      let yPos = 80;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40; // Consistent margin for better layout
      const contentWidth = pageWidth - (2 * margin); // Calculate content width
      
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const currentTime = new Date().toLocaleTimeString();
  
      // Load logo as Base64
      const logoData = await this.getImageAsBase64('assets/images/DaleViewLogo.jpg');
  
      // Modern color scheme
      const colors = {
        primary: [41, 128, 185],
        secondary: [52, 73, 94],
        accent: [46, 204, 113],
        warning: [241, 196, 15],
        lightBg: [248, 249, 250],
        border: [234, 236, 238]
      };
  
      // Calculate payment mode breakdown
      const paymentModeBreakdown = this.calculatePaymentModeBreakdown();
      const totalAmount = this.payments.reduce((sum, pay) => sum + (pay.paymentAmount || 0), 0);
  
      // Modern header
      const drawHeader = () => {
        // Header background
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 0, pageWidth, 60, 'F');
  
        // Logo
        if (logoData) {
          doc.addImage(logoData, 'JPEG', 30, 15, 40, 20);
        }
  
        // Title
        doc.setFontSize(16).setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("DALE VIEW HOSTEL", pageWidth / 2, 25, { align: "center" });
        
        doc.setFontSize(12).setFont("helvetica", "normal");
        doc.text("PAYMENT REGISTER", pageWidth / 2, 42, { align: "center" });
  
        // Date and time
        doc.setFontSize(9);
        doc.text(`Generated: ${currentDate} | ${currentTime}`, pageWidth - 30, 45, { align: "right" });
  
        yPos = 80;
      };
  
      // Modern footer
      const drawFooter = (pageNumber: number) => {
        doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
        
        doc.setFontSize(8).setTextColor(255, 255, 255);
        doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 15, { align: "center" });
        doc.text("Dale View Hostel - Confidential", pageWidth / 2, pageHeight - 8, { align: "center" });
      };
  
      let currentPage = 1;
      drawHeader();
      drawFooter(currentPage);
  
      // Summary section
      const paidCount = this.payments.filter(pay => pay.paymentStatus === 'Paid').length;
      const pendingCount = this.payments.filter(pay => pay.paymentStatus === 'Pending').length;
  
      // Summary cards
      const drawSummaryCards = () => {
        const cardWidth = (contentWidth) / 4; // Use contentWidth instead of pageWidth
        const cardHeight = 45;
        const startX = margin;
  
        // Total Payments Card
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(startX, yPos, cardWidth, cardHeight, 'F');
        doc.setFontSize(10).setTextColor(255, 255, 255);
        doc.text("TOTAL PAYMENTS", startX + 15, yPos + 15);
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(this.payments.length.toString(), startX + 15, yPos + 30);
  
        // Total Amount Card
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.rect(startX + cardWidth + 10, yPos, cardWidth, cardHeight, 'F');
        doc.setFontSize(10).setTextColor(255, 255, 255);
        doc.text("TOTAL AMOUNT", startX + cardWidth + 25, yPos + 15);
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(`₹${totalAmount.toFixed(2)}`, startX + cardWidth + 25, yPos + 30);
  
        // Status Card
        doc.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
        doc.rect(startX + (cardWidth + 10) * 2, yPos, cardWidth, cardHeight, 'F');
        doc.setFontSize(10).setTextColor(255, 255, 255);
        doc.text("PAID/PENDING", startX + (cardWidth + 10) * 2 + 15, yPos + 15);
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text(`${paidCount}/${pendingCount}`, startX + (cardWidth + 10) * 2 + 15, yPos + 30);
  
        // Payment Modes Count Card
        doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.rect(startX + (cardWidth + 10) * 3, yPos, cardWidth, cardHeight, 'F');
        doc.setFontSize(10).setTextColor(255, 255, 255);
        doc.text("PAYMENT MODES", startX + (cardWidth + 10) * 3 + 15, yPos + 15);
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text(Object.keys(paymentModeBreakdown).length.toString(), startX + (cardWidth + 10) * 3 + 15, yPos + 30);
  
        yPos += cardHeight + 20;
      };
  
      drawSummaryCards();
  
      // Payment Mode Breakdown Section
      const drawPaymentModeBreakdown = () => {
        // Section header
        doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
        doc.rect(margin, yPos, contentWidth, 20, 'F');
        doc.setFontSize(11).setFont("helvetica", "bold");
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text("PAYMENT MODE BREAKDOWN", margin + 10, yPos + 13);
  
        yPos += 25;
  
        // Create table data
        const breakdownData = Object.entries(paymentModeBreakdown).map(([mode, data]: [string, any]) => [
          mode,
          data.count.toString(),
          `₹${data.amount.toFixed(2)}`,
          `${((data.amount / totalAmount) * 100).toFixed(1)}%`
        ]);
  
        // Add total row
        breakdownData.push([
          { content: "TOTAL", styles: { fontStyle: 'bold' } },
          { content: this.payments.length.toString(), styles: { fontStyle: 'bold' } },
          { content: `₹${totalAmount.toFixed(2)}`, styles: { fontStyle: 'bold' } },
          { content: "100%", styles: { fontStyle: 'bold' } }
        ]);
  
        // Calculate column widths to fit content
        const colWidths = [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2];
        
        autoTable(doc, {
          startY: yPos,
          head: [["Payment Mode", "Count", "Amount", "Percentage"]],
          body: breakdownData,
          theme: "grid",
          styles: { 
            fontSize: 8, // Reduced font size to fit better
            cellPadding: 4,
            lineWidth: 0.3,
            overflow: 'linebreak'
          },
          headStyles: { 
            fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center"
          },
          alternateRowStyles: { 
            fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: colWidths[0] },
            1: { cellWidth: colWidths[1], halign: 'center' },
            2: { cellWidth: colWidths[2], halign: 'right' },
            3: { cellWidth: colWidths[3], halign: 'right' }
          },
          didDrawPage: (data) => {
            yPos = data.cursor.y + 15;
          }
        });
  
        yPos += 10;
      };
  
      // Draw payment mode breakdown
      drawPaymentModeBreakdown();
  
      // Calculate fixed widths for tables
      const tableWidth = contentWidth;
      const col1Width = tableWidth * 0.85;
      const col2Width = tableWidth * 0.15;
  
      // Modern section drawer for payment details
      const drawSection = (title: string, head: string[], body: any[], totalLabel?: string, totalValue?: number) => {
        // Check if we need a new page
        if (yPos > pageHeight - 150) {
          doc.addPage();
          currentPage++;
          drawHeader();
          drawFooter(currentPage);
          yPos = 80;
        }
  
        // Section header
        doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
        doc.rect(margin, yPos, contentWidth, 20, 'F');
        doc.setFontSize(11).setFont("helvetica", "bold");
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(title.toUpperCase(), margin + 10, yPos + 13);
  
        yPos += 25;
  
        // Table with compatible styling
        autoTable(doc, {
          startY: yPos,
          head: [head],
          body: body,
          theme: "grid",
          styles: { 
            fontSize: 7, // Reduced font size to fit content
            cellPadding: 3,
            lineWidth: 0.5,
            font: "helvetica",
            overflow: 'linebreak'
          },
          headStyles: { 
            fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center"
          },
          alternateRowStyles: { 
            fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
          },
          margin: { left: margin, right: margin },
          didDrawPage: (data) => {
            yPos = data.cursor.y + 12;
            if (doc.getNumberOfPages() > currentPage) {
              currentPage = doc.getNumberOfPages();
              drawHeader();
              drawFooter(currentPage);
            }
          },
        });
  
        // Total row with fixed widths
        if (totalLabel && totalValue !== undefined) {
          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY,
            body: [[
              { content: `${totalLabel}`, styles: { fontStyle: 'bold', halign: 'right' } },
              { content: `₹${totalValue.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right' } }
            ]],
            theme: "grid",
            styles: { 
              fontSize: 8, 
              cellPadding: 4,
              lineWidth: 0.5
            },
            bodyStyles: { 
              fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]],
              textColor: [255, 255, 255]
            },
            margin: { left: margin, right: margin },
            columnStyles: {
              0: { cellWidth: col1Width },
              1: { cellWidth: col2Width, halign: 'right' }
            }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
        }
      };
  
      // Loop through payments
      this.payments.forEach((pay, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 150) {
          doc.addPage();
          currentPage++;
          drawHeader();
          drawFooter(currentPage);
          yPos = 80;
        }
  
        // Format payment number to 5 digits with leading zeros
        const formattedPaymentNo =pay.paymentId? (pay.paymentId ).toString().padStart(5, '0'):'N/A';
  
        // Payment card header
        doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
        doc.rect(margin, yPos, contentWidth, 25, 'F');
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(`PAYMENT ${formattedPaymentNo}`, margin + 10, yPos + 16);
  
        yPos += 35;
  
        // Payment info - using simple array format for compatibility
        // Updated to include remarks field
        const paymentInfo = [
          [
            `Student: ${pay.studentName}`,
            `Room: ${pay.roomNo}`,
            `Date: ${new Date(pay.paymentDate).toLocaleDateString()}`
          ],
          [
            `Amount: ₹${pay.paymentAmount?.toFixed(2) || '0.00'}`,
            `Type: ${pay.paymentType}`,
            `Mode: ${pay.paymentMode}`
          ],
          [
            `Status: ${pay.paymentStatus}`,
            `Ref: ${pay.referenceNumber || 'N/A'}`,
            `Remarks: ${pay.remarks || 'N/A'}`
          ]
        ];
  
        autoTable(doc, {
          startY: yPos,
          body: paymentInfo,
          theme: "grid",
          styles: { 
            fontSize: 8, // Reduced font size
            cellPadding: 4,
            lineWidth: 0.3,
            minCellHeight: 12,
            overflow: 'linebreak'
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: contentWidth / 3 },
            1: { cellWidth: contentWidth / 3 },
            2: { cellWidth: contentWidth / 3 }
          }
        });
  
        yPos = (doc as any).lastAutoTable.finalY + 15;
  
        // Sections with updated period format for room rents
        if (pay.roomRents?.length) {
          const body = pay.roomRents.map((r: any, idx: number) => [
            (idx + 1).toString(), 
            r.billNo || '', 
            r.roomNo || '',
            r.rentFrom && r.rentTo 
              ? `${new Date(r.rentFrom).toLocaleDateString()} - ${new Date(r.rentTo).toLocaleDateString()}`
              : 'N/A',
            `₹${(r.amount || 0).toFixed(2)}`
          ]);
          const total = pay.roomRents.reduce((a: number, b: any) => a + (b.amount || 0), 0);
          drawSection("Room Rent Paid", ["S.No", "Bill No", "Room", "Period", "Amount"], body, "Total Rent", total);
        }
  
        if (pay.otherCharges?.length) {
          const body = pay.otherCharges.map((c: any, idx: number) => [
            (idx + 1).toString(), 
            c.particulars || '', 
            `₹${(c.amount || 0).toFixed(2)}`
          ]);
          const total = pay.otherCharges.reduce((a: number, b: any) => a + (b.amount || 0), 0);
          drawSection("Other Charges", ["S.No", "Particulars", "Amount"], body, "Total Other Charges", total);
        }
  
        if (pay.advances?.length) {
          const body = pay.advances.map((a: any, idx: number) => [
            (idx + 1).toString(), 
            a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A',
            `₹${(a.amount || 0).toFixed(2)}`
          ]);
          const total = pay.advances.reduce((a: number, b: any) => a + (b.amount || 0), 0);
          drawSection("Advance Payments", ["S.No", "Date", "Amount"], body, "Total Advance", total);
        }
  
        if (pay.additionalCharges?.length) {
          const body = pay.additionalCharges.map((a: any, idx: number) => [
            (idx + 1).toString(), 
            a.particular || '',
            `₹${(a.amount || 0).toFixed(2)}`
          ]);
          const total = pay.additionalCharges.reduce((a: number, b: any) => a + (b.amount || 0), 0);
          drawSection("Additional Charges", ["S.No", "Particular", "Amount"], body, "Total Additional", total);
        }
  
        // Add spacing between payments
        yPos += 10;
      });
  
      // Final summary on last page
      if (doc.getNumberOfPages() > 0) {
        doc.setPage(doc.getNumberOfPages());
        yPos = (doc as any).lastAutoTable?.finalY || yPos;
        
        if (yPos < pageHeight - 100) {
          doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
          doc.rect(margin, yPos, contentWidth, 30, 'F');
          doc.setFontSize(10).setFont("helvetica", "bold");
          doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          doc.text("REPORT SUMMARY", pageWidth / 2, yPos + 20, { align: "center" });
          
          doc.setFontSize(9).setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          doc.text(`Total Payments Processed: ${this.payments.length}`, margin + 10, yPos + 40);
          doc.text(`Grand Total Amount: ₹${totalAmount.toFixed(2)}`, pageWidth - margin - 10, yPos + 40, { align: "right" });
          
          // Add payment mode summary
          const cashAmount = paymentModeBreakdown['Cash']?.amount || 0;
          const otherAmount = totalAmount - cashAmount;
          yPos += 25;
          doc.text(`Cash Payments: ₹${cashAmount.toFixed(2)} (${((cashAmount / totalAmount) * 100).toFixed(1)}%)`, margin + 10, yPos + 40);
          doc.text(`Other Payments: ₹${otherAmount.toFixed(2)} (${((otherAmount / totalAmount) * 100).toFixed(1)}%)`, pageWidth - margin - 10, yPos + 40, { align: "right" });
        }
      }
  
      doc.save(`payment-register-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  }
  
  // Add the missing method to calculate payment mode breakdown
  private calculatePaymentModeBreakdown(): { [key: string]: { count: number, amount: number } } {
    const breakdown: { [key: string]: { count: number, amount: number } } = {};
    
    this.payments.forEach(payment => {
      const mode = payment.paymentMode || 'Unknown';
      const amount = payment.paymentAmount || 0;
      
      if (!breakdown[mode]) {
        breakdown[mode] = { count: 0, amount: 0 };
      }
      
      breakdown[mode].count++;
      breakdown[mode].amount += amount;
    });
    
    return breakdown;
  }
  
  // Helper function remains the same
  private async getImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  }
}