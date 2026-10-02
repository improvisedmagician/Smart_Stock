import { v4 as uuidv4 } from 'uuid';
import { BatchRepositoryPort } from '../../../domain/ports/BatchRepository.port';
import { Batch } from '../../../domain/entities/Batch';
import { logAudit } from '../../../../../shared/middleware/audit.middleware';

export class RegisterBatchUseCase {
  constructor(private batchRepo: BatchRepositoryPort) {}
  async execute(data: any, userId: string, userName: string) {
    const batch: Batch = {
      ...data,
      id: uuidv4(),
      currentQuantity: data.initialQuantity,
      status: 'DISPONIVEL',
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
