import { Component, OnInit } from '@angular/core';
import { OrgAttributesService, OrgAttributeDefinition, OrgAttributeDropdownValue } from './org-attributes.service';
import { NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';

@Component({
  selector: 'ngx-org-attributes',
  templateUrl: './org-attributes.component.html',
  styleUrls: ['./org-attributes.component.scss']
})
export class OrgAttributesComponent implements OnInit {
  attributes: OrgAttributeDefinition[] = [];
  filteredAttributes: OrgAttributeDefinition[] = [];
  selectedAttribute: OrgAttributeDefinition | null = null;
  dropdownValues: OrgAttributeDropdownValue[] = [];
  dataTypes = ['Text', 'Number', 'Date', 'Dropdown', 'Boolean'];
  
  // Form data (keeping your existing structure)
  newAttribute: OrgAttributeDefinition = {
    attributeName: '',
    dataType: 'Text',
    isRequired: false,
    isUnique: false,
  };

  newDropdownValue: string = '';
  isLoading: boolean = false;
  
  // Mobile state
  isMobileView: boolean = false;
  showForm: boolean = true;
  showDropdownSection: boolean = false;
  
  // Search & Filter
  searchTerm: string = '';
  typeFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  private toastPosition = NbGlobalPhysicalPosition.TOP_RIGHT;

  constructor(
    private attributeService: OrgAttributesService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
    
    this.loadAttributes();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkViewport());
  }

  checkViewport(): void {
    this.isMobileView = window.innerWidth < 768;
    if (this.isMobileView) {
      this.showForm = false;
      this.showDropdownSection = false;
    } else {
      this.showForm = true;
    }
  }

  loadAttributes(): void {
    this.isLoading = true;
    this.attributeService.getAttributes().subscribe({
      next: (data) => {
        this.attributes = data;
        this.filteredAttributes = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.showToast('Failed to load attributes', 'Error', 'danger');
        this.isLoading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm && this.typeFilter === 'all') {
      this.filteredAttributes = [...this.attributes];
      return;
    }
    
    let filtered = [...this.attributes];
    
    // Apply type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(attr => attr.dataType === this.typeFilter);
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(attr => 
        attr.attributeName.toLowerCase().includes(term) ||
        attr.dataType.toLowerCase().includes(term)
      );
    }
    
    this.filteredAttributes = filtered;
    this.currentPage = 1;
  }

  createAttribute(): void {
    if (!this.newAttribute.attributeName.trim()) {
      this.showToast('Attribute name is required', 'Validation Error', 'warning');
      return;
    }

    this.isLoading = true;
    this.attributeService.createAttribute(this.newAttribute).subscribe({
      next: () => {
        this.showToast('Attribute created successfully', 'Success', 'success');
        this.resetAttributeForm();
        this.loadAttributes();
        this.isLoading = false;
        
        if (this.isMobileView) {
          this.showForm = false;
        }
      },
      error: () => {
        this.showToast('Failed to create attribute', 'Error', 'danger');
        this.isLoading = false;
      }
    });
  }

  deleteAttribute(id: number, event?: Event): void {
    event?.stopPropagation();

    if (confirm('Are you sure you want to delete this attribute?')) {
      this.isLoading = true;
      this.attributeService.deleteAttribute(id).subscribe({
        next: () => {
          this.showToast('Attribute deleted', 'Success', 'success');
          if (this.selectedAttribute?.id === id) {
            this.selectedAttribute = null;
            this.dropdownValues = [];
            this.showDropdownSection = false;
          }
          this.loadAttributes();
          this.isLoading = false;
        },
        error: () => {
          this.showToast('Failed to delete attribute', 'Error', 'danger');
          this.isLoading = false;
        }
      });
    }
  }

  onSelectAttribute(attribute: OrgAttributeDefinition): void {
    this.selectedAttribute = attribute;

    if (attribute.dataType === 'Dropdown') {
      this.loadDropdownValues(attribute.id!);
      if (this.isMobileView) {
        this.showDropdownSection = true;
      }
    } else {
      this.dropdownValues = [];
      if (this.isMobileView) {
        this.showDropdownSection = false;
      }
    }
  }

  loadDropdownValues(attributeId: number): void {
    this.isLoading = true;
    this.attributeService.getDropdownValues(attributeId).subscribe({
      next: (values) => {
        this.dropdownValues = values;
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Failed to load dropdown values', 'Error', 'danger');
        this.isLoading = false;
      }
    });
  }

  addDropdownValue(): void {
    if (!this.newDropdownValue.trim()) {
      this.showToast('Dropdown value cannot be empty', 'Validation Error', 'warning');
      return;
    }

    if (!this.selectedAttribute) return;

    this.isLoading = true;
    const value = {
      attributeId: this.selectedAttribute.id!,
      Value: this.newDropdownValue.trim(),
    };

    this.attributeService.addDropdownValue(value).subscribe({
      next: () => {
        this.showToast('Dropdown value added', 'Success', 'success');
        this.newDropdownValue = '';
        this.loadDropdownValues(this.selectedAttribute!.id!);
        this.isLoading = false;
      },
      error: () => {
        this.showToast('Failed to add dropdown value', 'Error', 'danger');
        this.isLoading = false;
      }
    });
  }

  deleteDropdownValue(id: number, event?: Event): void {
    event?.stopPropagation();

    if (confirm('Are you sure you want to delete this dropdown value?')) {
      this.isLoading = true;
      this.attributeService.deleteDropdownValue(id).subscribe({
        next: () => {
          this.showToast('Dropdown value deleted', 'Success', 'success');
          if (this.selectedAttribute) {
            this.loadDropdownValues(this.selectedAttribute.id!);
          }
          this.isLoading = false;
        },
        error: () => {
          this.showToast('Failed to delete dropdown value', 'Error', 'danger');
          this.isLoading = false;
        }
      });
    }
  }

  resetAttributeForm(): void {
    this.newAttribute = {
      attributeName: '',
      dataType: 'Text',
      isRequired: false,
      isUnique: false,
    };
    this.newDropdownValue = '';
  }

  getPageItems(): OrgAttributeDefinition[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAttributes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getDataTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Text': 'text-outline',
      'Number': 'hash-outline',
      'Date': 'calendar-outline',
      'Dropdown': 'list-outline',
      'Boolean': 'checkmark-circle-outline'
    };
    return icons[type] || 'question-mark-outline';
  }

  showToast(message: string, title: string, status: 'success' | 'warning' | 'danger'): void {
    this.toastr.show(message, title, {
      status,
      position: this.toastPosition,
      duration: 3000,
    });
  }
}