import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../settings.service';
import { WorkHoursSetting } from '../settings.service';
@Component({
  selector: 'app-work-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss'],
})
export class WorkHoursComponent implements OnInit {
  workHoursList: WorkHoursSetting[] = [];
  loading = false;
  form: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.form = this.fb.group({
      id: [0],
      department: ['', Validators.required],
      morningStart: ['', Validators.required],
      morningEnd: ['', Validators.required],
      afternoonStart: ['', Validators.required],
      afternoonEnd: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadWorkHours();
  }

  loadWorkHours() {
    this.loading = true;
    this.settingsService.getWorkHours().subscribe({
      next: (data) => {
        this.workHoursList = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  edit(item: WorkHoursSetting) {
    this.form.patchValue(item);
    this.isEdit = true;
  }

  cancel() {
    this.form.reset({
      id: 0,
      department: '',
      morningStart: '',
      morningEnd: '',
      afternoonStart: '',
      afternoonEnd: '',
    });
    this.isEdit = false;
  }

  save() {
    if (this.form.invalid) return;

    const model = this.form.value as WorkHoursSetting;

    if (this.isEdit) {
      this.settingsService.upsertWorkHours(model).subscribe(() => {
        this.loadWorkHours();
        this.cancel();
      });
    } else {
      this.settingsService.upsertWorkHours(model).subscribe(() => {
        this.loadWorkHours();
        this.cancel();
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this work hours setting?')) {
      this.settingsService.deleteWorkHours(id).subscribe(() => this.loadWorkHours());
    }
  }
}
