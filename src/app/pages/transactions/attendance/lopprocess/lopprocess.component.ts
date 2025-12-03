import { Component } from '@angular/core';
import { LopService } from './lop.service';
import { PayPeriodService, PayPeriod } from './payperiod.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-lop-processor',
  templateUrl: './lopprocess.component.html',
})
export class LopProcessorComponent {
  payPeriods: PayPeriod[] = [];
  selectedPeriodId: number | null = null;
  result: LopResult | null = null;
  loading = false;

  constructor(
    private lopService: LopService,
    private payPeriodService: PayPeriodService
  ) {}

  ngOnInit() {
    this.payPeriodService.getAll().subscribe(p => (this.payPeriods = p));
  }

  process() {
    if (!this.selectedPeriodId) return;
  
    const period = this.payPeriods.find(p => p.id === this.selectedPeriodId);
    if (!period) return;
  
    const year = new Date(period.attendanceFrom).getFullYear();
    const month = new Date(period.attendanceFrom).getMonth() + 1;
  
    this.loading = true;
    this.lopService.processPeriod(year, month).subscribe(res => {
      this.result = res;
      this.result.summaries.forEach(s => {
        s.manualCorrection = s.correctedLopDays ?? s.calculatedLopDays;
      });
      this.loading = false;
    });
  }
  exportToExcel() {
    if (!this.result || !this.result.summaries.length) return;
  
    const exportData = this.result.summaries.map(s => ({
      'Employee ID': s.employeeId,
      'Calculated LOP': s.calculatedLopDays,

      'Manual Correction (UI Edited)': s.manualCorrection ?? ''
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'LOP Summary': worksheet }, SheetNames: ['LOP Summary'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const filename = `LOP_Summary_${this.result.year}_${this.result.month}.xlsx`;
    saveAs(blob, filename);
  }
  

  saveManualCorrections() {
    if (!this.result || !this.selectedPeriodId) return;

    const corrections = this.result.summaries.map(s => ({
      employeeId: s.employeeId,
      calculatedLopDays:s.calculatedLopDays,
      CorrectedLopDays: s.manualCorrection,
      Year:this.result.year,
      month:this.result.month
  
    }));

    this.lopService.saveCorrections(this.selectedPeriodId, corrections).subscribe({
      next: () => alert('Manual corrections saved successfully.'),
      error: () => alert('Failed to save manual corrections.')
    });
  }
}

export interface LopSummary {
  employeeId: number;
  calculatedLopDays: number;
  correctedLopDays: number;
  manualCorrection?: number; // bound to UI input
}

export interface LopResult {
  year: number;
  month: number;
  totalDays: number;
  summaries: LopSummary[];
}