import { PurchaseOrderRepositoryPort } from '../../../domain/ports/PurchaseOrderRepository.port';

export class ListPurchaseOrdersUseCase {
  constructor(private orderRepo: PurchaseOrderRepositoryPort) {}

  async execute(page: number, status?: string) {
    return this.orderRepo.findAll(page, status);
  }
}
