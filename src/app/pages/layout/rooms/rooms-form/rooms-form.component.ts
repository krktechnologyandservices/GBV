import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RoomService, Room, RoomTariff } from '../rooms.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room-form',
  templateUrl: './rooms-form.component.html'
})
export class RoomFormComponent implements OnInit {
  roomForm!: FormGroup;
  roomId?: number;
  isEdit = false;
  //periods = ['Monthly', 'Quarterly', 'HalfYearly', 'Yearly'];
   periods = ['Monthly',  'Yearly','Guest'];
  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params['id'];
    this.isEdit = !!this.roomId;

    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      tariffs: this.fb.array([])
    });

    if (this.isEdit && this.roomId) {
      this.roomService.get(this.roomId).subscribe(room => {
        this.roomForm.patchValue({
          roomNumber: room.roomNumber,
          capacity: room.capacity
        });
        this.setTariffs(room.tariffs);
      });
    } else {
      this.setTariffs(); // default empty tariffs
    }
  }

  // FormArray for tariffs
  get tariffs(): FormArray {
    return this.roomForm.get('tariffs') as FormArray;
  }

  setTariffs(existingTariffs?: RoomTariff[]) {
    this.tariffs.clear();
    this.periods.forEach(period => {
      const tariff = existingTariffs?.find(t => t.period === period);
      this.tariffs.push(this.fb.group({
        period: [period],
        rate: [tariff?.rate || 0, Validators.required]
      }));
    });
  }

  save() {
    const room: Room = this.roomForm.value;
    if (this.isEdit && this.roomId) {
      this.roomService.update(this.roomId, room).subscribe(() => this.router.navigate(['pages/master/rooms']));
    } else {
      this.roomService.add(room).subscribe(() => this.router.navigate(['pages/master/rooms']));
    }
  }

  cancel() {
    this.router.navigate(['pages/master/rooms']);
  }
}
