import { PurchaseOrder } from '../entities/PurchaseOrder';

export interface PurchaseOrderRepositoryPort {
  findById(id: string): Promise<PurchaseOrder | null>;
  findAll(page: number, status?: string): Promise<{ data: PurchaseOrder[], total: number }>;
  save(order: PurchaseOrder): Promise<PurchaseOrder>;
  findByHash(hash: string): Promise<PurchaseOrder | null>;
}
