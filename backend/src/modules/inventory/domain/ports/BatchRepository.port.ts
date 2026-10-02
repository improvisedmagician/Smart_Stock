import { Batch } from '../entities/Batch';

export interface BatchRepositoryPort {
  findById(id: string): Promise<Batch | null>;
  findAll(): Promise<Batch[]>;
  findByProductId(productId: string): Promise<Batch[]>;
  save(batch: Batch): Promise<Batch>;
  saveMany(batches: Batch[]): Promise<void>;
}
