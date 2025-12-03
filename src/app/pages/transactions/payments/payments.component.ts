// payments.component.ts
import { Component, OnInit, NgZone } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { PaymentService, PaymentView } from './payments.service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { environment } from '../../../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentListComponent implements OnInit {
  payments: PaymentView[] = [];
  filteredPayments: PaymentView[] = [];
  loading = true;

  // Filter fields
  searchText: string = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private paymentService: PaymentService,
    private toastr: NbToastrService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    this.fromDate = todayStr;
    this.toDate = todayStr;

    this.load();
  }

  load() {
    this.loading = true;
    this.paymentService.getAll().subscribe({
      next: res => { 
        this.payments = res; 
        this.applyFilter();
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
        this.toastr.danger('Failed to load payments'); 
      }
    });
  }

  // --- FILTER METHODS ---
  applyFilter() {
    this.filteredPayments = this.payments.filter(p => {
      const matchesText = !this.searchText ||
        p.studentName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        p.id.toString().includes(this.searchText);
  
      // --- Only compare date parts ---
      const paymentDate = new Date(p.paymentDate);
      const from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
      const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;
  
      const matchesDate =
        (!from || paymentDate >= from) &&
        (!to || paymentDate <= to);
  
      return matchesText && matchesDate;
    });
  }
  

  submitFilter() {
    this.applyFilter();
  }

  resetFilter() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    this.searchText = '';
    this.fromDate = todayStr;
    this.toDate = todayStr;
    this.applyFilter();
  }

  addPayment() {
    this.router.navigate(['pages/transactions/payments/new']);
  }

  editPayment(payment: PaymentView) {
    this.router.navigate([`pages/transactions/payments/${payment.id}/edit`]);
  }

  UpdateVerficaition(paymentId: number) {
    if (!confirm('Is the Payment Verified?')) return;
    this.paymentService.UpdateVerification(paymentId).subscribe({
      next: () => { this.toastr.success('Update was successful'); this.load(); },
      error: () => this.toastr.danger('Update failed')
    });
  }

  deletePayment(payment: PaymentView) {
    if (!confirm('Delete payment?')) return;
    this.paymentService.delete(payment.id).subscribe({
      next: () => { this.toastr.success('Cancelled'); this.load(); },
      error: () => this.toastr.danger('Cancellation failed')
    });
  }

  printReceipt(payment: any) {
    this.paymentService.getReceipt(payment.id).subscribe({
      next: (fullPayment) => {
        this.generateReceiptPdf(fullPayment);
      },
      error: () => this.toastr.danger('Failed to fetch receipt details'),
    });
  }

  // --- Keep your existing generateReceiptPdf(), QR, and number-to-words methods as is ---
  // ... (copy all existing PDF methods from your current component)

