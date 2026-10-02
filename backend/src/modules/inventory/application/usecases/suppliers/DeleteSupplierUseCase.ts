import { SupplierRepositoryPort } from '../../../domain/ports/SupplierRepository.port';
import { AppError } from '../../../../../shared/errors/AppError';

export class DeleteSupplierUseCase {
  constructor(private supplierRepo: SupplierRepositoryPort) {}
  async execute(id: string) {
    const supplier = await this.supplierRepo.findById(id);
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404);
    
    try {
      await this.supplierRepo.delete(id);
    } catch (error: any) {
      if (error.message === 'FOREIGN_KEY_VIOLATION') {
        throw new AppError('Não é possível excluir este fornecedor pois existem produtos vinculados a ele.', 400);
      }
      throw error;
    }
  }
}
