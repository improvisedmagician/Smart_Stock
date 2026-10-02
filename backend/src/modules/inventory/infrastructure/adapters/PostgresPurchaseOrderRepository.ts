import { Pool } from "pg";
import { PurchaseOrderRepositoryPort } from "../../domain/ports/PurchaseOrderRepository.port";
import { PurchaseOrder } from "../../domain/entities/PurchaseOrder";

export class PostgresPurchaseOrderRepository implements PurchaseOrderRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<PurchaseOrder | null> {
    const res = await this.pool.query("SELECT * FROM Ordem_Compra WHERE id_ordem = $1", [id]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findByHash(hash: string): Promise<PurchaseOrder | null> {
    const res = await this.pool.query("SELECT * FROM Ordem_Compra WHERE idempotency_hash = $1", [hash]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findAll(page: number, status?: string): Promise<{ data: PurchaseOrder[], total: number }> {
    const limit = 20; const offset = (page - 1) * limit;
    let query = "SELECT * FROM Ordem_Compra";
    const params: any[] = [];
    if (status) { query += " WHERE status = $1"; params.push(status); }
    query += " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    const dataRes = await this.pool.query(query, [...params, limit, offset]);
    const countRes = await this.pool.query("SELECT COUNT(*) FROM Ordem_Compra" + (status ? " WHERE status = $1" : ""));
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(order: PurchaseOrder): Promise<PurchaseOrder> {
    const res = await this.pool.query(
      "INSERT INTO Ordem_Compra (id_ordem, id_fornecedor, sku, idempotency_hash, quantidade_solicitada, data_emissao, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id_ordem) DO UPDATE SET status = EXCLUDED.status RETURNING *",
      [order.id, order.supplierId, order.productId, order.idempotencyHash, order.quantity, order.createdAt, order.status]
    );
    return this.map(res.rows[0]);
  }
  private map(row: any): PurchaseOrder {
    return {
      id: row.id_ordem, productId: row.sku, supplierId: row.id_fornecedor, quantity: row.quantidade_solicitada,
      unitPrice: 0, idempotencyHash: row.idempotency_hash, status: row.status, triggeredBy: "SISTEMA",
      notes: "", createdAt: row.data_emissao, updatedAt: row.data_emissao
    };
  }
}
