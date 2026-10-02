import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { PurchaseOrderRepositoryPort } from '../../../domain/ports/PurchaseOrderRepository.port';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';
import { AppError } from '../../../../../shared/errors/AppError';

export class CreatePurchaseOrderUseCase {
  constructor(private orderRepo: PurchaseOrderRepositoryPort) {}

  async execute(data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const hash = data.idempotencyHash ||
      createHash('sha256').update(data.productId + data.supplierId + Date.now()).digest('hex').substring(0, 64);

    const existing = await this.orderRepo.findByHash(hash);
    if (existing) return existing;

    const order: PurchaseOrder = {
      ...data,
      id: uuidv4(),
      idempotencyHash: hash,
      status: 'PENDENTE',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.orderRepo.save(order);
  }
}

