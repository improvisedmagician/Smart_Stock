import { v4 as uuidv4 } from 'uuid';
import { BatchRepositoryPort } from '../../../domain/ports/BatchRepository.port';
import { Batch } from '../../../domain/entities/Batch';
import { logAudit } from '../../../../../shared/middleware/audit.middleware';

export class RegisterBatchUseCase {
  private readonly QUARANTINE_THRESHOLD_DAYS = 15;
  private readonly MS_IN_A_DAY = 1000 * 60 * 60 * 24;

  constructor(private batchRepo: BatchRepositoryPort) {}

  async execute(data: any, userId: string, userName: string) {
    const status = this.determineInitialStatus(new Date(data.expiryDate));

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

  private determineInitialStatus(expiryDate: Date): string {
    const timeUntilExpiry = expiryDate.getTime() - Date.now();
    const daysUntilExpiry = Math.ceil(timeUntilExpiry / this.MS_IN_A_DAY);
    
    return daysUntilExpiry <= this.QUARANTINE_THRESHOLD_DAYS ? 'QUARENTENA' : 'DISPONIVEL';
  }
}
