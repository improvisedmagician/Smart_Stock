import { FEFOService } from '../src/modules/inventory/domain/services/FEFOService';
import { Batch } from '../src/modules/inventory/domain/entities/Batch';
import { AppError } from '../src/shared/errors/AppError';

describe('FEFOService', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  const furtherFutureDate = new Date();
  furtherFutureDate.setDate(furtherFutureDate.getDate() + 60);
  
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);

  const baseBatch: Omit<Batch, 'id' | 'batchNumber' | 'expiryDate' | 'currentQuantity' | 'status'> = {
    productId: 'prod1',
    manufactureDate: new Date(),
    initialQuantity: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('Should allocate from earliest expiry batch first', () => {
    const batches: Batch[] = [
      { ...baseBatch, id: 'b1', batchNumber: 'B1', expiryDate: furtherFutureDate, currentQuantity: 10, status: 'DISPONIVEL' },
      { ...baseBatch, id: 'b2', batchNumber: 'B2', expiryDate: futureDate, currentQuantity: 10, status: 'DISPONIVEL' }
    ];

    const allocations = FEFOService.allocate(batches, 5);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].batchId).toBe('b2');
    expect(allocations[0].quantityToPick).toBe(5);
  });

  it('Should skip expired batches', () => {
    const batches: Batch[] = [
      { ...baseBatch, id: 'b1', batchNumber: 'B1', expiryDate: pastDate, currentQuantity: 10, status: 'DISPONIVEL' },
      { ...baseBatch, id: 'b2', batchNumber: 'B2', expiryDate: futureDate, currentQuantity: 10, status: 'DISPONIVEL' }
    ];

    const allocations = FEFOService.allocate(batches, 5);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].batchId).toBe('b2');
  });

  it('Should throw when insufficient stock', () => {
    const batches: Batch[] = [
      { ...baseBatch, id: 'b1', batchNumber: 'B1', expiryDate: futureDate, currentQuantity: 10, status: 'DISPONIVEL' }
    ];

    expect(() => FEFOService.allocate(batches, 15)).toThrow(AppError);
  });

  it('Should allocate across multiple batches', () => {
    const batches: Batch[] = [
      { ...baseBatch, id: 'b1', batchNumber: 'B1', expiryDate: futureDate, currentQuantity: 10, status: 'DISPONIVEL' },
      { ...baseBatch, id: 'b2', batchNumber: 'B2', expiryDate: furtherFutureDate, currentQuantity: 10, status: 'DISPONIVEL' }
    ];

    const allocations = FEFOService.allocate(batches, 15);
    expect(allocations).toHaveLength(2);
    expect(allocations[0].batchId).toBe('b1');
    expect(allocations[0].quantityToPick).toBe(10);
    expect(allocations[1].batchId).toBe('b2');
    expect(allocations[1].quantityToPick).toBe(5);
  });

  it('Should not allocate from ESGOTADO/VENCIDO batches', () => {
    const batches: Batch[] = [
      { ...baseBatch, id: 'b1', batchNumber: 'B1', expiryDate: futureDate, currentQuantity: 10, status: 'ESGOTADO' },
      { ...baseBatch, id: 'b2', batchNumber: 'B2', expiryDate: furtherFutureDate, currentQuantity: 10, status: 'DISPONIVEL' }
    ];

    const allocations = FEFOService.allocate(batches, 5);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].batchId).toBe('b2');
  });
});
