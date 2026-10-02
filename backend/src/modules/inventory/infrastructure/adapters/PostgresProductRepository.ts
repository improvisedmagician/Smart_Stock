import { Pool } from "pg";
import { ProductRepositoryPort } from "../../domain/ports/ProductRepository.port";
import { Product } from "../../domain/entities/Product";

export class PostgresProductRepository implements ProductRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query("SELECT * FROM Produto WHERE sku = $1", [id]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.pool.query("SELECT * FROM Produto WHERE sku = $1", [sku]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Product[], total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM Produto";
    let countQuery = "SELECT COUNT(*) FROM Produto";
    const params: any[] = [];
    if (search) {
      query += " WHERE (nome_produto ILIKE $1 OR sku ILIKE $1)";
      countQuery += " WHERE (nome_produto ILIKE $1 OR sku ILIKE $1)";
      params.push("%" + search + "%");
    }
    query += " LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    const [dataRes, countRes] = await Promise.all([
      this.pool.query(query, [...params, limit, offset]),
      this.pool.query(countQuery, params)
    ]);
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(product: Product): Promise<Product> {
    const result = await this.pool.query(
      "INSERT INTO Produto (sku, id_fornecedor, nome_produto, categoria, estoque_seguranca, unidade_medida) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (sku) DO UPDATE SET id_fornecedor = EXCLUDED.id_fornecedor, nome_produto = EXCLUDED.nome_produto, categoria = EXCLUDED.categoria, estoque_seguranca = EXCLUDED.estoque_seguranca, unidade_medida = EXCLUDED.unidade_medida RETURNING *",
      [product.sku, product.supplierId, product.name, product.category, product.safetyStock, product.unit]
    );
    return this.map(result.rows[0]);
  }
  async delete(id: string): Promise<void> {
    try {
      await this.pool.query("DELETE FROM Produto WHERE sku = $1", [id]);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new Error("FOREIGN_KEY_VIOLATION");
      }
      throw error;
    }
  }
  private map(row: any): Product {
    return {
      id: row.sku, sku: row.sku, name: row.nome_produto, description: row.nome_produto,
      category: row.categoria, unit: row.unidade_medida, safetyStock: row.estoque_seguranca,
      supplierId: row.id_fornecedor, active: true, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
