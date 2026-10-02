import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';

export class GetProductUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  async execute(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404);
    return product;
  }
}
