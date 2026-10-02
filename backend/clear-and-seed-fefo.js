const { Pool } = require('pg');
const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.secvimcyoqqwpkrcznwi',
  password: '7NPvzALpWy2qFJE2'
});

async function run() {
  try {
    // Clear old data
    await pool.query('DELETE FROM tb_lote');
    await pool.query('DELETE FROM tb_produto');
    await pool.query('DELETE FROM tb_fornecedor');
    await pool.query('DELETE FROM tb_categoria');
    console.log('Old data cleared.');

    const baseURL = 'http://localhost:3001/api';
    
    // Login
    const loginReq = await fetch(baseURL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartstock.com', password: 'admin123' })
    });
    const loginData = await loginReq.json();
    const token = loginData.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

    // 2. Create Supplier
    const supReq = await fetch(baseURL + '/suppliers', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cnpj: '45.123.890/0001-12',
        companyName: 'PharmaLife Distribuidora S.A.',
        tradeName: 'PharmaLife',
        leadTimeDays: 3,
        email: 'vendas@pharmalife.com',
        phone: '1140028922'
      })
    });
    const supData = await supReq.json();
    const supplierId = supData.id;
    console.log('Fornecedor Farma criado');

    // 3. Create Products
    const products = [
      { sku: 'MED-001', name: 'Amoxicilina 500mg', description: 'Antibiótico de amplo espectro', category: 'Medicamentos', unit: 'CX', safetyStock: 100, supplierId },
      { sku: 'MED-002', name: 'Dipirona Sódica 1g', description: 'Analgésico e antipirético', category: 'Medicamentos', unit: 'CX', safetyStock: 200, supplierId },
      { sku: 'VAC-001', name: 'Vacina Antirrábica', description: 'Armazenamento refrigerado obrigatório', category: 'Vacinas', unit: 'AMP', safetyStock: 50, supplierId }
    ];

    const createdProducts = [];
    for (const p of products) {
      const pReq = await fetch(baseURL + '/products', { method: 'POST', headers, body: JSON.stringify(p) });
      const pData = await pReq.json();
      createdProducts.push(pData);
      console.log('Produto Farmacêutico criado:', pData.name);
    }

    // 4. Create Batches
    const batches = [
      { productId: createdProducts[0].id, batchNumber: 'LOTE-AMX-2025', manufactureDate: '2025-01-01', expiryDate: '2025-12-30', initialQuantity: 500 },
      { productId: createdProducts[0].id, batchNumber: 'LOTE-AMX-2024', manufactureDate: '2024-05-10', expiryDate: '2024-11-01', initialQuantity: 150 }, // Vence logo! (FEFO)
      { productId: createdProducts[1].id, batchNumber: 'LOTE-DIP-A', manufactureDate: '2025-02-15', expiryDate: '2027-02-15', initialQuantity: 1000 },
      { productId: createdProducts[2].id, batchNumber: 'LOTE-VAC-XYZ', manufactureDate: '2026-06-01', expiryDate: '2026-08-30', initialQuantity: 80 }
    ];

    for (const b of batches) {
      await fetch(baseURL + '/batches/register', { method: 'POST', headers, body: JSON.stringify(b) });
      console.log('Lote FEFO registrado:', b.batchNumber);
    }
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    pool.end();
  }
}
run();
