import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';

export class UpdateProductUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  async execute(id: string, data: Partial<any>) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404);
    const updated = { ...product, ...data, updatedAt: new Date() };
    return this.productRepo.save(updated);
  }
}
