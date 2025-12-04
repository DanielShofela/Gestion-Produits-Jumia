export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  commissionPercent: number;
  weightVolume: string;
  variation: string;
  shortDesc: string;
  longDesc: string;
  // Calculated fields are derived at runtime or saved for export convenience
  createdAt: number;
}

export interface ProductStats {
  totalProducts: number;
  totalRevenuePotential: number;
  averageMarginPercent: number;
  totalNetMargin: number;
}

export interface CalculatedFields {
  commissionAmount: number;
  amountReceived: number;
  netMargin: number;
  marginPercent: number;
}