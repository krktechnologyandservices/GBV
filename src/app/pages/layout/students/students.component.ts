import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StudentService, Student, LedgerEntry } from './students.service';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-student-list',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  @ViewChild('photoModal') photoModal!: TemplateRef<any>;

  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchQuery = '';
  studentPhotos: { [studentId: number]: SafeUrl } = {};
  dialogRef?: NbDialogRef<any>;

  // Ledger related
  ledgerStudent?: Student;
  ledgerEntries: LedgerEntry[] = [];
  fromDate?: string;
  toDate?: string;

  constructor(
    private studentService: StudentService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.fromDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
    this.toDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (res) => {
        this.students = res;
        this.filteredStudents = res;
        // Photos will load only when clicked - no auto-loading
      },
      error: (err) => console.error('Failed to load students:', err)
    });
  }

  search(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredStudents = this.students;
      return;
    }

    this.filteredStudents = this.students.filter(s =>
      (s.fullName?.toLowerCase().includes(q)) ||
      (s.email?.toLowerCase().includes(q)) ||
      (s.phone?.toLowerCase().includes(q)) ||
      (s.courseName?.toLowerCase().includes(q)) ||
      (s.roomNo?.toLowerCase().includes(q))
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredStudents = this.students;
  }

  edit(student: Student): void {
    if (!student?.studentId) return;
    this.router.navigate(['pages/master/students/edit', student.studentId]);
  }

  delete(student: Student): void {
    if (!student?.studentId) return;
    
    if (confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
      this.studentService.delete(student.studentId).subscribe({
        next: () => {
          this.loadStudents();
          if (this.ledgerStudent?.studentId === student.studentId) {
            this.closeLedger();
          }
        },
        error: (err) => {
          console.error('Failed to delete student:', err);
          alert('Failed to delete student. Please try again.');
        }
      });
    }
  }

  // Load and enlarge photo when user clicks on photo frame
  loadAndEnlargePhoto(student: Student): void {
    if (!student.studentId) return;

    // If photo already loaded, just open the modal
    if (this.studentPhotos[student.studentId]) {
      this.openPhotoModal(this.studentPhotos[student.studentId]);
      return;
    }

    // Load photo from API and then open modal
    this.studentService.getPhoto(student.studentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.studentPhotos[student.studentId!] = safeUrl;
        this.openPhotoModal(safeUrl);
      },
      error: (err) => {
        console.error(`Photo load failed for ${student.fullName}`, err);
        this.openPhotoModal(this.sanitizer.bypassSecurityTrustUrl(''));
      }
    });
  }

  private openPhotoModal(photoUrl: SafeUrl): void {
    this.dialogRef = this.dialogService.open(this.photoModal, {
      context: photoUrl,
      hasScroll: false
    });
  }

  triggerFileInput(student: Student): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => this.onPhotoSelected(event, student);
    fileInput.click();
  }

  onPhotoSelected(event: any, student: Student): void {
    const file: File = event.target.files[0];
    if (!file || !student.studentId) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.studentService.uploadPhoto(student.studentId, file).subscribe({
      next: () => {
        alert('Photo uploaded successfully!');
        // Clear cached photo so it reloads next time
        delete this.studentPhotos[student.studentId!];
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Photo upload failed. Please try again.');
      }
    });
  }

  loadLedger(student: Student): void {
    this.ledgerStudent = student;
    this.onDateChange();
  }

  closeLedger(): void {
    this.ledgerStudent = undefined;
    this.ledgerEntries = [];
  }

  onDateChange(): void {
    if (!this.ledgerStudent?.studentId) return;

    this.studentService.getLedger(
      this.ledgerStudent.studentId,
      this.fromDate ? new Date(this.fromDate) : undefined,
      this.toDate ? new Date(this.toDate) : undefined
    ).subscribe({
      next: (res) => {
        this.ledgerEntries = res.map(e => ({
          ...e,
          date: formatDate(e.date, 'yyyy-MM-dd', 'en-US')
        }));
      },
      error: (err) => {
        console.error('Failed to load ledger:', err);
        alert('Failed to load ledger data. Please try again.');
      }
    });
  }

  getTotalDebit(): number {
    return this.ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  }

  getTotalCredit(): number {
    return this.ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  }

  getCurrentBalance(): number {
    if (this.ledgerEntries.length === 0) return 0;
    return this.ledgerEntries[this.ledgerEntries.length - 1].balance || 0;
  }

  async exportLedgerPdf(): Promise<void> {
    if (!this.ledgerStudent) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = new Date().toLocaleDateString();

    try {
      // Load logo
      const logoData = await this.getImageAsBase64('assets/images/DaleViewLogo.jpg');

      // Header
      const drawHeader = () => {
        if (logoData) {
          doc.addImage(logoData, 'JPEG', margin, 20, 60, 30);
        }
        
        doc.setFontSize(16).setFont('helvetica', 'bold');
        doc.text('Dale View Hostel', pageWidth / 2, 40, { align: 'center' });
        
        doc.setFontSize(12).setFont('helvetica', 'normal');
        doc.text('Student Ledger Report', pageWidth / 2, 60, { align: 'center' });
        
        doc.setFontSize(9);
        doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 40, { align: 'right' });
      };

      drawHeader();

      // Student Information
      autoTable(doc, {
        startY: 80,
        body: [
          ['Student Name', this.ledgerStudent.fullName || ''],
          ['Course', this.ledgerStudent.courseName || 'N/A'],
          ['Email', this.ledgerStudent.email || 'N/A'],
          ['Phone', this.ledgerStudent.phone || 'N/A'],
          ['Room No', this.ledgerStudent.roomNo || 'N/A'],
          ['Period', `${this.fromDate} to ${this.toDate}`]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: margin, right: margin }
      });

      // Ledger Table
      if (this.ledgerEntries.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Date', 'Type', 'Description', 'Debit', 'Credit', 'Balance']],
          body: this.ledgerEntries.map(e => [
            e.date ? new Date(e.date).toLocaleDateString() : '',
            e.type || '',
            e.description || e.particulars || '',
            e.debit && e.debit !== 0 ? e.debit.toFixed(2) : '-',
            e.credit && e.credit !== 0 ? e.credit.toFixed(2) : '-',
            e.balance && e.balance !== 0 ? e.balance.toFixed(2) : '-'
          ]),
          headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontStyle: 'bold' 
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' }
          },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 4 }
        });

        // Summary
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(11).setFont('helvetica', 'bold');
        doc.text('Summary', margin, finalY);
        
        doc.setFontSize(10).setFont('helvetica', 'normal');
        doc.text(`Total Debit: ${this.getTotalDebit().toFixed(2)}`, margin, finalY + 20);
        doc.text(`Total Credit: ${this.getTotalCredit().toFixed(2)}`, margin, finalY + 40);
        doc.text(`Current Balance: ${this.getCurrentBalance().toFixed(2)}`, margin, finalY + 60);
      } else {
        // No data message
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        doc.setFontSize(12).setFont('helvetica', 'bold');
        doc.text('No ledger data available for the selected period', pageWidth / 2, finalY, { align: 'center' });
      }

      // Save PDF
      const fileName = `Ledger_${this.ledgerStudent.fullName?.replace(/\s+/g, '_') || 'Student'}_${currentDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

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
      console.error('Failed to load logo:', error);
      return '';
    }
  }
}