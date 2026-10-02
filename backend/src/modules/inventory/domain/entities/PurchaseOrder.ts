export interface PurchaseOrder {
  id: string;
  productId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  idempotencyHash: string;
  status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA' | 'FALHA';
  triggeredBy: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
