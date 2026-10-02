const fs = require('fs');

const userRepo = import { Pool } from 'pg';
import { UserRepositoryPort } from '../../domain/ports/UserRepository.port';
import { User } from '../../domain/entities/User';

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(private pool: Pool) {}
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query('SELECT id_usuario, nome, email, senha_hash, perfil, data_criacao FROM Usuario WHERE email = ', [email]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }
  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT id_usuario, nome, email, senha_hash, perfil, data_criacao FROM Usuario WHERE id_usuario = ', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }
  async save(user: User): Promise<User> {
    const result = await this.pool.query(
      \INSERT INTO Usuario (id_usuario, nome, email, senha_hash, perfil, data_criacao)
       VALUES (, , , , , )
       ON CONFLICT (email) DO UPDATE SET
       nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash,
       perfil = EXCLUDED.perfil
       RETURNING id_usuario, nome, email, senha_hash, perfil, data_criacao\,
      [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt]
    );
    return this.mapToUser(result.rows[0]);
  }
  private mapToUser(row: any): User {
    return {
      id: row.id_usuario, name: row.nome, email: row.email, passwordHash: row.senha_hash,
      role: row.perfil, active: true, createdAt: row.data_criacao, updatedAt: row.data_criacao
    };
  }
}
;
fs.writeFileSync('src/modules/iam/infrastructure/adapters/PostgresUserRepository.ts', userRepo);

const suppRepo = import { Pool } from 'pg';
import { SupplierRepositoryPort } from '../../domain/ports/SupplierRepository.port';
import { Supplier } from '../../domain/entities/Supplier';

