import { Injectable } from '@angular/core';
import { ColumnDef } from './report.models';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
 


  exportPDF(title: string, columns: any[], data: any[]) {
    // ✅ Step 1: Build the table header row
    const tableHeader = columns.map(col => ({
      text: col.header,
      bold: true,
      fillColor: '#eeeeee',
      noWrap: true
    }));
  
    // ✅ Step 2: Build the table body rows
    const tableBody = [
      tableHeader,
      ...data.map(row =>
        columns.map(col => ({
          text: row[col.field]?.toString() ?? '',
          noWrap: true
        }))
      )
    ];
  
    // ✅ Step 3: Create the PDF definition
    const docDefinition = {
      pageSize: { width: 1200, height: 842 }, // wider than A4
      pageOrientation: 'landscape',
      content: [
        { text: title, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: columns.map(() => 'auto'), // auto-size columns
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
    (pdfMake as any).vfs = (pdfFonts as any).vfs;
    (pdfMake as any).createPdf(docDefinition).open();
  }

  

  
  exportExcel(columns: any[], data: any[], fileName: string, title: string) {
    const exportData: any[] = [];
  
    // Add title row
    exportData.push({ [title]: '' });
  
    // Add header row (even if data is empty)
    const headerRow = columns.reduce((acc, col) => {
      acc[col.header] = col.header;
      return acc;
    }, {} as any);
    exportData.push(headerRow);
  
    // Add data rows (if any), otherwise empty placeholder row
    if (data.length > 0) {
      data.forEach(row => {
        const formatted = columns.reduce((acc, col) => {
          acc[col.header] = row[col.field];
          return acc;
        }, {} as any);
        exportData.push(formatted);
      });
    } else {
      // add a placeholder empty row under headers
      exportData.push(columns.reduce((acc, col) => {
        acc[col.header] = '';
        return acc;
      }, {} as any));
    }
  
    // Generate sheet and file
    const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
  
    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  }
  
  

  // exportExcel(columns: ColumnDef[], data: any[], fileName: string) {
  //   const sheet = data.map(row =>
  //     columns.reduce((acc, col) => ({ ...acc, [col.header]: row[col.field] }), {})
  //   );
  //   const worksheet = XLSX.utils.json_to_sheet(sheet);
  //   const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  //   const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
  //   FileSaver.saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  // }
}
