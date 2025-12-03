import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService, Student } from '../../../layout/students/students.service';
import { RoomService, Room, RoomTariff } from '../../../layout/rooms/rooms.service';
import { BookingService, Booking } from '../booking.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-booking-form',
  templateUrl: './bookingforms.component.html'
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  students: Student[] = [];
  rooms: Room[] = [];        // filtered list used in dropdown
  allRooms: Room[] = [];     // full list from backend
  tariffs: RoomTariff[] = [];
  amount = 0;
  bookingId?: number;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      studentId: ['', Validators.required],
      roomId: ['', Validators.required],
      tariffPeriod: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      amount: [{ value: 0, disabled: true }]
    },{ validators: this.dateRangeValidator() });

    this.studentService.getAll().subscribe(res => (this.students = res));

    this.roomService.getAll().subscribe(res => {
      this.allRooms = res;

      // Default case: new booking => only available rooms
      this.rooms = res.filter(r => r.capacity > r.occupiedCount);

      // check for edit mode
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.bookingId = +id;
          this.loadBooking(this.bookingId);
        }
      });
    });

    this.bookingForm.get('roomId')!.valueChanges.subscribe(roomId => this.updateTariffs(roomId));
    this.bookingForm.get('tariffPeriod')!.valueChanges.subscribe(period => this.updateAmount(period));
  }


  private formatDateForInput(date: string | Date): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

   dateRangeValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const startDate = formGroup.get('startDate')?.value;
      const endDate = formGroup.get('endDate')?.value;
  
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        return { dateRangeInvalid: true };
      }
      return null;
    };
  }

  loadBooking(id: number) {
    this.bookingService.getById(id).subscribe(b => {
      this.amount = b.amount || 0;

      // Start with available rooms
      this.rooms = this.allRooms.filter(r => r.capacity > r.occupiedCount);

      // Add back the already booked room if it’s not in the list
      const bookedRoom = this.allRooms.find(r => r.id === b.roomId);
      if (bookedRoom && !this.rooms.some(r => r.id === bookedRoom.id)) {
        this.rooms = [...this.rooms, bookedRoom];
      }

      this.bookingForm.patchValue({
        studentId: b.studentId,
        roomId: b.roomId,
        tariffPeriod: b.tariffPeriod,
        startDate: this.formatDateForInput(b.startDate),
        endDate: this.formatDateForInput(b.endDate),
        amount: b.amount
      });

      this.updateTariffs(b.roomId);
    });
  }

  updateTariffs(roomId: number) {
    const room = this.allRooms.find(r => r.id === +roomId);
    this.tariffs = room?.tariffs || [];
    this.updateAmount(this.bookingForm.get('tariffPeriod')!.value);
  }

  updateAmount(period: string) {
    const tariff = this.tariffs.find(t => t.period === period);
    this.amount = tariff ? tariff.rate : 0;
    this.bookingForm.get('amount')!.setValue(this.amount);
  }

  save() {
    const booking: Booking = {
      ...this.bookingForm.getRawValue(),
      amount: this.amount
    };

    if (this.bookingId) {
      this.bookingService.update(this.bookingId, booking).subscribe(() => {
        this.router.navigate(['pages/transactions/bookings']);
      });
    } else {
      this.bookingService.add(booking).subscribe(() => {
        this.router.navigate(['pages/transactions/bookings']);
      });
    }
  }

  cancel() {
    this.router.navigate(['pages/transactions/bookings']);
  }
}
