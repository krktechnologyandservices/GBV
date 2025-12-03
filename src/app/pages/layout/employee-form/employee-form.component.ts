import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService ,OrgAttributeDto,OrgAttributeValueDto} from '../employee-new/employee-new.service';

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
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {

    this.employeeService.getAttributesWithValues().subscribe(data => {
      this.availableAttributes = data;
    });

    this.employeeForm = this.fb.group({
      employeeId: [null],
      employeeCode: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      aadharNo: [''],
      emailId: ['', [Validators.email]],
      activeStatus: [true],
      addresses: this.fb.array([]),
      banks: this.fb.array([]),
      attributes: this.fb.array([]),
      certificates: this.fb.array([]),
    });

    this.route.params.subscribe(params => {
      this.loadAttributes();
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployee(this.employeeId);
      } else {
        this.addAddress();
        this.addBank();
        this.addAttribute();
        this.addCertificate();
      }
    });
  }

  // trackBy function for ngFor
  trackByIndex(index: number, item: any): number {
    return index;
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
      pincode: [''],
      mobile: [''],
    }));
  }
  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  // Banks
  get banks() {
    return this.employeeForm.get('banks') as FormArray;
  }
  addBank() {
    this.banks.push(this.fb.group({
      bankName: [''],
      branchname:[''],
      accountNo: [''],
      ifscCode: [''],
    }));
  }
  removeBank(index: number) {
    this.banks.removeAt(index);
  }

  // Attributes
  get attributes() {
    return this.employeeForm.get('attributes') as FormArray;
  }
  addAttribute() {
    this.attributes.push(this.fb.group({
      id:[null],
      attributeName: [''],
      value: [''],
    }));
  }

  
loadAttributes() {
  this.employeeService.getAttributesWithValues().subscribe(attrs => {
    const formGroups = attrs.map(attr => {
      return this.fb.group({
        id: [attr.id],
        attributeName: [attr.attributeName],
        dataType: [attr.dataType],
        value: [null, attr.isRequired ? Validators.required : []],
        values: [attr.values] // only needed for Dropdown
      });
    });

    const array = this.fb.array(formGroups);
    this.employeeForm.setControl('attributes', array);
  });
}
  removeAttribute(index: number) {
    this.attributes.removeAt(index);
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
    this.certificates.removeAt(index);
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.certificates.at(index).patchValue({ file });
    }
  }
  async uploadCertificatesAndGetPaths(): Promise<any[]> {
    const uploaded = [];
  
    for (let cert of this.certificates.controls) {
      const file = cert.get('file')?.value;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const res: any = await this.employeeService.uploadCertificate(formData).toPromise();
        uploaded.push({ ...cert.value, filePath: res.filePath });
      } else {
        uploaded.push(cert.value);
      }
    }
  
    return uploaded;
  }
  
  loadEmployee(id: number) {
    this.employeeService.get(id).subscribe(emp => {
      this.employeeForm.patchValue({
        employeeId:emp.employeeId,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : null,
        aadharNo: emp.aadharNo,
        emailId: emp.emailId,
        activeStatus: emp.activeStatus,
      });
  
      // ✅ Load Attributes
      this.attributes.clear();
     (emp.attributes || []).forEach(attr => {
      this.attributes.push(this.fb.group({
        id: [attr.attributeId],                  // important!
        attributeName: [attr.attributeName],
        dataType: [attr.dataType],      // important for template
        value: [attr.value]
      }));
    });
      // ✅ Load Certificates
      this.certificates.clear();
      (emp.certificates || []).forEach(cert => {
        this.certificates.push(this.fb.group({
          certificateName: [cert.certificateName],
          issuer: [cert.issuer],
          issueDate: [this.toDateInputFormat(cert.issueDate)],
          verifiedStatus: [cert.verifiedStatus]
        }));
      });
  
      // ✅ Load Addresses
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
  
      // ✅ Load Bank Details
      this.banks.clear();
      (emp.banks || []).forEach(bank => {
        this.banks.push(this.fb.group({
          bankName: [bank.bankName],
          branchName: [bank.branchName],
          accountNo: [bank.accountNo],
          ifscCode: [bank.ifscCode]
        }));
      });
    });
  }
  onAttributeSelected(index: number): void {
    const attrId = this.attributes.at(index).get('id')?.value;
    const selectedAttr = this.availableAttributes.find(attr => attr.id === attrId);
  
    if (selectedAttr) {
      this.attributes.at(index).patchValue({
        value: selectedAttr.dataType === 'Dropdown' ? '' : '',
        attributeName:selectedAttr.attributeName
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

  async save() {
    if (this.employeeForm.invalid) return;



    const payload = this.employeeForm.value;
    payload.certificates = await this.uploadCertificatesAndGetPaths();

    payload.certificates = payload.certificates.map(cert => {
      const { file, ...rest } = cert;
      return rest;
    });

    
payload.addresses = payload.addresses?.filter(a =>
  a.addressline1 || a.city || a.pincode || a.mobile
);
console.log('Payload attributes:', JSON.stringify(payload.attributes, null, 2));
payload.attributes = payload.attributes?.filter(attr =>
  attr.attributeName && attr.value
);

payload.banks = payload.banks?.filter(b =>
  b.bankName && b.accountNo && b.ifscCode
);

payload.certificates = payload.certificates?.filter(cert =>
  cert.certificateName && cert.issuer
);






    if (this.isEditMode) {
      this.employeeService.update(this.employeeId, payload).subscribe(() => {
        this.router.navigate(['/pages/master/employeemaster']);
      });
    } else {
      this.employeeService.create(payload).subscribe(() => {
        this.router.navigate(['/pages/master/employeemaster']);
      });
    }
  }
  toDateInputFormat(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString().substring(0, 10); // 'YYYY-MM-DD'
  }
}
