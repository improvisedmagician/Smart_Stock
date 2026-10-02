import { Product } from '../entities/Product';

export interface ProductRepositoryPort {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(page: number, limit: number, search?: string): Promise<{ data: Product[], total: number }>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
