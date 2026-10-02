import { v4 as uuidv4 } from 'uuid';
import { SupplierRepositoryPort } from '../../../domain/ports/SupplierRepository.port';
import { Supplier } from '../../../domain/entities/Supplier';

export class CreateSupplierUseCase {
  constructor(private supplierRepo: SupplierRepositoryPort) {}
  async execute(data: Omit<Supplier, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    const supplier: Supplier = {
      ...data,
      id: uuidv4(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.supplierRepo.save(supplier);
  }
}
