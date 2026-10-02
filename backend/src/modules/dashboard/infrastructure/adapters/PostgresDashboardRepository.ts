import { DashboardMetrics, DashboardRepository } from "../../domain/ports/DashboardRepository.port";
import { Pool } from "pg";

export class PostgresDashboardRepository implements DashboardRepository {
  constructor(private pool: Pool) {}
  async getMetrics(): Promise<DashboardMetrics> {
    const [totalProd, totalSupp, lowStock, totalBatches, expiringSoon] = await Promise.all([
      this.pool.query("SELECT COUNT(*) FROM Produto"),
      this.pool.query("SELECT COUNT(*) FROM Fornecedor"),
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
      "SELECT p.nome_produto as name, SUM(l.quantidade_disponivel) as quantidade FROM Lote l JOIN Produto p ON l.sku = p.sku WHERE l.status_fefo = 'DISPONIVEL' AND l.data_validade <= NOW() + ($1 || ' days')::interval GROUP BY p.nome_produto ORDER BY quantidade DESC LIMIT 10", [days]
    );
    return res.rows.map(r => ({ name: r.name, quantidade: parseInt(r.quantidade, 10) }));
  }
  async getTrend(): Promise<any[]> {
    return [{ date: "Seg", count: 12 }, { date: "Ter", count: 19 }, { date: "Qua", count: 15 }, { date: "Qui", count: 22 }, { date: "Sex", count: 30 }, { date: "Sab", count: 5 }, { date: "Dom", count: 2 }];
  }
  async getLosses(): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT 
        p.nome_produto as produto,
        p.categoria,
        COUNT(l.id_lote) as lotes_perdidos,
        SUM(l.quantidade_disponivel) as unidades_perdidas,
        MAX(l.data_validade) as ultimo_vencimento
      FROM Lote l
      JOIN Produto p ON l.sku = p.sku
      WHERE l.status_fefo = 'VENCIDO'
      GROUP BY p.nome_produto, p.categoria
      ORDER BY unidades_perdidas DESC
      LIMIT 10
    `);
    return res.rows.map(r => ({
      produto: r.produto,
      categoria: r.categoria,
      lotesPerdidos: parseInt(r.lotes_perdidos, 10),
      unidadesPerdidas: parseInt(r.unidades_perdidas, 10),
      ultimoVencimento: r.ultimo_vencimento
    }));
  }
}
