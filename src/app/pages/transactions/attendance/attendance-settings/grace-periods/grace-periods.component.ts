import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../settings.service';
import { GracePeriodSetting } from '../settings.service';

@Component({
  selector: 'app-grace-periods',
  templateUrl: './grace-periods.component.html',
  styleUrls: ['./grace-periods.component.scss'],
})
export class GracePeriodsComponent implements OnInit {
  gracePeriods: GracePeriodSetting[] = [];
  loading = false;
  form: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.form = this.fb.group({
      id: [0],
      department: ['', Validators.required],
      graceMinutes: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadGracePeriods();
  }

  loadGracePeriods() {
    this.loading = true;
    this.settingsService.getGracePeriods().subscribe({
      next: (data) => {
        this.gracePeriods = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  edit(item: GracePeriodSetting) {
    this.form.patchValue(item);
    this.isEdit = true;
  }

  cancel() {
    this.form.reset({ id: 0, department: '', graceMinutes: 0 });
    this.isEdit = false;
  }

  save() {
    if (this.form.invalid) return;

    const model = this.form.value as GracePeriodSetting;

    if (this.isEdit) {
      this.settingsService.upsertGracePeriod(model).subscribe(() => {
        this.loadGracePeriods();
        this.cancel();
      });
    } else {
      this.settingsService.upsertGracePeriod(model).subscribe(() => {
        this.loadGracePeriods();
        this.cancel();
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this grace period?')) {
      this.settingsService.deleteGracePeriod(id).subscribe(() => this.loadGracePeriods());
    }
  }
}
