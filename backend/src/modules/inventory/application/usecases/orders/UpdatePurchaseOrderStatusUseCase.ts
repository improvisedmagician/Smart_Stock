import { PurchaseOrderRepositoryPort } from '../../../domain/ports/PurchaseOrderRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';

export class UpdatePurchaseOrderStatusUseCase {
  constructor(private orderRepo: PurchaseOrderRepositoryPort) {}

  async execute(id: string, status: PurchaseOrder['status']) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new AppError('Ordem de compra não encontrada', 404);
    }

    const updated = {
      ...order,
      status,
      updatedAt: new Date()
    };

    return this.orderRepo.save(updated);
  }
}
