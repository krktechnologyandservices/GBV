import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { REPORT_CONFIGS } from '../../report.templates';
import { ReportService } from './report.service';
import { ExportService } from './export.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'ngx-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  config: any;
  filtersForm: FormGroup;
  reportDataFull: any[] = [];
  reportData: any[] = [];
  manualRowConfig = { position: 'bottom', numericValues: {}, textValues: {} };
  currentreport: string;
  loadingTemplate = false;
  reportApiUrl = environment.apiReportUrl;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private exportService: ExportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.filtersForm = this.fb.group({});
    this.route.params.subscribe(params => {
      this.currentreport = params['reportType'];
      this.config = REPORT_CONFIGS[this.currentreport];

      // Initialize filter controls
      const controls: any = {};
      this.config.filters.forEach(f => controls[f.name] = new FormControl([]));
      this.filtersForm = this.fb.group(controls);

      // Initialize manual row config
      this.config.columns.forEach(c => {
        if (c.type === 'number') this.manualRowConfig.numericValues[c.field] = '';
        else this.manualRowConfig.textValues[c.field] = '';
      });

      this.loadInitialData();
    });
  }

  loadInitialData() {
    const url = `${this.reportApiUrl}${this.config.apiUrl}/${this.currentreport}`;
    this.reportService.getData(url).subscribe((data: any[]) => {
      this.reportDataFull = data;

      this.config.filters.forEach(f => {
        if (f.type === 'select') {
          const distinctOptions = Array.from(new Set(data.map(r => r[f.name])))
            .filter(v => v != null)
            .map(v => ({ value: v, label: v }));
          f.options = [{ value: '', label: 'All' }, ...distinctOptions];
        }
      });

      this.applyFiltersAndManualRow();
    });
  }

  // 🔹 Combined Filter + Manual Row
  applyFiltersAndManualRow() {
    const filters = this.filtersForm.value;

    // Remove previous manual rows
    this.reportDataFull = this.reportDataFull.filter(r => !r.isManual);

    // Apply filters
    const filteredData = this.reportDataFull.filter(record => {
      return this.config.filters.every(f => {
        const selected: any[] = filters[f.name];
        if (!selected || selected.length === 0 || selected.includes('')) return true;
        return selected.includes(record[f.name]);
      });
    });

    // Generate manual row if enabled
    if (this.config.enableManualEntry) {
      const newRow: any = { isManual: true };
      this.config.columns.forEach(c => {
        if (c.type === 'number') {
          const val = this.manualRowConfig.numericValues[c.field];
          if (val === 'SUM') newRow[c.field] = this.computeSum(c.field, filteredData);
          else if (val === 'AVERAGE') newRow[c.field] = this.computeAverage(c.field, filteredData);
          else newRow[c.field] = parseFloat(val) || 0;
        } else {
          newRow[c.field] = this.manualRowConfig.textValues[c.field] || '';
        }
      });

      if (this.manualRowConfig.position === 'top') filteredData.unshift(newRow);
      else filteredData.push(newRow);
    }

    this.reportData = filteredData;
  }

  computeSum(field: string, data: any[]) {
    return data.reduce((sum, row) => sum + Number(row[field] || 0), 0);
  }

  computeAverage(field: string, data: any[]) {
    if (!data.length) return 0;
    return data.reduce((sum, row) => sum + Number(row[field] || 0), 0) / data.length;
  }

  saveTemplate() {
    const payload = {
      reportKey: this.currentreport,
      filters: this.filtersForm.value,
      manualRowsConfig: [this.manualRowConfig]
    };
    this.reportService.saveReportTemplate(payload).subscribe(() => alert('Template saved'));
  }

  exportToPDF() {
    if (!this.loadingTemplate) this.exportService.exportPDF(this.config.title, this.config.columns, this.reportData);
  }

  exportToExcel() {
    if (!this.loadingTemplate) this.exportService.exportExcel(this.config.columns, this.reportData, this.config.title, this.config.title);
  }
}
