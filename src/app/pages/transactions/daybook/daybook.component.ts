import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DayBookService } from './daybook.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.scss']
})
export class DayBookComponent implements OnInit {
  filterForm: FormGroup;
  daybookEntries: any[] = [];

  roomList = [];      // Load from API
  studentList = [];   // Load from API

  constructor(private fb: FormBuilder, private service: DayBookService) {


 
  }

  ngOnInit(): void {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const dd = String(today.getDate()).padStart(2, '0');
  
    const todayStr = `${yyyy}-${mm}-${dd}`;




    this.filterForm = this.fb.group({
      rooms: [[]],
      students: [[]],
      genders: [[]],
      fromDate: [todayStr],
      toDate: [todayStr]
    });

    this.loadFilters();
    this.loadDayBook();
  }

  loadFilters() {
    this.service.getRooms().subscribe(res => this.roomList = res);
    this.service.getStudents().subscribe(res => this.studentList = res);
  }

  loadDayBook() {
    const filters = this.filterForm.value;
    this.service.getDayBook(filters).subscribe(res => this.daybookEntries = res);
  }

  submitFilter() {
    this.loadDayBook();
  }

  viewEntry(entry: any) {
    // Navigate or open dialog based on entry.ReferenceType
    console.log('Navigate to', entry.ReferenceType, entry.ReferenceId);
  }
}
