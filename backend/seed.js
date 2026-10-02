const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" });
async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Create Supplier
    const supp = await client.query("INSERT INTO Fornecedor (cnpj, razao_social, lead_time_dias) VALUES ('11222333000199', 'Fornecedora XYZ', 7) RETURNING id_fornecedor");
    const suppId = supp.rows[0].id_fornecedor;
    
    // Create Product
    await client.query("INSERT INTO Produto (sku, id_fornecedor, nome_produto, categoria, estoque_seguranca, unidade_medida) VALUES ('SKU-TEST-001', $1, 'Produto Teste Novo', 'Vacinas', 10, 'CX')", [suppId]);
    
    // Create Lote
    await client.query("INSERT INTO Lote (sku, data_fabricacao, data_validade, quantidade_inicial, quantidade_disponivel, status_fefo) VALUES ('SKU-TEST-001', '2024-01-01', '2027-01-01', 50, 50, 'DISPONIVEL')");
    
    // Create PO
    await client.query("INSERT INTO Ordem_Compra (id_fornecedor, sku, idempotency_hash, quantidade_solicitada, status) VALUES ($1, 'SKU-TEST-001', 'hash123', 100, 'PENDENTE')", [suppId]);

    await client.query("COMMIT");
    console.log("Mock data inserted successfully!");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}
run();
