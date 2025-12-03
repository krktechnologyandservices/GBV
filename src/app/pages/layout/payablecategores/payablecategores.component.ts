


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
interface PayableCategory {
  id: number;
  categoryName: string;
  payableType: string;
  fixedDays?: number;
}

@Component({
  selector: 'ngx-payable-categories',
  templateUrl: './payablecategores.component.html',
  styleUrls: ['./payablecategores.component.scss']
})
export class PayableCategoriesComponent implements OnInit {
  payableForm!: FormGroup;
  private baseUrl = environment.apiBaseUrl;
  payableTypes = ['Standard Days', 'Fixed Days', 'Exclude Paid Holidays'];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  payableList: PayableCategory[] = [];
  editId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPayables();
  }

  initForm(): void {
    this.payableForm = this.fb.group({
      categoryName: ['', Validators.required],
      payableType: ['', Validators.required],
      fixedDays: [null],
    });

    this.payableForm.get('payableType')?.valueChanges.subscribe(type => {
      if (type === 'Fixed Days') {
        this.payableForm.get('fixedDays')?.setValidators([Validators.required]);
      } else {
        this.payableForm.get('fixedDays')?.clearValidators();
        this.payableForm.get('fixedDays')?.reset();
      }
      this.payableForm.get('fixedDays')?.updateValueAndValidity();
    });
  }

  loadPayables(): void {
    this.http.get<PayableCategory[]>(`${this.baseUrl}/payablecategories`).subscribe({
      next: data => this.payableList = data,
      error: () => this.errorMessage = 'Failed to load categories',
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = this.payableForm.value;

    const apiUrl = this.editId
      ? `${this.baseUrl}/payablecategories/${this.editId}`
      : `${this.baseUrl}/payablecategories`;

    const request = this.editId
      ? this.http.put(apiUrl, payload)
      : this.http.post(apiUrl, payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editId ? 'Updated successfully!' : 'Created successfully!';
        this.resetForm();
        this.loadPayables();
      },
      error: () => {
        this.errorMessage = 'Failed to save category.';
        this.isSubmitting = false;
      }
    });
  }

  editCategory(cat: PayableCategory): void {
    this.editId = cat.id;
    this.payableForm.patchValue({
      categoryName: cat.categoryName,
      payableType: cat.payableType,
      fixedDays: cat.fixedDays,
    });
  }

  resetForm(): void {
    this.payableForm.reset();
    this.editId = null;
    this.isSubmitting = false;
  }
}

