import { Component, Inject } from '@angular/core';
import { NB_DIALOG_CONFIG, NbDialogRef } from '@nebular/theme';
@Component({
  selector: 'ngx-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  title: string;
  message: string;
  confirmText: string = 'Confirm';
  cancelText: string = 'Cancel';
  dangerMode: boolean = false;

  constructor(
    @Inject(NB_DIALOG_CONFIG) public data: any,
    protected dialogRef: NbDialogRef<ConfirmDialogComponent>
  ) {
    this.title = data.title || 'Confirm Action';
    this.message = data.message || 'Are you sure you want to perform this action?';
    this.confirmText = data.confirmText || this.confirmText;
    this.cancelText = data.cancelText || this.cancelText;
    this.dangerMode = data.dangerMode || false;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
