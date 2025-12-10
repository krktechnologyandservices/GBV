import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, OrgAttributeDto, OrgAttributeValueDto } from '../employee-new/employee-new.service';
import { NbToastrService, NbGlobalPosition, NbGlobalPhysicalPosition } from '@nebular/theme';

@Component({
  selector: 'ngx-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number;
  availableAttributes: OrgAttributeDto[] = [];
  isMobile = false;
  currentStep = 1;
  totalSteps = 5;
  isLoading = false;
  hasUnsavedChanges = false;
  
  // Toast configuration
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  
  // Form sections for progress tracking
  formSections = [
    { id: 1, title: 'Basic Info', icon: 'person-outline', completed: false },
    { id: 2, title: 'Addresses', icon: 'home-outline', completed: false },
    { id: 3, title: 'Bank Details', icon: 'credit-card-outline', completed: false },
    { id: 4, title: 'Attributes', icon: 'layers-outline', completed: false },
    { id: 5, title: 'Certificates', icon: 'file-text-outline', completed: false }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private employeeService: EmployeeService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.checkDevice();
    this.setupForm();
    this.loadAttributes();
    this.loadEmployeeData();
    
    // Detect unsaved changes
    this.employeeForm.valueChanges.subscribe(() => {
      this.hasUnsavedChanges = true;
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkDevice();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges) {
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  }

  private checkDevice() {
    this.isMobile = window.innerWidth < 768;
  }

  private setupForm() {
    this.employeeForm = this.fb.group({
      employeeId: [null],
      employeeCode: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      middleName: ['', Validators.maxLength(50)],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfJoining: ['', Validators.required],
      aadharNo: ['', [Validators.pattern('^[0-9]{12}$')]],
      emailId: ['', [Validators.email, Validators.maxLength(100)]],
      activeStatus: [true],
      addresses: this.fb.array([]),
      banks: this.fb.array([]),
      attributes: this.fb.array([]),
      certificates: this.fb.array([]),
    });
  }

  private loadAttributes() {
    this.employeeService.getAttributesWithValues().subscribe({
      next: (data) => {
        this.availableAttributes = data;
      },
      error: () => {
        this.showToast('error', 'Failed to load attributes', 'Please try again');
      }
    });
  }

  private loadEmployeeData() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployee(this.employeeId);
      } else {
        this.initializeFormArrays();
      }
    });
  }

  private initializeFormArrays() {
    this.addAddress();
    this.addBank();
    this.addAttribute();
    this.addCertificate();
  }

  // Navigation
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.scrollToTop();
      this.markSectionAsCompleted(this.currentStep - 1);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private markSectionAsCompleted(sectionIndex: number) {
    if (sectionIndex >= 0 && sectionIndex < this.formSections.length) {
      this.formSections[sectionIndex].completed = true;
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['pattern']) return 'Invalid format';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    
    return 'Invalid value';
  }

  // Toast notifications
  private showToast(type: string, title: string, message: string) {
    this.toastrService.show(message, title, {
      status: type as any,
      duration: 3000,
      position: this.position
    });
  }

  // TrackBy functions
  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  // Addresses
  get addresses() {
    return this.employeeForm.get('addresses') as FormArray;
  }

  addAddress() {
    this.addresses.push(this.fb.group({
      addressLine1: [''],
      addressLine2: [''],
      addressLine3: [''],
      city: [''],
      pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      mobile: ['', [Validators.pattern('^[0-9]{10}$')]],
    }));
  }

  removeAddress(index: number) {
    if (this.addresses.length > 1) {
      this.addresses.removeAt(index);
    }
  }

  // Banks
  get banks() {
    return this.employeeForm.get('banks') as FormArray;
  }

  addBank() {
    this.banks.push(this.fb.group({
      bankName: [''],
      branchName: [''],
      accountNo: ['', [Validators.pattern('^[0-9]{9,18}$')]],
      ifscCode: ['', [Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
    }));
  }

  removeBank(index: number) {
    if (this.banks.length > 1) {
      this.banks.removeAt(index);
    }
  }

  // Attributes
  get attributes() {
    return this.employeeForm.get('attributes') as FormArray;
  }

  addAttribute() {
    this.attributes.push(this.fb.group({
      id: [null],
      attributeName: [''],
      value: [''],
      dataType: ['']
    }));
  }

  removeAttribute(index: number) {
    if (this.attributes.length > 1) {
      this.attributes.removeAt(index);
    }
  }

  onAttributeSelected(index: number): void {
    const attrId = this.attributes.at(index).get('id')?.value;
    const selectedAttr = this.availableAttributes.find(attr => attr.id === attrId);

    if (selectedAttr) {
      this.attributes.at(index).patchValue({
        attributeName: selectedAttr.attributeName,
        dataType: selectedAttr.dataType,
        value: selectedAttr.dataType === 'Dropdown' ? '' : ''
      });
    }
  }

  getAttributeType(index: number): string {
    const attrId = this.attributes.at(index).get('id')?.value;
    const attr = this.availableAttributes.find(a => a.id === attrId);
    return attr?.dataType || 'String';
  }

  getAttributeValues(index: number): OrgAttributeValueDto[] {
    const attrId = this.attributes.at(index).get('id')?.value;
    const attr = this.availableAttributes.find(a => a.id === attrId);
    return attr?.values || [];
  }

  // Certificates
  get certificates() {
    return this.employeeForm.get('certificates') as FormArray;
  }

  addCertificate() {
    this.certificates.push(this.fb.group({
      certificateName: [''],
      issuer: [''],
      issueDate: [''],
      file: [null],
      verifiedStatus: [false],
    }));
  }

  removeCertificate(index: number) {
    if (this.certificates.length > 1) {
      this.certificates.removeAt(index);
    }
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('warning', 'File too large', 'Maximum file size is 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('warning', 'Invalid file type', 'Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      this.certificates.at(index).patchValue({ file });
      this.showToast('success', 'File selected', `${file.name} ready for upload`);
    }
  }

  // Load employee data
  loadEmployee(id: number) {
    this.isLoading = true;
    this.employeeService.get(id).subscribe({
      next: (emp) => {
        this.employeeForm.patchValue({
          employeeId: emp.employeeId,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          middleName: emp.middleName,
          lastName: emp.lastName,
          dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : null,
          aadharNo: emp.aadharNo,
          emailId: emp.emailId,
          activeStatus: emp.activeStatus,
        });

        // Load all arrays
        this.loadFormArrays(emp);
        this.isLoading = false;
        this.showToast('success', 'Employee loaded', 'Employee data loaded successfully');
      },
      error: () => {
        this.isLoading = false;
        this.showToast('error', 'Failed to load', 'Could not load employee data');
      }
    });
  }

  private loadFormArrays(emp: any) {
    // Attributes
    this.attributes.clear();
    (emp.attributes || []).forEach(attr => {
      this.attributes.push(this.fb.group({
        id: [attr.attributeId],
        attributeName: [attr.attributeName],
        dataType: [attr.dataType],
        value: [attr.value]
      }));
    });

    // Certificates
    this.certificates.clear();
    (emp.certificates || []).forEach(cert => {
      this.certificates.push(this.fb.group({
        certificateName: [cert.certificateName],
        issuer: [cert.issuer],
        issueDate: [this.toDateInputFormat(cert.issueDate)],
        verifiedStatus: [cert.verifiedStatus]
      }));
    });

    // Addresses
    this.addresses.clear();
    (emp.addresses || []).forEach(addr => {
      this.addresses.push(this.fb.group({
        addressLine1: [addr.addressLine1],
        addressLine2: [addr.addressLine2],
        addressLine3: [addr.addressLine3],
        city: [addr.city],
        pincode: [addr.pincode],
        mobile: [addr.mobile]
      }));
    });

    // Banks
    this.banks.clear();
    (emp.banks || []).forEach(bank => {
      this.banks.push(this.fb.group({
        bankName: [bank.bankName],
        branchName: [bank.branchName],
        accountNo: [bank.accountNo],
        ifscCode: [bank.ifscCode]
      }));
    });

    // If arrays are empty, add default entries
    if (this.addresses.length === 0) this.addAddress();
    if (this.banks.length === 0) this.addBank();
    if (this.attributes.length === 0) this.addAttribute();
    if (this.certificates.length === 0) this.addCertificate();
  }

  // Save employee
  async save() {
    if (this.employeeForm.invalid) {
      this.showToast('warning', 'Validation Error', 'Please fill all required fields correctly');
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    try {
      const payload = this.employeeForm.value;
      
      // Upload certificates
      payload.certificates = await this.uploadCertificatesAndGetPaths();
      
      // Clean up payload
      payload.certificates = payload.certificates.map(cert => {
        const { file, ...rest } = cert;
        return rest;
      });

      // Filter empty arrays
      payload.addresses = payload.addresses?.filter(a =>
        a.addressLine1 || a.city || a.pincode || a.mobile
      );

      payload.attributes = payload.attributes?.filter(attr =>
        attr.attributeName && attr.value
      );

      payload.banks = payload.banks?.filter(b =>
        b.bankName && b.accountNo && b.ifscCode
      );

      payload.certificates = payload.certificates?.filter(cert =>
        cert.certificateName && cert.issuer
      );

      // Save employee
      if (this.isEditMode) {
        await this.employeeService.update(this.employeeId, payload).toPromise();
        this.showToast('success', 'Updated', 'Employee updated successfully');
      } else {
        await this.employeeService.create(payload).toPromise();
        this.showToast('success', 'Created', 'Employee created successfully');
      }

      this.hasUnsavedChanges = false;
      this.router.navigate(['/pages/master/employeemaster']);
      
    } catch (error) {
      this.showToast('error', 'Save Failed', 'Could not save employee data');
      console.error('Save error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async uploadCertificatesAndGetPaths(): Promise<any[]> {
    const uploaded = [];

    for (let i = 0; i < this.certificates.length; i++) {
      const cert = this.certificates.at(i);
      const file = cert.get('file')?.value;
      
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res: any = await this.employeeService.uploadCertificate(formData).toPromise();
          uploaded.push({ ...cert.value, filePath: res.filePath });
        } catch (error) {
          console.error('Upload error:', error);
          uploaded.push(cert.value); // Push without file path if upload fails
        }
      } else {
        uploaded.push(cert.value);
      }
    }

    return uploaded;
  }

  private markAllAsTouched() {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  toDateInputFormat(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString().substring(0, 10);
  }

  // Mobile-specific actions
  showDeleteConfirm(type: string, index: number) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      switch (type) {
        case 'address':
          this.removeAddress(index);
          break;
        case 'bank':
          this.removeBank(index);
          break;
        case 'attribute':
          this.removeAttribute(index);
          break;
        case 'certificate':
          this.removeCertificate(index);
          break;
      }
    }
  }

  // Form completion check
  getCompletionPercentage(): number {
    let completed = 0;
    const sections = [
      this.employeeForm.get('employeeCode')?.valid,
      this.employeeForm.get('firstName')?.valid,
      this.employeeForm.get('lastName')?.valid,
      this.employeeForm.get('dateOfJoining')?.valid,
      this.addresses.length > 0 && this.addresses.at(0).valid,
      this.banks.length > 0 && this.banks.at(0).valid,
      this.attributes.length > 0 && this.attributes.at(0).valid,
      this.certificates.length > 0 && this.certificates.at(0).valid
    ];

    completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }
}