import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { NbCardModule, NbButtonModule } from '@nebular/theme';


@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule
  ],
  exports: [ConfirmDialogComponent]
})
export class ConfirmDialogModule { }
