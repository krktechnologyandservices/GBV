import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';

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
  
  payableTypes = [
    { id: 'Standard Days', name: 'Standard Days', icon: 'calendar-outline' },
    { id: 'Fixed Days', name: 'Fixed Days', icon: 'clock-outline' },
    { id: 'Exclude Paid Holidays', name: 'Exclude Paid Holidays', icon: 'minus-circle-outline' }
  ];
  
  isSubmitting = false;
  isEditing = false;
  payableList: PayableCategory[] = [];
  filteredList: PayableCategory[] = [];
  editId: number | null = null;
  
  // Mobile view state
  isMobileView = false;
  showForm = true;
  
  // Search
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
    
    this.initForm();
    this.loadPayables();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkViewport());
  }

  checkViewport(): void {
    this.isMobileView = window.innerWidth < 768;
    if (this.isMobileView) {
      this.showForm = false;
    } else {
      this.showForm = true;
    }
  }

  initForm(): void {
    this.payableForm = this.fb.group({
      categoryName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      payableType: ['Standard Days', Validators.required],
      fixedDays: [null]
    });

    this.payableForm.get('payableType')?.valueChanges.subscribe(type => {
      const fixedDaysControl = this.payableForm.get('fixedDays');
      if (type === 'Fixed Days') {
        fixedDaysControl?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      } else {
        fixedDaysControl?.clearValidators();
        fixedDaysControl?.reset();
      }
      fixedDaysControl?.updateValueAndValidity();
    });
  }

  loadPayables(): void {
    this.http.get<PayableCategory[]>(`${this.baseUrl}/payablecategories`).subscribe({
      next: (data) => {
        this.payableList = data;
        this.filteredList = [...data];
      },
      error: () => this.showToast('Failed to load categories', 'danger')
    });
  }

  applySearch(): void {
    if (!this.searchTerm) {
      this.filteredList = [...this.payableList];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.payableList.filter(item => 
      item.categoryName.toLowerCase().includes(term) ||
      item.payableType.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  onSubmit(): void {
    if (this.payableForm.invalid) {
      this.markFormGroupTouched(this.payableForm);
      return;
    }

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
        this.showToast(
          this.editId ? 'Category updated successfully!' : 'Category created successfully!',
          'success'
        );
        this.resetForm();
        this.loadPayables();
        if (this.isMobileView) {
          this.showForm = false;
        }
      },
      error: (error) => {
        this.showToast(error.error?.message || 'Failed to save category', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  editCategory(cat: PayableCategory): void {
    this.editId = cat.id;
    this.isEditing = true;
    this.payableForm.patchValue({
      categoryName: cat.categoryName,
      payableType: cat.payableType,
      fixedDays: cat.fixedDays
    });
    
    // Scroll to form in mobile view
    if (this.isMobileView) {
      this.showForm = true;
      setTimeout(() => {
        const formElement = document.querySelector('.form-section');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.http.delete(`${this.baseUrl}/payablecategories/${id}`).subscribe({
        next: () => {
          this.showToast('Category deleted successfully!', 'success');
          this.loadPayables();
        },
        error: () => this.showToast('Failed to delete category', 'danger')
      });
    }
  }

  resetForm(): void {
    this.payableForm.reset({
      categoryName: '',
      payableType: 'Standard Days',
      fixedDays: null
    });
    this.editId = null;
    this.isEditing = false;
    this.isSubmitting = false;
  }

  getPageItems(): PayableCategory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredList.length / this.itemsPerPage);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showToast(message: string, status: string): void {
    this.toastrService.show(message, 'Notification', {
      status,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
      duration: 3000
    });
  }

  getTypeIcon(type: string): string {
    const foundType = this.payableTypes.find(t => t.id === type);
    return foundType?.icon || 'question-mark-circle-outline';
  }

  // Add this method to your component class
showPageButton(page: number, currentPage: number, totalPages: number): boolean {
  if (totalPages <= 7) return true;
  
  // Always show first, last, current, and pages around current
  if (page === 1 || page === totalPages) return true;
  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
  
  // Show ellipsis replacements
  if (page === 2 && currentPage > 3) return false;
  if (page === totalPages - 1 && currentPage < totalPages - 2) return false;
  
  return true;
}
}