import { SupplierRepositoryPort } from '../../../domain/ports/SupplierRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';

export class UpdateSupplierUseCase {
  constructor(private supplierRepo: SupplierRepositoryPort) {}
  async execute(id: string, data: Partial<any>) {
    const supplier = await this.supplierRepo.findById(id);
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404);
    const updated = { ...supplier, ...data, updatedAt: new Date() };
    return this.supplierRepo.save(updated);
  }
}

export class GetSupplierUseCase {
  constructor(private supplierRepo: SupplierRepositoryPort) {}
  async execute(id: string) {
    const supplier = await this.supplierRepo.findById(id);
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404);
    return supplier;
  }
}
