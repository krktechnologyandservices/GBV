import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { BillingService } from '../billsservice.service';

@Component({
  selector: 'app-offline-payment-modal',
  templateUrl: './offlinepaymentmodal.component.html',
})
export class OfflinePaymentModalComponent {
  paymentForm: FormGroup;
  billId!: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<OfflinePaymentModalComponent>,
    private offlinePaymentService: BillingService
  ) {
    this.paymentForm = this.fb.group({
      billId: [null, Validators.required],
      paymentMode: [null, Validators.required],
      denomination: [''],
      amount: [0, Validators.required],
      paymentDate: [new Date(), Validators.required],
      receiptUrl: ['']
    });
  }

  // Initialize modal with data passed via context
  setContext(context: any) {
    this.billId = context.billId;
    this.paymentForm.patchValue({ billId: this.billId });
  }

  submit() {
    const formValue = this.paymentForm.value;
    const paymentDate = new Date(formValue.paymentDate);

    const payload = {
      billId: formValue.billId,
      paymentMode: formValue.paymentMode,
      denomination: formValue.denomination,
      amount: formValue.amount,
      paymentDate: paymentDate.toISOString(),
      receiptUrl: formValue.receiptUrl
    };

    this.offlinePaymentService.uploadOfflinePayment(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err)
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
