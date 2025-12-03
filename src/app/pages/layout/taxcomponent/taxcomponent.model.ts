
export interface TaxCategory {
  id: number;
  categoryName: string;
  sectionCode: string;
  description: string;
  isActive: boolean;
}

export interface TaxComponent {
  id: number;
  componentName: string;
  taxCategoryId: number;
  calculationType: string;
  isDeduction: boolean;
  hasMaximumLimit: boolean;
  maximumLimit?: number;
  isSectionBased: boolean;
  sectionCode?: string;
  proofRequired: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface TaxComponentDto extends TaxComponent {
  taxCategoryName: string;
  categorySectionCode: string;
}