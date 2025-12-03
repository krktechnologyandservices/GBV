import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { BillingService } from '../billsservice.service';

@Component({
  selector: 'app-offline-payment-modal',
  templateUrl: './offlinepaymentmodal.component.html',
})
export class OfflinePaymentModalComponent implements OnInit {
  @Input() billId!: number;
  @Input() amount!: number;

  paymentForm!: FormGroup;
  paymentModes = ['Cash', 'GooglePay', 'UPI', 'Other'];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<OfflinePaymentModalComponent>,
    private billingser: BillingService
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      billId: [this.billId, Validators.required],
      amount: [this.amount, Validators.required],
      paymentMode: [null, Validators.required],
      referenceNumber: [''],
      paymentDate: [new Date().toISOString().substring(0, 10), Validators.required],
      receiptUrl: ['']
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.paymentForm.patchValue({ receiptUrl: this.selectedFile.name });
    }
  }

  submit() {
    const formValue = this.paymentForm.value;

    const paymentDate = new Date(formValue.paymentDate);

    const payload = {
      billId: formValue.billId,
      amount: formValue.amount,
      paymentMode: formValue.paymentMode,
      referenceNumber: formValue.referenceNumber,
      paymentDate: paymentDate.toISOString(),
      receiptUrl: formValue.receiptUrl
    };

    this.billingser.uploadOfflinePayment(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err)
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