/// --- A4 Size Optimized Individual Payment Receipt ---
public async generateReceiptPdf(payment: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt for A4
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt for A4
  let y = 20;

  // Modern color scheme
  const colors = {
    primary: [41, 128, 185],
    secondary: [52, 73, 94],
    accent: [46, 204, 113],
    lightBg: [248, 249, 250],
    border: [234, 236, 238]
  };

  // --- Company Logo & Header Section ---
  try {
    const logoData = await this.getImageAsBase64('assets/images/DaleViewLogo.jpg');
    // Logo on left - smaller to save space
    doc.addImage(logoData, 'PNG', 20, 12, 30, 15);
    
    // Company info next to logo - compact
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('DALE VIEW HOSTEL', 60, 18);
    
    // Tagline
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Premium Student Accommodation', 60, 24);
    
    // Address line - added after tagline
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 80);
    doc.text('Punalal Post.695575, Poovachal, Thiruvananthapuram', 60, 28);
  } catch (err) {
    console.warn('Logo load failed:', err);
    // Fallback header without logo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('DALE VIEW HOSTEL', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Premium Student Accommodation', pageWidth / 2, 26, { align: 'center' });
    
    // Address in fallback header
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text('Punalal Post.695575, Poovachal, Thiruvananthapuram', pageWidth / 2, 32, { align: 'center' });
  }

  // --- Receipt Header with Background ---
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 38, pageWidth, 18, 'F'); // Moved down to 38 to accommodate the extra line
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL PAYMENT RECEIPT', pageWidth / 2, 50, { align: 'center' }); // Adjusted y position

  y = 58; // Adjusted y position

  // --- Receipt ID & Date - Compact Layout ---
  const formattedId = `REC-${payment.paymentId.toString().padStart(4, '0')}`;
  
  doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
  doc.rect(20, y, pageWidth - 40, 18, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(formattedId, 25, y + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Issued: ${new Date(payment.paymentDate).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })}`, pageWidth - 25, y + 12, { align: 'right' });

  y += 25;

  // --- Student & Payment Details - Compact Card ---
  const detailsCardHeight = 45; // Reduced from 60
  doc.setFillColor(255, 255, 255);
  doc.rect(20, y, pageWidth - 40, detailsCardHeight, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, y, pageWidth - 40, detailsCardHeight, 'S');

  // Left Column - Student Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('STUDENT DETAILS', 25, y + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${payment.studentName}`, 25, y + 18);
  doc.text(`Room: ${payment.roomNo || 'N/A'}`, 25, y + 26);
  doc.text(`ID: ${payment.studentId || 'N/A'}`, 25, y + 34);

  // Right Column - Payment Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('PAYMENT INFO', pageWidth / 2 + 10, y + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Mode: ${payment.paymentMode}`, pageWidth / 2 + 10, y + 18);
  doc.text(`Type: ${payment.paymentType}`, pageWidth / 2 + 10, y + 26);
  
  // Remarks Section - Compact
  const remarks = payment.remarks || payment.note || payment.comments || 'No remarks';
  doc.text(`Remarks:`, pageWidth / 2 + 10, y + 34);
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  
  // Handle long remarks - single line only to save space
  const maxRemarksWidth = 70;
  const remarksLines = doc.splitTextToSize(remarks, maxRemarksWidth);
  if (remarksLines.length > 0) {
    doc.text(remarksLines[0], pageWidth / 2 + 10, y + 40);
  }

  // Status Badge - Smaller
  const statusColor = payment.paymentStatus === 'Paid' ? colors.accent : [241, 196, 15];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 50, y + 5, 30, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(payment.paymentStatus.toUpperCase(), pageWidth - 35, y + 11, { align: 'center' });

  y += detailsCardHeight + 8;

  // --- Payment Breakdown Header ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('PAYMENT BREAKDOWN', 20, y);

  y += 6;

  // Calculate available space for tables
  const availableSpace = pageHeight - y - 120; // Reserve space for total, QR, and footer

  // --- Room Rents Table ---
  if (payment.roomRents?.length) {
    const body = payment.roomRents.map((r: any, index: number) => [
      (index + 1).toString(),
      r.billNo || 'N/A',
      r.roomNo || 'N/A',
      r.rentFrom && r.rentTo 
        ? `${new Date(r.rentFrom).toLocaleDateString('en-GB')} - ${new Date(r.rentTo).toLocaleDateString('en-GB')}`
        : 'N/A',
      `₹${(r.amount || 0).toFixed(2)}`
    ]);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Bill No', 'Room', 'Period', 'Amount']],
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3, // Reduced padding
        lineColor: [colors.border[0], colors.border[1], colors.border[2]],
        lineWidth: 0.3,
        minCellHeight: 8 // Reduced cell height
      },
      alternateRowStyles: { 
        fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
      },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // --- Other Charges Table ---
  if (payment.otherCharges?.length) {
    const body = payment.otherCharges.map((c: any, index: number) => [
      (index + 1).toString(),
      c.particulars || 'Other Charge',
      `₹${(c.amount || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Particulars', 'Amount']],
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        lineColor: [colors.border[0], colors.border[1], colors.border[2]],
        lineWidth: 0.3,
        minCellHeight: 8
      },
      alternateRowStyles: { 
        fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
      },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // --- Advances Table ---
  if (payment.advances?.length) {
    const body = payment.advances.map((a: any, index: number) => [
      (index + 1).toString(),
      a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : 'N/A',
      `₹${(a.amount || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Advance Date', 'Amount']],
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        lineColor: [colors.border[0], colors.border[1], colors.border[2]],
        lineWidth: 0.3,
        minCellHeight: 8
      },
      alternateRowStyles: { 
        fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
      },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  }

  // --- Additional Charges Table ---
  if (payment.additionalCharges?.length) {
    const body = payment.additionalCharges.map((a: any, index: number) => [
      (index + 1).toString(),
      a.particular || 'Additional Charge',
      `₹${(a.amount || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Particulars', 'Amount']],
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [colors.secondary[0], colors.secondary[1], colors.secondary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        lineColor: [colors.border[0], colors.border[1], colors.border[2]],
        lineWidth: 0.3,
        minCellHeight: 8
      },
      alternateRowStyles: { 
        fillColor: [colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]] 
      },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we're running out of space
  if (y > pageHeight - 80) {
    // If content is too long, add a new page
    doc.addPage();
    y = 20;
    
    // Add header on new page
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`Payment Receipt - ${formattedId} - ${payment.studentName}`, pageWidth / 2, 30, { align: 'center' });
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);
    y = 45;
  }

  // --- Total Amount Box - Compact ---
  const boxX = 20, boxY = y, boxW = pageWidth - 40, boxH = 25; // Reduced height
  
  // Background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'F');
  
  // Amount in Words - Compact
  const amountInWords = this.convertNumberToWords(payment.paymentAmount) || 'Zero';
  const wordsText = `Rupees ${amountInWords} Only`;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  
  const splitWords = doc.splitTextToSize(wordsText, boxW - 20);
  if (splitWords.length > 0) {
    doc.text(splitWords[0], boxX + 8, boxY + 10);
  }

  // Numeric amount
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`₹${payment.paymentAmount.toFixed(2)}`, boxX + boxW - 10, boxY + boxH - 6, { align: 'right' });

  y = boxY + boxH + 12;

  // --- QR Code & Verification Section - Compact ---
  try {
    const qrDataUrl = await this.generateSignedQrForPayment(payment);
    const qrSize = 40; // Smaller QR code
    const qrX = pageWidth - qrSize - 25;
    const qrY = y;
    
    // QR Code with border
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.rect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 15, 'S');
    
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // Verification text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Scan to Verify', qrX + qrSize/2, qrY + qrSize + 6, { align: 'center' });

    // Contact info on left - Compact
    doc.setFontSize(8);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('For queries:', 25, y + 8);
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text('Office: +91 9072 277 030,+91 9446 172 963', 25, y + 15);
    doc.text('Email: daleviewhostel@gmail.com', 25, y + 21);

    y = Math.max(y, qrY + qrSize + 20);
  } catch (err) {
    console.warn('QR generation failed:', err);
    
    // Fallback contact info
    doc.setFontSize(8);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('For queries:', 25, y + 8);
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text('Office: +91 9072 277 030,+91 9446 172 963', 25, y + 15);
    doc.text('Email: daleviewhostel@gmail.com', 25, y + 21);
    y += 30;
  }

  // --- Footer with Company Branding - Compact ---
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  
  y += 6;
  
  // Company logo in footer (small)
  try {
    // const logoDataSmall = await this.getImageAsBase64('assets/images/DaleViewLogo.jpg');
    // doc.addImage(logoDataSmall, 'PNG', pageWidth / 2 - 12, y, 24, 10);
    y += 12;
  } catch (err) {
    // Continue without footer logo
  }
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('Thank you for choosing Dale View Hostel!', pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Computer-generated receipt. No signature required.', pageWidth / 2, y, { align: 'center' });

  // --- Save PDF ---
  const fileName = `Receipt_${formattedId}_${payment.studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}


// --- Convert number to words (unchanged) ---
private convertNumberToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  const [whole, fraction] = amount.toFixed(2).split('.');
  let words = convert(parseInt(whole));
  if (parseInt(fraction) > 0) {
    words += ` and ${convert(parseInt(fraction))} Paise`;
  }
  return words.trim();
}

// --- Image Loader (unchanged) ---
private getImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject('Canvas context not found');
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
private formatDateForQR(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

private async generateSignedQrForPayment(payment: any): Promise<string> {
  const secretKey = 'mySuperSecretKey';
  
  // Use local date formatting
  const formattedDate = this.formatDateForQR(payment.paymentDate);
  const amount = payment.paymentAmount.toFixed(2);
  const payload = `${payment.paymentId}|${amount}|${formattedDate}`;
  
  // Debug logging (remove in production)
  console.log('QR Debug - Date:', {
    original: payment.paymentDate,
    formatted: formattedDate,
    iso: new Date(payment.paymentDate).toISOString(),
    payload: payload
  });
  
  const signature = CryptoJS.HmacSHA256(payload, secretKey).toString(CryptoJS.enc.Hex);
  const verificationUrl = `${environment.apiBaseUrl}/verify?paymentId=${payment.paymentId}&amount=${amount}&date=${encodeURIComponent(formattedDate)}&sig=${signature}`;
  
  return await QRCode.toDataURL(verificationUrl, { width: 200 });
}
}