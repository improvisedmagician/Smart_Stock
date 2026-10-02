import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';

export class DeleteProductUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  async execute(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404);
    
    try {
      await this.productRepo.delete(id);
    } catch (error: any) {
      if (error.message === 'FOREIGN_KEY_VIOLATION') {
        throw new AppError('Não é possível excluir este produto pois existem Lotes ou Ordens de Compra vinculados a ele.', 400);
      }
      throw error;
    }
  }
}
