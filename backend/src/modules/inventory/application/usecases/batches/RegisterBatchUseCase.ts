import { v4 as uuidv4 } from 'uuid';
import { BatchRepositoryPort } from '../../../domain/ports/BatchRepository.port';
import { Batch } from '../../../domain/entities/Batch';
import { logAudit } from '../../../../../shared/middleware/audit.middleware';

export class RegisterBatchUseCase {
  constructor(private batchRepo: BatchRepositoryPort) {}
  async execute(data: any, userId: string, userName: string) {
    const manufactureDate = new Date(data.manufactureDate);
    const expiryDate = new Date(data.expiryDate);
    
    // Calcula a diferena em dias
    const diffTime = expiryDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Novo requisito: status inicial QUARENTENA se validade <= 15 dias da data atual
    const status = diffDays <= 15 ? 'QUARENTENA' : 'DISPONIVEL';

    const batch: Batch = {
      ...data,
      id: uuidv4(),
      currentQuantity: data.initialQuantity,
      status: status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const saved = await this.batchRepo.save(batch);
    
    await logAudit({
      userId, userName, action: 'REGISTER_BATCH', entityType: 'Batch',
      entityId: saved.id, newValue: saved
    });
    return saved;
  }
}
