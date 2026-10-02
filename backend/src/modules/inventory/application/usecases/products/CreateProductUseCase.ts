import { v4 as uuidv4 } from 'uuid';
import { ProductRepositoryPort } from '../../../domain/ports/ProductRepository.port';
import { Product } from '../../../domain/entities/Product';

export class CreateProductUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  async execute(data: Omit<Product, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    const product: Product = {
      ...data,
      id: uuidv4(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.productRepo.save(product);
  }
}
