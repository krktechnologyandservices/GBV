// bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, Booking, VocationData } from '../booking/booking.service';
import { StudentService, Student } from '../../layout/students/students.service';
import { RoomService, Room } from '../../layout/rooms/rooms.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  students: Student[] = [];
  rooms: Room[] = [];
  searchQuery = '';
  temporaryAmount: number | null = null;
  // Vocation modal properties
  selectedBooking: Booking | null = null;
  selectedVocationType: 'Temporary' | 'Permanent' | null = null;
  vocationDate: string = '';
  returnDate: string = '';
  vocationReason: string = '';
  minDate: string ;
  showVocationModal = false;

  constructor(
    private bookingService: BookingService,
    private studentService: StudentService,
    private roomService: RoomService,
    private router: Router
  ) {


    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth()-2, 1);
    this.minDate = firstDay.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.studentService.getAll().subscribe(s => (this.students = s));
    this.roomService.getAll().subscribe(r => (this.rooms = r));
    this.bookingService.getAll().subscribe(b => {
      this.bookings = b;
      this.filteredBookings = b;
    });
  }

  getStudentName(id?: number) {
    if (!id) return 'Unknown Student';
    return this.students.find(s => s.studentId === id)?.fullName || 'Unknown Student';
  }

  getRoomNumber(id?: number) {
    if (!id) return 'Unknown Room';
    return this.rooms.find(r => r.id === id)?.roomNumber || 'Unknown Room';
  }

  search() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(
        b =>
          this.getStudentName(b.studentId).toLowerCase().includes(q) ||
          this.getRoomNumber(b.roomId).toLowerCase().includes(q) ||
          b.tariffPeriod.toLowerCase().includes(q) ||
          (b.status || '').toLowerCase().includes(q) ||
          (b.vocationReason || '').toLowerCase().includes(q)
      );
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.search();
  }

  addBooking() {
    this.router.navigate(['pages/transactions/bookings/add']);
  }

  editBooking(b: Booking) {
    this.router.navigate(['pages/transactions/bookings/edit', b.id]);
  }

  deleteBooking(b: Booking) {
    if (b.status === 'Billed') {
      alert('Booking cannot be deleted because bills are generated.');
      return;
    }
    if (confirm(`Delete booking for student ${this.getStudentName(b.studentId)}?`)) {
      this.bookingService.delete(b.id!).subscribe(() => this.loadData());
    }
  }

  // ------------------ VOCATION MODAL METHODS ------------------

  openVocationModal(booking: Booking) {
    this.selectedBooking = booking;
    this.vocationDate = booking.vocationDate ? new Date(booking.vocationDate).toISOString().substring(0, 10) : '';
    this.selectedVocationType = booking.vocationType as 'Temporary' | 'Permanent' || null;
    this.returnDate = booking.returnDate ? new Date(booking.returnDate).toISOString().substring(0, 10) : '';
    this.vocationReason = booking.vocationReason || '';
    this.showVocationModal = true;
    this.preventBodyScroll();
    this.temporaryAmount = booking.temporaryAmount || null; // Initialize temporary amount
  }

  closeVocationModal() {
    this.showVocationModal = false;
    this.restoreBodyScroll();
    this.resetVocationModal();
  }

  saveVocation() {
    if (!this.selectedBooking || !this.vocationDate || !this.selectedVocationType) {
      return;
    }

    // Validate vocation reason length
    if (this.vocationReason && this.vocationReason.length > 200) {
      alert('Vocation reason cannot exceed 200 characters.');
      return;
    }

    const vocationData: VocationData = {
      vocationDate: this.vocationDate,
      vocationType: this.selectedVocationType,
      returnDate: this.selectedVocationType === 'Temporary' ? this.returnDate : null,
      vocationReason: this.vocationReason || null,
      status: this.selectedVocationType === 'Permanent' ? 'Completed' : 'Vocate',
      temporaryAmount: this.selectedVocationType === 'Temporary' ? this.temporaryAmount : null // Add 
    };

    this.bookingService.updateVocation(this.selectedBooking.id!, vocationData).subscribe({
      next: () => {
        this.loadData();
        this.closeVocationModal();
        this.showSuccessNotification();
      },
      error: (error) => {
        console.error('Error updating vocation:', error);
        this.showErrorNotification();
      }
    });
  }

  private resetVocationModal() {
    this.selectedBooking = null;
    this.selectedVocationType = null;
    this.vocationDate = '';
    this.returnDate = '';
    this.vocationReason = '';
    this.temporaryAmount = null; 
  }

  // Method to prevent body scroll when modal opens
  private preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  // Method to restore body scroll when modal closes  
  private restoreBodyScroll() {
    document.body.style.overflow = '';
  }

  private showSuccessNotification() {
    const message = this.selectedVocationType === 'Temporary' 
      ? 'Temporary vocation updated successfully!' 
      : 'Permanent vocation processed successfully!';
    
    alert(message);
  }

  private showErrorNotification() {
    alert('Failed to update vocation. Please try again.');
  }

  // Helper method to truncate long text
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}