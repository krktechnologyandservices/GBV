import { Component, OnInit, ViewChild, ElementRef, HostListener, TemplateRef } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { EmployeeService, EmployeeListItem } from './employee-new.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-employee-new',
  templateUrl: './employee-new.component.html',
  styleUrls: ['./employee-new.component.scss']
})
export class EmployeeNewComponent implements OnInit {
  @ViewChild('scrollTop') scrollTopRef!: ElementRef;
  @ViewChild('tableWrapper') tableWrapperRef!: ElementRef;

  // Data
  employees: EmployeeListItem[] = [];
  filteredEmployees: EmployeeListItem[] = [];
  selectedEmployee: EmployeeListItem | null = null;
  
  // Stats
  activeCount: number = 0;
  inactiveCount: number = 0;
  
  // Search and Filters
  searchTerm: string = '';
  statusFilter: string = '';
  showAdvancedFilters: boolean = false;
  
  // UI State
  loading: boolean = true;
  viewMode: 'list' | 'grid' | 'compact' = 'list';
  
  // Sorting
  sortColumn: string = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 1;
  
  // Colors for avatars
  avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
  ];
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private service: EmployeeService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit() {
    this.load();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
    
    // Auto-detect mobile
    this.detectDevice();
    
    // Add vibration feedback for mobile
    this.setupMobileFeedback();
  }

  ngAfterViewInit() {
    this.setupSmoothScrolling();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====================
  // CORE METHODS
  // ====================

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.employees = data.map(emp => ({
          employeeId: emp.employeeId!,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          emailId: emp.emailId,
          activeStatus: emp.activeStatus
        }));
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
        this.calculatePagination();
        
        // Show welcome toast
        if (this.employees.length > 0) {
          this.showToast('success', 'Employees loaded successfully!', `Loaded ${this.employees.length} employees`);
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
        this.showToast('danger', 'Failed to load employees', 'Please check your connection');
      }
    });
  }

  refresh() {
    this.service.clearCache();
    this.load();
    this.showToast('primary', 'Refreshing...', 'Fetching latest data');
  }

  delete(id: number) {
    const employee = this.employees.find(e => e.employeeId === id);
    if (!employee) return;
    
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.refresh();
          this.showToast('success', 'Employee deleted', `${employee.firstName} has been removed`);
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.showToast('danger', 'Delete failed', 'Please try again');
        }
      });
    }
  }

  trackByEmployeeId(index: number, emp: EmployeeListItem): number {
    return emp.employeeId;
  }

  // ====================
  // FILTER & SEARCH
  // ====================

  onSearchChange(searchText: string) {
    this.searchSubject.next(searchText);
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
    this.vibrate(50); // Tactile feedback
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    this.vibrate(30);
  }

  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortColumn = 'firstName';
    this.sortDirection = 'asc';
    this.applyFilters();
    this.showToast('basic', 'Filters reset', 'All filters have been cleared');
    this.vibrate(50);
  }

  applyFilters() {
    let filtered = [...this.employees];
    
    // Apply search filter
    if (this.searchTerm) {
      const lower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.employeeCode.toLowerCase().includes(lower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lower) ||
        emp.emailId.toLowerCase().includes(lower)
      );
    }
    
    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(emp => emp.activeStatus);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(emp => !emp.activeStatus);
    }
    
    // Apply sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (this.sortColumn) {
          case 'employeeCode':
            aValue = a.employeeCode;
            bValue = b.employeeCode;
            break;
          case 'firstName':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'activeStatus':
            aValue = a.activeStatus;
            bValue = b.activeStatus;
            break;
          default:
            return 0;
        }
        
        if (typeof aValue === 'boolean') {
          return this.sortDirection === 'asc' 
            ? (aValue === bValue ? 0 : aValue ? -1 : 1)
            : (aValue === bValue ? 0 : aValue ? 1 : -1);
        }
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    
    // Apply pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredEmployees = filtered.slice(start, end);
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
    this.vibrate(30);
  }

  // ====================
  // STATS & CALCULATIONS
  // ====================

  calculateStats() {
    this.activeCount = this.employees.filter(e => e.activeStatus).length;
    this.inactiveCount = this.employees.length - this.activeCount;
  }

  getAvatarColor(employee: EmployeeListItem): string {
    const index = employee.employeeId % this.avatarColors.length;
    return this.avatarColors[index];
  }

  // ====================
  // PAGINATION
  // ====================

  calculatePagination() {
    const totalItems = this.employees.length;
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = end - maxVisible + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
      this.vibrate(30);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
      this.vibrate(30);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
      this.vibrate(30);
    }
  }

  // ====================
  // ACTIONS & EVENTS
  // ====================

  viewEmployeeDetails(employee: EmployeeListItem) {
    this.selectedEmployee = employee;
    // Open dialog or navigate
    console.log('View details:', employee);
    this.showToast('info', 'Viewing details', `${employee.firstName} ${employee.lastName}`);
  }

  editEmployee(employee: EmployeeListItem) {
    // Navigation handled by routerLink
    this.showToast('info', 'Editing employee', `Editing ${employee.firstName}`);
  }

  toggleEmployeeStatus(employee: EmployeeListItem) {
    const newStatus = !employee.activeStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${employee.firstName}?`)) {
      // Call your API to update status
      this.showToast('warning', 'Status updated', `${employee.firstName} is now ${newStatus ? 'active' : 'inactive'}`);
    }
  }

  sendEmail(email: string | undefined) {
    if (email) {
      window.location.href = `mailto:${email}`;
      this.showToast('success', 'Email client opened', `Ready to email ${email}`);
    }
  }

  exportData() {
    // Implement export functionality
    this.showToast('primary', 'Exporting data', 'Preparing employee data for export');
  }

  // ====================
  // UI & UX ENHANCEMENTS
  // ====================

  private detectDevice() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.viewMode = 'compact';
      this.itemsPerPage = 10;
    }
  }

  private setupSmoothScrolling() {
    if ('scrollBehavior' in document.documentElement.style) {
      const table = this.tableWrapperRef?.nativeElement;
      if (table) {
        table.style.scrollBehavior = 'smooth';
      }
    }
  }

  private setupMobileFeedback() {
    if ('vibrate' in navigator) {
      // Enable haptic feedback
    }
  }

  private vibrate(duration: number) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  private showToast(status: any, title: string, message: string) {
    this.toastrService.show(message, title, { status, duration: 3000 });
  }

  syncScroll(event: any) {
    const scrollTopEl = this.scrollTopRef?.nativeElement;
    const tableWrapperEl = this.tableWrapperRef?.nativeElement;
    
    if (!scrollTopEl || !tableWrapperEl) return;
    
    if (event.target === scrollTopEl) {
      tableWrapperEl.scrollLeft = scrollTopEl.scrollLeft;
    } else {
      scrollTopEl.scrollLeft = tableWrapperEl.scrollLeft;
    }
  }

  // ====================
  // EVENT LISTENERS
  // ====================

  @HostListener('window:resize')
  onResize() {
    this.detectDevice();
    this.calculatePagination();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    setTimeout(() => {
      this.detectDevice();
      this.applyFilters();
    }, 300);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          const searchInput = document.querySelector('.search-input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        case 'r':
          if (!event.shiftKey) {
            event.preventDefault();
            this.refresh();
          }
          break;
        case 'n':
          event.preventDefault();
          // Navigate to create employee
          break;
      }
    }
  }

  // Touch gesture support
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // Store touch start for gesture detection
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    // Handle touch gestures
  }

  // Performance optimization for mobile
  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    // Prevent default only during scroll
    if (event.target === this.tableWrapperRef?.nativeElement) {
      event.preventDefault();
    }
  }
}