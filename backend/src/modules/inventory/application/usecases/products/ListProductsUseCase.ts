import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';

export class ListProductsUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  async execute(page: number, limit: number, search?: string) {
    return this.productRepo.findAll(page, limit, search);
  }
}
