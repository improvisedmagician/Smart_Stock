export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  safetyStock: number;
  supplierId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
