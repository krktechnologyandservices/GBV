import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeePayService } from './salarycomponents.service';

@Component({
  selector: 'app-employee-pay',
  templateUrl: './salarycomponents.component.html'
})
export class EmployeePayComponent implements OnInit {
  form: FormGroup;
  filteredEmployees = [];
  filteredComponents = [];
  componentNameToIdMap = new Map<string, number>();
  payPeriods = [];
  componentList = [];
  editId: number = 0;
  employeeId: number = null;

  constructor(
    private fb: FormBuilder,
    private service: EmployeePayService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      employeeCode: ['', Validators.required],
      componentType: ['Fixed', Validators.required],
      componentName: ['', Validators.required],
      payComponentId: [null, Validators.required],
      amount: [null, Validators.required],
      payPeriodId: [null],
      fromDate: [null],
      toDate: [null],
    });

    this.service.getPayPeriods().subscribe(res => this.payPeriods = res as any[]);
    this.onComponentTypeChange('Fixed');
  }

  onSearchEmployee(code: string) {
    if (code.length >= 2) {
      this.service.searchEmployeeByCode(code).subscribe(res => this.filteredEmployees = res as any[]);
    }
  }

  onEmployeeSelect(selectedCode: string) {
    const emp = this.filteredEmployees.find(e => e.EmployeeCode === selectedCode);
    if (emp) {
      this.employeeId = emp.EmployeeId;
      this.loadData(emp.EmployeeId);
    }
  }

  onComponentTypeChange(type: string) {
    this.service.getPayComponentsByType(type).subscribe((res: any[]) => {
      this.filteredComponents = res;
      this.componentNameToIdMap.clear();
      res.forEach(c => this.componentNameToIdMap.set(c.ComponentName, c.Id));
    });
  }

  onComponentSelect(selectedName: string) {
    const id = this.componentNameToIdMap.get(selectedName);
    if (id) {
      
      this.form.patchValue({ payComponentId: id });
    }
  }

  loadData(employeeId: number) {
    this.service.getAll(employeeId).subscribe((res: any) => {
      this.componentList = res;
    });
  }

  submit() {
    const val = this.form.value;
    const payload = {
      employeeId: this.employeeId,
      payComponentId: val.payComponentId,
      payPeriodId: val.componentType === 'Variable' ? val.payPeriodId : null,
      fromDate: val.componentType === 'Fixed' ? val.fromDate : null,
      toDate: val.componentType === 'Fixed' ? val.toDate : null,
      amount: val.amount
    };

    const call = this.editId
      ? this.service.update(this.editId, payload)
      : this.service.add(payload);

    call.subscribe(() => {
      this.loadData(this.employeeId);
      this.form.reset();
      this.editId = 0;
    });
  }

  edit(item: any) {
    this.form.patchValue({
      componentType: item.PayPeriodId ? 'Variable' : 'Fixed',
      amount: item.Amount,
      payComponentId: item.PayComponentId,
      componentName: item.ComponentName,
      payPeriodId: item.PayPeriodId,
      fromDate: item.FromDate,
      toDate: item.ToDate
    });
    this.editId = item.Id;
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => {
      this.loadData(this.employeeId);
    });
  }
}

