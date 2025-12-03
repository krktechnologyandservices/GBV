import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../settings.service';
import { AttendanceReason } from '../settings.service';

@Component({
  selector: 'app-attendance-reasons',
  templateUrl: './working-reasons.component.html',
  styleUrls: ['./working-reasons.component.scss'],
})
export class AttendanceReasonsComponent implements OnInit {
  reasons: AttendanceReason[] = [];
  loading = false;
  form: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      description: ['', Validators.required],
      requiresApproval: [false],
    });
  }

  ngOnInit(): void {
    this.loadReasons();
  }

  loadReasons() {
    this.loading = true;
    this.settingsService.getAttendanceReasons().subscribe({
      next: (data) => {
        this.reasons = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  edit(item: AttendanceReason) {
    this.form.patchValue(item);
    this.isEdit = true;
    // Disable code editing on update
    this.form.get('code')?.disable();
  }

  cancel() {
    this.form.reset({ code: '', description: '', requiresApproval: false });
    this.form.get('code')?.enable();
    this.isEdit = false;
  }

  save() {
    if (this.form.invalid) return;

    // For update, code is disabled, get raw value
    const model: AttendanceReason = this.form.getRawValue();

    if (this.isEdit) {
      this.settingsService.upsertAttendanceReason(model).subscribe(() => {
        this.loadReasons();
        this.cancel();
      });
    } else {
      this.settingsService.upsertAttendanceReason(model).subscribe(() => {
        this.loadReasons();
        this.cancel();
      });
    }
  }

  delete(code: string) {
    if (confirm('Delete this attendance reason?')) {
      this.settingsService.deleteAttendanceReason(code).subscribe(() => this.loadReasons());
    }
  }
}
