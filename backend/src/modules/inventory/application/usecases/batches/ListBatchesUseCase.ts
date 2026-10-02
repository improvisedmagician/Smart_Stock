import { BatchRepositoryPort } from '../../../domain/ports/BatchRepository.port';

export class ListBatchesUseCase {
  constructor(private batchRepo: BatchRepositoryPort) {}
  async execute(productId?: string) {
    return productId ? this.batchRepo.findByProductId(productId) : this.batchRepo.findAll();
  }
}
