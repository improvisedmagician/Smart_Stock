import { Pool } from "pg";
import { SupplierRepositoryPort } from "../../domain/ports/SupplierRepository.port";
import { Supplier } from "../../domain/entities/Supplier";

export class PostgresSupplierRepository implements SupplierRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Supplier | null> {
    const result = await this.pool.query("SELECT * FROM Fornecedor WHERE id_fornecedor = $1", [id]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findAll(page: number, limit: number): Promise<{ data: Supplier[], total: number }> {
    const offset = (page - 1) * limit;
    const dataRes = await this.pool.query("SELECT * FROM Fornecedor LIMIT $1 OFFSET $2", [limit, offset]);
    const countRes = await this.pool.query("SELECT COUNT(*) FROM Fornecedor");
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(supplier: Supplier): Promise<Supplier> {
    const result = await this.pool.query(
      "INSERT INTO Fornecedor (id_fornecedor, cnpj, razao_social, lead_time_dias) VALUES ($1, $2, $3, $4) ON CONFLICT (id_fornecedor) DO UPDATE SET razao_social = EXCLUDED.razao_social, lead_time_dias = EXCLUDED.lead_time_dias RETURNING *",
      [supplier.id, supplier.cnpj, supplier.companyName, supplier.leadTimeDays]
    );
    return this.map(result.rows[0]);
  }
  async delete(id: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM Fornecedor WHERE id_fornecedor = $1", [id]);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new Error("FOREIGN_KEY_VIOLATION");
      }
      throw error;
    }
  }
  private map(row: any): Supplier {
    return {
      id: row.id_fornecedor, cnpj: row.cnpj, companyName: row.razao_social, tradeName: row.razao_social,
      leadTimeDays: row.lead_time_dias, email: "", phone: "", active: true, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
