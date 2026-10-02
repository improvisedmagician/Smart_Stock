export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OPERADOR' | 'GERENTE';
}

export interface Supplier {
  id: string;
  cnpj: string;
  companyName: string;
  tradeName?: string;
  leadTimeDays: number;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  safetyStock: number;
  supplierId?: string;
  supplierName?: string;
  active: boolean;
  currentStock?: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  productName?: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  initialQuantity: number;
  currentQuantity: number;
  status: 'DISPONIVEL' | 'VENCIDO' | 'ESGOTADO';
  createdAt: string;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantityToPick: number;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA' | 'FALHA';
  triggeredBy: 'SISTEMA' | 'MANUAL';
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSuppliers: number;
  pendingOrders: number;
  stockAlerts: number;
  expiringBatches: ExpiringBatch[];
  stockByCategory: CategoryStock[];
  expeditionTrend: ExpeditionTrend[];
  lowStockProducts: LowStockProduct[];
}

export interface ExpiringBatch {
  productName: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  daysUntilExpiry: number;
}

export interface CategoryStock {
  category: string;
  totalQuantity: number;
}

export interface ExpeditionTrend {
  date: string;
  count: number;
}

export interface LowStockProduct {
  productName: string;
  sku: string;
  currentStock: number;
  safetyStock: number;
  percentage: number;
}