export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  initialQuantity: number;
  currentQuantity: number;
  status: 'DISPONIVEL' | 'ESGOTADO' | 'VENCIDO' | 'QUARENTENA';
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: Date;
  quantityToPick: number;
}
