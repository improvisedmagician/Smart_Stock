import { Pool } from "pg";
import { BatchRepositoryPort } from "../../domain/ports/BatchRepository.port";
import { Batch } from "../../domain/entities/Batch";

export class PostgresBatchRepository implements BatchRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Batch | null> {
    const res = await this.pool.query("SELECT * FROM Lote WHERE id_lote = $1", [id]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findAll(): Promise<Batch[]> { 
    const res = await this.pool.query("SELECT * FROM Lote"); return res.rows.map(this.map); 
  }
  async findByProductId(productId: string): Promise<Batch[]> {
    const res = await this.pool.query("SELECT * FROM Lote WHERE sku = $1", [productId]);
    return res.rows.map(this.map);
  }
  async save(batch: Batch): Promise<Batch> {
    const res = await this.pool.query(
      "INSERT INTO Lote (id_lote, sku, data_fabricacao, data_validade, quantidade_inicial, quantidade_disponivel, status_fefo) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id_lote) DO UPDATE SET quantidade_disponivel = EXCLUDED.quantidade_disponivel, status_fefo = EXCLUDED.status_fefo RETURNING *",
      [batch.id, batch.productId, batch.manufactureDate, batch.expiryDate, batch.initialQuantity, batch.currentQuantity, batch.status]
    );
    return this.map(res.rows[0]);
  }
  async saveMany(batches: Batch[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const batch of batches) {
        await client.query("UPDATE Lote SET quantidade_disponivel = $1, status_fefo = $2 WHERE id_lote = $3", [batch.currentQuantity, batch.status, batch.id]);
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK"); throw e;
    } finally { client.release(); }
  }
  private map(row: any): Batch {
    return {
      id: row.id_lote, productId: row.sku, batchNumber: row.id_lote, manufactureDate: row.data_fabricacao,
      expiryDate: row.data_validade, initialQuantity: row.quantidade_inicial, currentQuantity: row.quantidade_disponivel,
      status: row.status_fefo, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
