import { Supplier } from '../entities/Supplier';

export interface SupplierRepositoryPort {
  findById(id: string): Promise<Supplier | null>;
  findAll(page: number, limit: number): Promise<{ data: Supplier[], total: number }>;
  save(supplier: Supplier): Promise<Supplier>;
  delete(id: string): Promise<void>;
}