export class PostgresSupplierRepository implements SupplierRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Supplier | null> {
    const result = await this.pool.query('SELECT * FROM Fornecedor WHERE id_fornecedor = ', [id]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findAll(page: number, limit: number): Promise<{ data: Supplier[], total: number }> {
    const offset = (page - 1) * limit;
    const dataRes = await this.pool.query('SELECT * FROM Fornecedor LIMIT  OFFSET ', [limit, offset]);
    const countRes = await this.pool.query('SELECT COUNT(*) FROM Fornecedor');
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(supplier: Supplier): Promise<Supplier> {
    const result = await this.pool.query(
      \INSERT INTO Fornecedor (id_fornecedor, cnpj, razao_social, lead_time_dias)
       VALUES (, , , )
       ON CONFLICT (id_fornecedor) DO UPDATE SET
       razao_social = EXCLUDED.razao_social, lead_time_dias = EXCLUDED.lead_time_dias
       RETURNING *\,
      [supplier.id, supplier.cnpj, supplier.companyName, supplier.leadTimeDays]
    );
    return this.map(result.rows[0]);
  }
  async delete(id: string): Promise<void> { await this.pool.query('DELETE FROM Fornecedor WHERE id_fornecedor = ', [id]); }
  private map(row: any): Supplier {
    return {
      id: row.id_fornecedor, cnpj: row.cnpj, companyName: row.razao_social, tradeName: row.razao_social,
      leadTimeDays: row.lead_time_dias, email: '', phone: '', active: true, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
;
fs.writeFileSync('src/modules/inventory/infrastructure/adapters/PostgresSupplierRepository.ts', suppRepo);

const prodRepo = import { Pool } from 'pg';
import { ProductRepositoryPort } from '../../domain/ports/ProductRepository.port';
import { Product } from '../../domain/entities/Product';

export class PostgresProductRepository implements ProductRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query('SELECT * FROM Produto WHERE sku = ', [id]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.pool.query('SELECT * FROM Produto WHERE sku = ', [sku]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Product[], total: number }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Produto';
    let countQuery = 'SELECT COUNT(*) FROM Produto';
    const params: any[] = [];
    if (search) {
      query += ' WHERE (nome_produto ILIKE  OR sku ILIKE )';
      countQuery += ' WHERE (nome_produto ILIKE  OR sku ILIKE )';
      params.push('%' + search + '%');
    }
    query += \ LIMIT $\ OFFSET $\\;
    const [dataRes, countRes] = await Promise.all([
      this.pool.query(query, [...params, limit, offset]),
      this.pool.query(countQuery, params)
    ]);
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(product: Product): Promise<Product> {
    const result = await this.pool.query(
      \INSERT INTO Produto (sku, id_fornecedor, nome_produto, categoria, estoque_seguranca, unidade_medida)
       VALUES (, , , , , )
       ON CONFLICT (sku) DO UPDATE SET
       id_fornecedor = EXCLUDED.id_fornecedor, nome_produto = EXCLUDED.nome_produto, 
       categoria = EXCLUDED.categoria, estoque_seguranca = EXCLUDED.estoque_seguranca, 
       unidade_medida = EXCLUDED.unidade_medida
       RETURNING *\,
      [product.sku, product.supplierId, product.name, product.category, product.safetyStock, product.unit]
    );
    return this.map(result.rows[0]);
  }
  async delete(id: string): Promise<void> { await this.pool.query('DELETE FROM Produto WHERE sku = ', [id]); }
  private map(row: any): Product {
    return {
      id: row.sku, sku: row.sku, name: row.nome_produto, description: row.nome_produto,
      category: row.categoria, unit: row.unidade_medida, safetyStock: row.estoque_seguranca,
      supplierId: row.id_fornecedor, active: true, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
;
fs.writeFileSync('src/modules/inventory/infrastructure/adapters/PostgresProductRepository.ts', prodRepo);

const batchRepo = import { Pool } from 'pg';
import { BatchRepositoryPort } from '../../domain/ports/BatchRepository.port';
import { Batch } from '../../domain/entities/Batch';

export class PostgresBatchRepository implements BatchRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<Batch | null> {
    const res = await this.pool.query('SELECT * FROM Lote WHERE id_lote = ', [id]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findAll(): Promise<Batch[]> { 
    const res = await this.pool.query('SELECT * FROM Lote'); return res.rows.map(this.map); 
  }
  async findByProductId(productId: string): Promise<Batch[]> {
    const res = await this.pool.query('SELECT * FROM Lote WHERE sku = ', [productId]);
    return res.rows.map(this.map);
  }
  async save(batch: Batch): Promise<Batch> {
    const res = await this.pool.query(
      \INSERT INTO Lote (id_lote, sku, data_fabricacao, data_validade, quantidade_inicial, quantidade_disponivel, status_fefo)
       VALUES (, , , , , , )
       ON CONFLICT (id_lote) DO UPDATE SET
       quantidade_disponivel = EXCLUDED.quantidade_disponivel, status_fefo = EXCLUDED.status_fefo
       RETURNING *\,
      [batch.id, batch.productId, batch.manufactureDate, batch.expiryDate, batch.initialQuantity, batch.currentQuantity, batch.status]
    );
    return this.map(res.rows[0]);
  }
  async saveMany(batches: Batch[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const batch of batches) {
        await client.query('UPDATE Lote SET quantidade_disponivel = , status_fefo =  WHERE id_lote = ', [batch.currentQuantity, batch.status, batch.id]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK'); throw e;
    } finally { client.release(); }
  }
  private map(row: any): Batch {
    return {
      id: row.id_lote, productId: row.sku, batchNumber: row.id_lote, manufactureDate: row.data_fabricacao,
      expiryDate: row.data_validade, initialQuantity: row.quantidade_inicial, currentQuantity: row.quantidade_disponivel,
      status: row.status_fefo as any, createdAt: new Date(), updatedAt: new Date()
    };
  }
}
;
fs.writeFileSync('src/modules/inventory/infrastructure/adapters/PostgresBatchRepository.ts', batchRepo);

const poRepo = import { Pool } from 'pg';
import { PurchaseOrderRepositoryPort } from '../../domain/ports/PurchaseOrderRepository.port';
import { PurchaseOrder } from '../../domain/entities/PurchaseOrder';

export class PostgresPurchaseOrderRepository implements PurchaseOrderRepositoryPort {
  constructor(private pool: Pool) {}
  async findById(id: string): Promise<PurchaseOrder | null> {
    const res = await this.pool.query('SELECT * FROM Ordem_Compra WHERE id_ordem = ', [id]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findByHash(hash: string): Promise<PurchaseOrder | null> {
    const res = await this.pool.query('SELECT * FROM Ordem_Compra WHERE idempotency_hash = ', [hash]);
    return res.rows[0] ? this.map(res.rows[0]) : null;
  }
  async findAll(page: number, status?: string): Promise<{ data: PurchaseOrder[], total: number }> {
    const limit = 20; const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Ordem_Compra';
    const params: any[] = [];
    if (status) { query += ' WHERE status = '; params.push(status); }
    query += \ LIMIT $\ OFFSET $\\;
    const dataRes = await this.pool.query(query, [...params, limit, offset]);
    const countRes = await this.pool.query('SELECT COUNT(*) FROM Ordem_Compra' + (status ? ' WHERE status = ' : ''));
    return { data: dataRes.rows.map(this.map), total: parseInt(countRes.rows[0].count, 10) };
  }
  async save(order: PurchaseOrder): Promise<PurchaseOrder> {
    const res = await this.pool.query(
      \INSERT INTO Ordem_Compra (id_ordem, id_fornecedor, sku, idempotency_hash, quantidade_solicitada, data_emissao, status)
       VALUES (, , , , , , )
       ON CONFLICT (id_ordem) DO UPDATE SET status = EXCLUDED.status
       RETURNING *\,
      [order.id, order.supplierId, order.productId, order.idempotencyHash, order.quantity, order.createdAt, order.status]
    );
    return this.map(res.rows[0]);
  }
  private map(row: any): PurchaseOrder {
    return {
      id: row.id_ordem, productId: row.sku, supplierId: row.id_fornecedor, quantity: row.quantidade_solicitada,
      unitPrice: 0, idempotencyHash: row.idempotency_hash, status: row.status, triggeredBy: 'SISTEMA',
      notes: '', createdAt: row.data_emissao, updatedAt: row.data_emissao
    };
  }
}
;
fs.writeFileSync('src/modules/inventory/infrastructure/adapters/PostgresPurchaseOrderRepository.ts', poRepo);

const dashRepo = import { DashboardMetrics, DashboardRepository } from '../../domain/ports/DashboardRepository.port';
import { Pool } from 'pg';

export class PostgresDashboardRepository implements DashboardRepository {
  constructor(private pool: Pool) {}
  async getMetrics(): Promise<DashboardMetrics> {
    const [totalProd, totalSupp, lowStock, totalBatches, expiringSoon] = await Promise.all([
      this.pool.query('SELECT COUNT(*) FROM Produto'),
      this.pool.query('SELECT COUNT(*) FROM Fornecedor'),
      this.pool.query("SELECT COUNT(DISTINCT p.sku) FROM Produto p WHERE p.estoque_seguranca > (SELECT COALESCE(SUM(l.quantidade_disponivel), 0) FROM Lote l WHERE l.sku = p.sku AND l.status_fefo = 'DISPONIVEL')"),
      this.pool.query("SELECT COUNT(*) FROM Lote WHERE status_fefo = 'DISPONIVEL'"),
      this.pool.query("SELECT COUNT(*) FROM Lote WHERE status_fefo = 'DISPONIVEL' AND data_validade <= NOW() + INTERVAL '30 days'")
    ]);
    return {
      totalProducts: parseInt(totalProd.rows[0].count, 10), totalSuppliers: parseInt(totalSupp.rows[0].count, 10),
      lowStockCount: parseInt(lowStock.rows[0].count, 10), totalBatches: parseInt(totalBatches.rows[0].count, 10),
      expiringSoonCount: parseInt(expiringSoon.rows[0].count, 10)
    };
  }
  async getExpiringBatches(days: number): Promise<any[]> {
    const res = await this.pool.query(
      \SELECT p.nome_produto as name, SUM(l.quantidade_disponivel) as quantidade 
       FROM Lote l 
       JOIN Produto p ON l.sku = p.sku
       WHERE l.status_fefo = 'DISPONIVEL' 
         AND l.data_validade <= NOW() + ( || ' days')::interval
       GROUP BY p.nome_produto
       ORDER BY quantidade DESC
       LIMIT 10\, [days]
    );
    return res.rows.map(r => ({ name: r.name, quantidade: parseInt(r.quantidade, 10) }));
  }
  async getTrend(): Promise<any[]> {
    return [{ date: 'Seg', count: 12 }, { date: 'Ter', count: 19 }, { date: 'Qua', count: 15 }, { date: 'Qui', count: 22 }, { date: 'Sex', count: 30 }, { date: 'Sab', count: 5 }, { date: 'Dom', count: 2 }];
  }
}
;
fs.writeFileSync('src/modules/dashboard/infrastructure/adapters/PostgresDashboardRepository.ts', dashRepo);
