
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayComponentServiceService } from './pay-component-service.service';

import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbGlobalPosition, NbGlobalPhysicalPosition } from '@nebular/theme';


import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http'; // or your model



@Component({
  selector: 'app-pay-component-form',
  templateUrl: './payablecomponent.component.html',
  styleUrls: ['./payablecomponent.component.scss']
})
export class PayComponent implements OnInit {
  form: FormGroup;
  payGroups: PayGroup[] = [];
  isEditMode = false;
  componentId: number | null = null;
  isLoading = false;

  // Toast configuration
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  toastDuration = 3000;

  // Dropdown options
  calculationTypes = ['Fixed', 'Percentage', 'Formula','Variable'];
  prorationBases = ['Days', 'Hours', 'Custom'];

  constructor(
    private fb: FormBuilder,
    private payComponentService: PayComponentServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadPayGroups();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.componentId = +params['id'];
        this.loadComponent(this.componentId);
      } else {
        this.showToast('info', 'Create New Component', 'Fill the form to create a new pay component');
      }
    });
  }

  private showToast(type: string, title: string, body: string) {
    const config = {
      status: type,
      duration: this.toastDuration,
      position: this.position,
      destroyByClick: true,
    };
    
    this.toastr.show(body, title, config);
  }

  initForm(): void {
    this.form = this.fb.group({
      componentName: ['', Validators.required],
      componentDescription:['', Validators.required],
      payGroupId: ['', Validators.required],
      calculationType: ['Fixed', Validators.required],
      isProrated: [false],
      prorationBase: [{ value: 'Days', disabled: true }, Validators.required],
      isTaxable: [true],
      isDeduction: [false],
      displayInPayslip: [true],
      formula: ['']
    });

    this.setupFormListeners();
  }

  setupFormListeners(): void {
    this.form.get('isProrated').valueChanges.subscribe(value => {
      const prorationBaseControl = this.form.get('prorationBase');
      if (value) {
        prorationBaseControl.enable();
        this.showToast('info', 'Proration Enabled', 'Please select proration base');
      } else {
        prorationBaseControl.disable();
        prorationBaseControl.reset('Days');
      }
    });

    this.form.get('calculationType').valueChanges.subscribe(value => {
      const formulaControl = this.form.get('formula');
      if (value === 'Formula') {
        formulaControl.setValidators([Validators.required]);
        this.showToast('info', 'Formula Calculation', 'Please enter the calculation formula');
      } else {
        formulaControl.clearValidators();
        formulaControl.reset('');
      }
      formulaControl.updateValueAndValidity();
    });
  }

  loadPayGroups(): void {
    this.isLoading = true;
    this.payComponentService.getPayGroups().subscribe({
      next: (groups) => {
        this.payGroups = groups;
        this.isLoading = false;
        if (groups.length === 0) {
          this.showToast('warning', 'No Pay Groups', 'Please create pay groups first');
        }
      },
      error: (err) => {
        this.showToast('danger', 'Error', 'Failed to load pay groups');
        this.isLoading = false;
      }
    });
  }

  loadComponent(id: number): void {
    this.isLoading = true;
    this.payComponentService.getById(id).subscribe({
      next: (component) => {
        this.form.patchValue(component);
        this.isLoading = false;
        this.showToast('success', 'Loaded', 'Component data loaded successfully');
      },
      error: (err) => {
        this.showToast('danger', 'Error', 'Failed to load component details');
        this.isLoading = false;
        this.router.navigate(['/pay-components']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('warning', 'Validation Error', 'Please fill all required fields correctly');
      
      // Highlight invalid fields
      Object.keys(this.form.controls).forEach(key => {
        if (this.form.controls[key].invalid) {
          this.showToast('warning', 'Invalid Field', `${key} is required or invalid`);
        }
      });
      
      return;
    }

    this.isLoading = true;
    const componentData = this.form.value;
    let operation: Observable<any>;
     operation = this.isEditMode
      ? this.payComponentService.update(this.componentId, componentData)
      : this.payComponentService.create(componentData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode 
          ? 'Component updated successfully' 
          : 'Component created successfully';
        this.showToast('success', 'Success', message);
        this.router.navigate(['/pay-components']);
      },
      error: (err) => {
        const message = this.isEditMode
          ? 'Failed to update component'
          : 'Failed to create component';
        this.showToast('danger', 'Error', `${message}: ${err.message || 'Unknown error'}`);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    if (this.form.dirty) {
      if (confirm('Are you sure you want to discard your changes?')) {
        this.showToast('warning', 'Changes Discarded', 'Your unsaved changes have been discarded');
        this.router.navigate(['/pay-components']);
      }
    } else {
      this.router.navigate(['/pay-components']);
    }
  }

  // Helper method to show field-specific errors
  showFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field.invalid && (field.dirty || field.touched);
  }
}





export interface PayComponent {
  id: number;
  componentName: string;
  payGroupId: number;
  payGroupName?: string;
  calculationType: string;
  isProrated: boolean;
  prorationBase: string;
  isTaxable: boolean;
  isDeduction: boolean;
  displayInPayslip: boolean;
  formula: string;
}

export interface PayGroup {
  id: number;
  categoryName: string;
  payableType: string;
  fixedDays?: number;
}