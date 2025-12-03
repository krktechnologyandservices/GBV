import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EmployeeService, EmployeeListItem } from './employee-new.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ngx-employee-new',
  templateUrl: './employee-new.component.html',
})
export class EmployeeNewComponent implements OnInit {

  @ViewChild('scrollTop') scrollTopRef!: ElementRef;
  @ViewChild('tableWrapper') tableWrapperRef!: ElementRef;

  employees: EmployeeListItem[] = [];
  filteredEmployees: EmployeeListItem[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(private service: EmployeeService) {}

  ngOnInit() {
    this.load();

    this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
      const lower = term.toLowerCase();
      this.filteredEmployees = this.employees.filter(emp =>
        emp.employeeCode.toLowerCase().includes(lower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lower) ||
        emp.emailId.toLowerCase().includes(lower)
      );
    });
  }

  load() {
    this.service.getAll().subscribe(data => {
      this.employees = data.map(emp => ({
        employeeId: emp.employeeId!,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        emailId: emp.emailId,
        activeStatus: emp.activeStatus
      }));
      this.filteredEmployees = this.employees;
    });
  }

  onSearchChange(searchText: string) {
    this.searchSubject.next(searchText);
  }

  delete(id: number) {
    if (confirm('Are you sure?')) {
      this.service.delete(id).subscribe(() => this.refresh());
    }
  }

  refresh() {
    this.service.clearCache();
    this.load();
  }

  trackByEmployeeId(index: number, emp: EmployeeListItem): number {
    return emp.employeeId;
  }

  syncScroll(event: any) {
    const scrollTopEl = this.scrollTopRef.nativeElement;
    const tableWrapperEl = this.tableWrapperRef.nativeElement;

    if (event.target === scrollTopEl) {
      tableWrapperEl.scrollLeft = scrollTopEl.scrollLeft;
    } else {
      scrollTopEl.scrollLeft = tableWrapperEl.scrollLeft;
    }
  }
}
