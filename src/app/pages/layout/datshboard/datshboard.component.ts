import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { NbMenuService } from '@nebular/theme';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './datshboard.component.html',
  styleUrls: ['./datshboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('studentQuickView') studentQuickView!: TemplateRef<any>;

  // Rooms Data
  rooms: any[] = [];
  filteredRooms: any[] = [];
  selectedRoom: any = null;
  occupants: any[] = [];
  filteredOccupants: any[] = [];
  totalActiveBookings: number = 0;
  totalVacated: number = 0;
  roomSearch: string = '';
  currentRoomFilter: string = 'all';
  showPendingOnly: boolean = false;

  // Students Data
  students: any[] = [];
  filteredStudents: any[] = [];
  courses: string[] = [];
  currentMonthAdmissions: number = 0;
  maleCount: number = 0;
  femaleCount: number = 0;
  courseWiseCount: any = {};
  inactiveStudents: any[] = [];
  studentSearch: string = '';

  // Payments Data
  payments: any[] = [];
  filteredPayments: any[] = [];
  todayPaymentsCount = 0;
  monthPaymentsCount = 0;
  pendingPaymentsCount = 0;
  totalDueAmount = 0;
  paymentSearch: string = '';
  currentPaymentFilter: string = 'all';

  // UI State
  showExportModal: boolean = false;
  quickViewRef!: NbDialogRef<any>;
  collapsedSections: any = {
    rooms: false,
    students: false,
    payments: false
  };

  // Context Menu
  studentMenuItems = [
    { title: 'View Details', icon: 'eye-outline', data: { action: 'view' } },
    { title: 'Edit Student', icon: 'edit-outline', data: { action: 'edit' } },
    { title: 'View Ledger', icon: 'file-text-outline', data: { action: 'ledger' } },
    { title: 'Make Payment', icon: 'credit-card-outline', data: { action: 'payment' } },
    { title: 'Move Room', icon: 'swap-outline', data: { action: 'move' } },
    { title: 'Send Message', icon: 'message-circle-outline', data: { action: 'message' } }
  ];

  paymentColumns = [
    { field: 'StudentName', header: 'Student Name' },
    { field: 'PaymentDate', header: 'Payment Date' },
    { field: 'PaymentMode', header: 'Payment Mode' },
    { field: 'TotalAmount', header: 'Paid (₹)' },
    { field: 'DueAmount', header: 'Due (₹)' },
    { field: 'Status', header: 'Status' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dialogService: NbDialogService,
    private nbMenuService: NbMenuService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.setupServiceWorker();
    this.setupContextMenuListener();
  }

  private loadDashboardData() {
    // Load all dashboard data
    this.dashboardService.getStudents().subscribe(students => {
      this.students = students;
      this.filteredStudents = students;
      this.calculateStudentMetrics();
    });

    this.dashboardService.getCourses().subscribe(courses => {
      this.courses = courses;
    });

    this.dashboardService.getRooms().subscribe(rooms => {
      this.rooms = rooms;
      this.filteredRooms = rooms;
      this.calculateRoomMetrics();
    });

    this.loadPayments('all');
  }

  private setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(registration => console.log('SW registered'))
        .catch(err => console.log('SW registration failed'));
    }
  }

  private setupContextMenuListener() {
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'student-menu'),
        map(({ item: { data } }) => data)
      )
      .subscribe(context => {
        const student = context.student;
        const action = context.action;

        switch (action) {
          case 'view':
            this.viewStudentQuick(student);
            break;
          case 'edit':
            this.editStudent(student);
            break;
          case 'ledger':
            this.viewStudentLedger(student);
            break;
          case 'payment':
            this.makePayment(student);
            break;
          case 'move':
            this.moveStudentRoom(student);
            break;
          case 'message':
            this.sendMessage(student);
            break;
        }
      });
  }

  // Room Methods
  calculateRoomMetrics() {
    this.totalActiveBookings = this.rooms.reduce(
      (total, room) => total + room.occupiedCount, 0
    );

    from(this.rooms)
      .pipe(
        mergeMap(room => this.dashboardService.getRoomOccupants(room.roomId), 5),
        toArray()
      )
      .subscribe(allOccupants => {
        this.totalVacated = allOccupants.reduce((total, roomOccupants) => {
          return total + roomOccupants.filter((s: any) => s.isTemporary).length;
        }, 0);
      });
  }

  getVacantRoomsCount(): number {
    return this.rooms.filter(room => room.occupiedCount === 0).length;
  }

  getPartialRoomsCount(): number {
    return this.rooms.filter(room => 
      room.occupiedCount > 0 && room.occupiedCount < room.capacity
    ).length;
  }

  getFullRoomsCount(): number {
    return this.rooms.filter(room => room.occupiedCount === room.capacity).length;
  }

  getOccupancyClass(room: any): string {
    const occupancy = room.occupiedCount / room.capacity;
    if (occupancy === 0) return 'vacant';
    if (occupancy === 1) return 'full';
    return 'partial';
  }

  filterRooms() {
    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = room.roomNo.toLowerCase().includes(this.roomSearch.toLowerCase());
      
      if (this.currentRoomFilter === 'all') return matchesSearch;
      if (this.currentRoomFilter === 'vacant') return matchesSearch && room.occupiedCount === 0;
      if (this.currentRoomFilter === 'partial') {
        return matchesSearch && room.occupiedCount > 0 && room.occupiedCount < room.capacity;
      }
      if (this.currentRoomFilter === 'full') {
        return matchesSearch && room.occupiedCount === room.capacity;
      }
      
      return matchesSearch;
    });
  }

  setRoomFilter(filter: string) {
    this.currentRoomFilter = filter;
    this.filterRooms();
  }

  selectRoom(room: any) {
    if (this.selectedRoom?.roomId === room.roomId) {
      this.selectedRoom = null;
      this.occupants = [];
      this.filteredOccupants = [];
      return;
    }

    this.selectedRoom = room;
    this.dashboardService.getRoomOccupants(room.roomId)
      .subscribe(res => {
        this.occupants = res;
        this.filterOccupants();
      });
  }

  getStudentTooltip(student: any): string {
    return `
Name: ${student.fullName}
Phone: ${student.phone || 'Not provided'}
Email: ${student.email || 'Not provided'}
Course: ${student.course}
Room: ${student.roomNo || 'Not assigned'}
Status: ${student.isTemporary ? 'Temporary' : 'Permanent'}
Payment: ${student.paymentStatus || 'Unknown'}
    `.trim();
  }

  togglePendingFilter() {
    this.showPendingOnly = !this.showPendingOnly;
    this.filterOccupants();
  }

  filterOccupants() {
    if (this.showPendingOnly) {
      this.filteredOccupants = this.occupants.filter(student => 
        student.paymentStatus === 'Pending'
      );
    } else {
      this.filteredOccupants = this.occupants;
    }
  }

  viewRoomDetails(room: any) {
    console.log('View room details:', room);
  }

  assignStudentToRoom(room: any) {
    console.log('Assign student to room:', room);
  }

  // Student Methods
  calculateStudentMetrics() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    this.currentMonthAdmissions = this.students.filter(s => {
      const date = new Date(s.admissionDate);
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;

    this.maleCount = this.students.filter(s => s.gender === 'Male').length;
    this.femaleCount = this.students.filter(s => s.gender === 'Female').length;

    this.courseWiseCount = {};
    this.courses.forEach(course => {
      this.courseWiseCount[course] = this.students.filter(s => s.course === course).length;
    });

    this.inactiveStudents = this.students.filter(s => !s.isActive || !s.roomNo);
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(student =>
      student.fullName.toLowerCase().includes(this.studentSearch.toLowerCase()) ||
      student.course.toLowerCase().includes(this.studentSearch.toLowerCase()) ||
      student.phone?.toLowerCase().includes(this.studentSearch.toLowerCase())
    );
  }

  getStudentStatus(student: any): string {
    if (!student.isActive) return 'inactive';
    if (student.paymentStatus === 'Pending') return 'pending';
    return 'active';
  }

  currentMonthAddmission() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    this.filteredStudents = this.students.filter(s => {
      const date = new Date(s.admissionDate);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }

  GetStudentbygender(gender: string) {
    this.filteredStudents = this.students.filter(s => s.gender === gender);
  }

  GetStudentBycourse(courseName: string) {
    this.filteredStudents = this.students.filter(s => s.course === courseName);
  }

  showAllStudents() {
    this.filteredStudents = this.students;
  }

  viewStudent(student: any) {
    if (!student?.studentId) return;
    this.router.navigate(['pages/master/students/edit', student.studentId]);
  }

  viewStudentQuick(student: any) {
    if (!this.studentQuickView) {
      console.error('Student quick view template not found');
      return;
    }
    
    this.quickViewRef = this.dialogService.open(this.studentQuickView, {
      context: { student: student },
      hasScroll: false
    });
  }

  editStudent(student: any) {
    if (!student?.studentId) return;
    this.router.navigate(['pages/master/students/edit', student.studentId]);
  }

  viewStudentLedger(student: any) {
    if (!student?.studentId) return;
    this.router.navigate(['pages/master/students'], { 
      queryParams: { viewLedger: student.studentId } 
    });
  }

  makePayment(student: any) {
    console.log('Make payment for:', student);
    // Implement payment functionality here
    alert(`Make payment for ${student.fullName}`);
  }

  moveStudentRoom(student: any) {
    console.log('Move student room:', student);
    // Implement move room functionality here
    alert(`Move ${student.fullName} to different room`);
  }

  sendMessage(student: any) {
    console.log('Send message to:', student);
    // Implement message functionality here
    alert(`Send message to ${student.fullName}`);
  }

  // Payment Methods
  loadPayments(criteria: string) {
    this.dashboardService.getPayments(criteria).subscribe((res: any[]) => {
      this.payments = res;
      this.filteredPayments = res;
      
      // Calculate today's payments
      const today = new Date().toDateString();
      this.todayPaymentsCount = res.filter(p => 
        new Date(p.PaymentDate).toDateString() === today
      ).length;
      
      // Calculate this month's payments
      const now = new Date();
      this.monthPaymentsCount = res.filter(p => {
        const paymentDate = new Date(p.PaymentDate);
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      }).length;
      
      // Calculate pending payments
      this.pendingPaymentsCount = res.filter(p => p.Status === 'Pending').length;
      
      // Calculate total due amount
      this.totalDueAmount = res.reduce((sum, p) => sum + (p.DueAmount || 0), 0);
    });
  }

  filterPayments() {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = 
        payment.StudentName?.toLowerCase().includes(this.paymentSearch.toLowerCase()) ||
        payment.PaymentMode?.toLowerCase().includes(this.paymentSearch.toLowerCase());
      
      if (this.currentPaymentFilter === 'all') return matchesSearch;
      if (this.currentPaymentFilter === 'pending') return matchesSearch && payment.Status === 'Pending';
      if (this.currentPaymentFilter === 'completed') return matchesSearch && payment.Status === 'Completed';
      if (this.currentPaymentFilter === 'due') return matchesSearch && payment.DueAmount > 0;
      
      return matchesSearch;
    });
  }

  setPaymentFilter(filter: string) {
    this.currentPaymentFilter = filter;
    this.filterPayments();
  }

  getTodayAmount(): number {
    const today = new Date().toDateString();
    return this.payments
      .filter(p => new Date(p.PaymentDate).toDateString() === today)
      .reduce((sum, p) => sum + (p.TotalAmount || 0), 0);
  }

  getMonthAmount(): number {
    const now = new Date();
    return this.payments
      .filter(p => {
        const paymentDate = new Date(p.PaymentDate);
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + (p.TotalAmount || 0), 0);
  }

  getPendingAmount(): number {
    return this.payments
      .filter(p => p.Status === 'Pending')
      .reduce((sum, p) => sum + (p.TotalAmount || 0), 0);
  }

  getDuePaymentsCount(): number {
    return this.payments.filter(p => p.DueAmount > 0).length;
  }

  viewPayment(payment: any) {
    console.log('Viewing Payment:', payment);
    // Implement payment view functionality
    alert(`View payment details for ${payment.StudentName}`);
  }

  verifyPayment(payment: any) {
    console.log('Verifying Payment:', payment);
    // Implement payment verification
    alert(`Verify payment for ${payment.StudentName}`);
  }

  // UI Methods
  toggleSection(section: string) {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  scrollToSection(section: string) {
    const element = document.getElementById(section + '-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.collapsedSections[section] = false;
    }
  }

  openExportModal() {
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
  }

  handleExport(filters: any) {
    console.log('Export with filters:', filters);
    this.showExportModal = false;
    // Implement export functionality here
    alert('Export functionality would be implemented here');
  }

  filterRoomsByStatus(status: string) {
    this.setRoomFilter(status);
  }
}