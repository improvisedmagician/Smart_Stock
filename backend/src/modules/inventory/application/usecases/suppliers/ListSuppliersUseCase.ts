import { SupplierRepositoryPort } from '../../../domain/ports/SupplierRepository.port';

export class ListSuppliersUseCase {
  constructor(private supplierRepo: SupplierRepositoryPort) {}
  async execute(page: number, limit: number) {
    return this.supplierRepo.findAll(page, limit);
  }
}
