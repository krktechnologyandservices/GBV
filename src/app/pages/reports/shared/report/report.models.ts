export interface ReportConfig {
    apiUrl: string;
    filters: FilterField[];
    columns: ColumnDef[];
    title: string;
    enableManualEntry: boolean; 
    maxManualRows?:number
  }
  
  export interface FilterField {
    label: string;
    name: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: { label: string, value: any }[];
  }
  
  export interface ColumnDef {
    field: string;
    header: string;
    type:string;
  }
  