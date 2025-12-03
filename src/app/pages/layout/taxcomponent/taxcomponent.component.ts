import { Component, OnInit } from '@angular/core';
import { TaxComponentDto } from './taxcomponent.model';
import { TaxcomponentService } from './taxcomponent.service';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { TaxComponent,TaxCategory } from './taxcomponent.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService, NbGlobalPosition, NbGlobalPhysicalPosition } from '@nebular/theme';
import { Observable } from 'rxjs';

import { debounceTime,distinctUntilChanged} from 'rxjs/operators';


import { HttpResponse } from '@angular/common/http'; // or your model

@Component({
  selector: 'ngx-taxcomponent',
  templateUrl: './taxcomponent.component.html',
  styleUrls: ['./taxcomponent.component.scss']
})
export class TaxcomponentComponent {
  components: TaxComponentDto[] = [];
  taxCategories: TaxCategory[] = [];
  filteredComponents: TaxComponentDto[] = [];
  
  // Form properties
  form: FormGroup;
  searchForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  
  // UI state
  isLoading = true;
  showForm = false;
  activeTab = 'all';

  // Dropdown options
  calculationTypes = ['Fixed', 'Percentage', 'Exemption'];
  sectionCodes = ['80C', '80D', '80E', '80G', '10(13A)', '16(ia)', '80CCD(1B)'];

  constructor(
    private fb: FormBuilder,
    private taxService: TaxcomponentService,
    private toastr: NbToastrService
  ) { 
    this.form = this.fb.group({
      id:[null],
      componentName: ['', Validators.required],
      taxCategoryId: ['', Validators.required],
      calculationType: ['Exemption', Validators.required],
      isDeduction: [true],
      hasMaximumLimit: [false],
      maximumLimit: [null],
      isSectionBased: [false],
      sectionCode: [''],
      proofRequired: [false],
      isActive: [true]
    });

    this.searchForm = this.fb.group({
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.initFormListeners();
    this.loadData();
    this.setupSearch();
  }

  initFormListeners(): void {
    this.form.get('hasMaximumLimit')?.valueChanges.subscribe(value => {
      const control = this.form.get('maximumLimit');
      value ? control?.setValidators([Validators.required, Validators.min(0)]) : control?.clearValidators();
      control?.updateValueAndValidity();
    });

    this.form.get('isSectionBased')?.valueChanges.subscribe(value => {
      const control = this.form.get('sectionCode');
      value ? control?.setValidators([Validators.required]) : control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  setupSearch(): void {
    this.searchForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.searchComponents());
  }

  loadData(): void {
    this.isLoading = true;
    this.taxService.getAllComponents().subscribe({
      next: (components) => {
        this.components = components;
        this.filterComponents();
        this.loadTaxCategories();
      },
      error: (err) => this.showToast('danger', 'Error', 'Failed to load components')
    });
  }

  loadTaxCategories(): void {
    this.taxService.getTaxCategories().subscribe({
      next: (categories) => {
        this.taxCategories = categories;
        this.isLoading = false;
      },
      error: (err) => this.showToast('danger', 'Error', 'Failed to load tax categories')
    });
  }

  filterComponents(): void {
    switch (this.activeTab) {
      case 'active':
        this.filteredComponents = this.components.filter(c => c.isActive);
        break;
      case 'all':
        this.filteredComponents = [...this.components];
        break;
      default:
        this.filteredComponents = this.components.filter(c => c.sectionCode === this.activeTab);
    }
    this.searchComponents();
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
    this.filterComponents();
  }

  toggleForm(editMode: boolean = false, id: number | null = null): void {
    this.isEditMode = editMode;
    this.currentId = id;
    this.showForm = !this.showForm;
    
    if (!editMode) {
      this.form.reset({
        calculationType: 'Exemption',
        isDeduction: true,
        isActive: true,
        id:null,
      });
    }
  }

  editComponent(id: number): void {
    this.isLoading = true;
    this.taxService.getComponentById(id).subscribe({
      next: (component) => {
        this.form.patchValue(component);
        this.toggleForm(true, id);
        this.isLoading = false;
      },
      error: (err) => this.showToast('danger', 'Error', 'Failed to load component')
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('warning', 'Validation', 'Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const componentData = this.form.value;
    let operation: Observable<any>;
     operation = this.isEditMode && this.currentId
      ? this.taxService.updateComponent(this.currentId, componentData)
      : this.taxService.createComponent(componentData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Updated successfully' : 'Created successfully';
        this.showToast('success', 'Success', message);
        this.loadData();
        this.toggleForm();
      },
      error: (err) => {
        this.showToast('danger', 'Error', 'Operation failed');
        this.isLoading = false;
      }
    });
  }

  toggleStatus(id: number): void {
    if (confirm('Are you sure you want to toggle the status?')) {
      this.isLoading = true;
      this.taxService.toggleComponentStatus(id).subscribe({
        next: () => {
          this.showToast('success', 'Success', 'Status updated');
          this.loadData();
        },
        error: (err) => {
          this.showToast('danger', 'Error', 'Failed to update status');
          this.isLoading = false;
        }
      });
    }
  }

  searchComponents(): void {
    const query = this.searchForm.get('searchQuery')?.value?.toLowerCase() || '';
    if (!query) {
      return;
    }

    this.filteredComponents = this.filteredComponents.filter(c => 
      c.componentName.toLowerCase().includes(query) ||
      c.taxCategoryName.toLowerCase().includes(query) ||
      (c.sectionCode && c.sectionCode.toLowerCase().includes(query))
    );
  }

  showToast(type: string, title: string, message: string): void {
    this.toastr.show(message, title, { status: type, duration: 3000 });
  }
}
