// paymentsforms.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PaymentService, PaymentCreateDto, PendingBill, ExpenseHead } from '../payments.service';
import { StudentService } from '../../../layout/students/students.service';
import { BookingService, Booking } from '../../booking/booking.service';

interface BillAdjustment {
  billId: number;
  adjustedAmount: number;
  remarks: string;
}

interface AdditionalCharge {
  expenseHeadId: number;
  amount: number;
  remarks: string;
}

interface PaymentViewExtended {
  id?: number;
  studentId: number;
  bookingId?: number | null;
  paymentDate: string;
  paymentMode: string;
  amount: number;
  paymentType: 'BILL' | 'ADVANCE' | 'OLD';
  referenceNumber?: string;
  remarks?: string;
  billAdjustments?: BillAdjustment[];
  additionalCharges?: AdditionalCharge[];
}

@Component({
  selector: 'app-payment-form',
  templateUrl: './paymentsforms.component.html',
  styleUrls: ['./paymentsforms.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Input() payment?: PaymentViewExtended;
  form!: FormGroup;
  students: any[] = [];
  filteredStudents: any[] = [];
  bookings: Booking[] = [];
  pendingBills: PendingBill[] = [];
  expenseHeads: ExpenseHead[] = [];
  studentSearchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private studentService: StudentService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      studentId: [this.payment?.studentId || null, Validators.required],
      bookingId: [this.payment?.bookingId || null],
      paymentDate: [this.formatDate(this.payment?.paymentDate), Validators.required],
      paymentMode: [this.payment?.paymentMode || 'Cash', Validators.required],
      totalAmount: [this.payment?.amount || 0, [Validators.required, Validators.min(0.01)]],
      paymentType: [this.payment?.paymentType || 'BILL', Validators.required],
      referenceNumber: [this.payment?.referenceNumber || ''],
      remarks: [this.payment?.remarks || ''],
      billAdjustments: this.fb.array([]),
      additionalCharges: this.fb.array([])
    });

    // Load students and expense heads
    this.studentService.getAll().subscribe(s => {
      this.students = s;
      this.filteredStudents = s; // Initialize filtered students
    });
    this.paymentService.getExpenseHeads().subscribe(h => this.expenseHeads = h);

    // Rest of your existing ngOnInit code...
    this.loadBookingsAndPrefill();
    this.setupFormListeners();
  }

  private loadBookingsAndPrefill() {
    if (this.payment?.studentId) {
      this.loadBookings(this.payment.studentId, () => {
        this.form.patchValue({ bookingId: this.payment?.bookingId });

        // Load bill adjustments if type is BILL
        if (this.payment?.paymentType === 'BILL') {
          this.loadPendingBills(this.payment.studentId, true);
        }

        // Always load additional charges if any
        if (this.payment?.additionalCharges?.length) {
          this.payment.additionalCharges.forEach(ch => {
            this.additionalCharges.push(this.fb.group({
              expenseHeadId: [ch.expenseHeadId, Validators.required],
              amount: [ch.amount, [Validators.required, Validators.min(0.01)]],
              remarks: [ch.remarks || '']
            }));
          });
        }
      });
    }
  }

  private setupFormListeners() {
    // React to student selection changes
    this.form.get('studentId')?.valueChanges.subscribe(studentId => {
      if (studentId) {
        this.loadBookings(studentId);
        if (this.form.get('paymentType')?.value === 'BILL') this.loadPendingBills(studentId);
      } else {
        this.bookings = [];
        this.form.patchValue({ bookingId: null });
      }
    });

    // React to payment type changes
    this.form.get('paymentType')?.valueChanges.subscribe(type => {
      const studentId = this.form.get('studentId')?.value;
      if (type === 'BILL' && studentId) this.loadPendingBills(studentId);
      else this.clearBillAdjustments();
    });

    this.form.get('totalAmount')?.valueChanges.subscribe(() => this.autoAllocate());
  }

  // Add student filtering method
  filterStudents(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.studentSearchQuery = query;
    
    if (!query) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(student => 
        student.fullName.toLowerCase().includes(query) ||
        student.studentId.toString().includes(query) ||
        (student.email && student.email.toLowerCase().includes(query)) ||
        (student.phone && student.phone.includes(query))
      );
    }
  }

  // Clear filter when dropdown closes
  clearStudentFilter() {
    setTimeout(() => {
      this.studentSearchQuery = '';
      this.filteredStudents = this.students;
    }, 200);
  }

  // Display selected student name in the input
  getSelectedStudentName(): string {
    const studentId = this.form.get('studentId')?.value;
    if (!studentId) return '';
    
    const student = this.students.find(s => s.studentId === studentId);
    return student ? `${student.fullName} (${student.studentId})` : '';
  }

  get billAdjArray() { return this.form.get('billAdjustments') as FormArray; }
  get additionalCharges() { return this.form.get('additionalCharges') as FormArray; }

  loadBookings(studentId: number, callback?: () => void) {
    this.bookingService.getByStudent(studentId).subscribe(b => {
      this.bookings = b;
      if (!b.some(x => x.id === this.form.value.bookingId)) this.form.patchValue({ bookingId: null });
      if (callback) callback();
    });
  }

  loadPendingBills(studentId: number, prefill: boolean = false) {
    this.paymentService.getPendingBills(studentId).subscribe(bills => {
      this.pendingBills = bills;
      this.clearBillAdjustments();

      const existingAdjMap = new Map<number, BillAdjustment>();
      if (prefill && this.payment?.billAdjustments?.length) {
        this.payment.billAdjustments.forEach(adj => existingAdjMap.set(adj.billId, adj));
      }

      bills.forEach(b => {
        const adjAmount = existingAdjMap.get(b.billId)?.adjustedAmount || 0;
        this.billAdjArray.push(this.fb.group({
          billId: [b.billId],
          roomNo: [b.roomNo || '-'],
          period: [b.period],
          billAmount: [b.billAmount],
          balance: [b.balance],
          adjustedAmount: [adjAmount]
        }));
      });

      this.autoAllocate();
    });
  }

  clearBillAdjustments() {
    while (this.billAdjArray.length) this.billAdjArray.removeAt(0);
  }

  autoAllocate() {
    if (this.form.get('paymentType')?.value !== 'BILL') return;

    const total = Number(this.form.get('totalAmount')?.value || 0);
    const charges = this.additionalCharges.controls.reduce((sum, c) => sum + Number(c.get('amount')?.value || 0), 0);
    let remaining = total - charges;
    if (remaining < 0) remaining = 0;

    this.billAdjArray.controls.forEach(ctrl => {
      const balance = Number(ctrl.get('balance')?.value || 0);
      const adj = Math.min(balance, remaining);
      ctrl.get('adjustedAmount')?.setValue(adj, { emitEvent: false });
      remaining -= adj;
    });
  }

  onManualAdjustChanged() { this.autoAllocate(); }

  addCharge() {
    this.additionalCharges.push(this.fb.group({
      expenseHeadId: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      remarks: ['']
    }));
  }

  removeCharge(i: number) {
    this.additionalCharges.removeAt(i);
    this.autoAllocate();
  }

  save() {
    if (this.form.invalid) { 
      alert('Please complete all required fields'); 
      return; 
    }

    const dto: PaymentCreateDto = {
      studentId: Number(this.form.value.studentId),
      bookingId: this.form.value.bookingId || null,
      paymentDate: this.form.value.paymentDate,
      paymentMode: this.form.value.paymentMode,
      totalAmount: Number(this.form.value.totalAmount),
      referenceNumber: this.form.value.referenceNumber,
      remarks: this.form.value.remarks,
      paymentType: this.form.value.paymentType,
      billAdjustments: this.billAdjArray.controls
        .map(c => ({ billId: Number(c.value.billId), adjustedAmount: Number(c.value.adjustedAmount), remarks: '' }))
        .filter(c => c.adjustedAmount > 0),
      additionalCharges: this.additionalCharges.controls
        .map(c => ({ expenseHeadId: Number(c.value.expenseHeadId), amount: Number(c.value.amount), remarks: c.value.remarks }))
        .filter(c => c.amount > 0)
    };

    const request$ = this.payment?.id
      ? this.paymentService.update(this.payment.id, dto)
      : this.paymentService.create(dto);

    request$.subscribe({
      next: () => alert(`Payment ${this.payment?.id ? 'updated' : 'saved'} successfully`),
      error: err => { console.error(err); alert('Save failed'); }
    });
  }

  cancel() { window.history.back(); }

  private formatDate(dateStr?: string) {
    if (!dateStr) return new Date().toISOString().substring(0, 10);
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`;
  }
}