import { AppError } from '../../../../shared/errors/AppError';
import { Batch, BatchAllocation } from '../entities/Batch';

export class FEFOService {
  /**
   * Given a product ID and requested quantity, determine which batches to pick
   * following FEFO (First-Expired-First-Out) rule.
   * 
   * INVARIANTS:
   * 1. Batches MUST be sorted by expiry_date ASC (earliest first)
   * 2. Expired batches (expiry_date < today) MUST be skipped/blocked
   * 3. Only DISPONIVEL batches are considered
   * 4. Returns an array of { batchId, batchNumber, expiryDate, quantityToPick }
   * 5. Throws error if total available < requested quantity
   */
  static allocate(batches: Batch[], requestedQuantity: number): BatchAllocation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter: only available, non-expired batches
    const validBatches = batches
      .filter(b => b.status === 'DISPONIVEL' && new Date(b.expiryDate) >= today)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    
    const totalAvailable = validBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    if (totalAvailable < requestedQuantity) {
      throw new AppError('Estoque insuficiente. Disponível: ' + totalAvailable, 400);
    }
    
    const allocations: BatchAllocation[] = [];
    let remaining = requestedQuantity;
    
    for (const batch of validBatches) {
      if (remaining <= 0) break;
      const pick = Math.min(batch.currentQuantity, remaining);
      allocations.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantityToPick: pick
      });
      remaining -= pick;
    }
    
    return allocations;
  }
}
