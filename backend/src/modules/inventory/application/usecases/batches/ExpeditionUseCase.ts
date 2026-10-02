import { BatchRepositoryPort } from '../../../domain/ports/BatchRepository.port';
import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';
import { FEFOService } from '../../../domain/services/FEFOService';
import { logAudit } from '../../../../../shared/middleware/audit.middleware';
import { AppError } from '../../../../../shared/errors/AppError';

export class ExpeditionUseCase {
  constructor(
    private batchRepo: BatchRepositoryPort,
    private productRepo: ProductRepositoryPort
  ) {}

  async execute(productId: string, quantity: number, userId: string, userName: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new AppError('Produto não encontrado', 404);

    const batches = await this.batchRepo.findByProductId(productId);
    const allocations = FEFOService.allocate(batches, quantity);

    for (const alloc of allocations) {
      const batch = batches.find(b => b.id === alloc.batchId)!;
      batch.currentQuantity -= alloc.quantityToPick;
      if (batch.currentQuantity === 0) batch.status = 'ESGOTADO';
      batch.updatedAt = new Date();
    }

    await this.batchRepo.saveMany(batches);

    await logAudit({
      userId, userName, action: 'EXPEDITION', entityType: 'Product',
      entityId: productId, newValue: allocations
    });

    // Stock alert logic would go here typically, but is instructed in CheckSafetyStockUseCase

    return { allocations, totalPicked: quantity };
  }
}
