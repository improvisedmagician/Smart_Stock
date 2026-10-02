async function seed() {
  try {
    const baseURL = 'http://localhost:3001/api';
    
    // 1. Login
    const loginReq = await fetch(baseURL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartstock.com', password: 'admin123' })
    });
    const loginData = await loginReq.json();
    if (!loginReq.ok) throw new Error(JSON.stringify(loginData));
    const token = loginData.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

    // 2. Create Supplier
    const supReq = await fetch(baseURL + '/suppliers', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cnpj: '12.345.678/0001-99',
        companyName: 'Tech Logistics S.A.',
        tradeName: 'TechLog',
        leadTimeDays: 5,
        email: 'contato@techlog.com',
        phone: '11999999999'
      })
    });
    const supData = await supReq.json();
    if (!supReq.ok) throw new Error(JSON.stringify(supData));
    const supplierId = supData.id;
    console.log('Fornecedor criado:', supplierId);

    // 3. Create Products
    const products = [
      { sku: 'SKU-001', name: 'Notebook Pro 15', description: 'Notebook para uso profissional', category: 'Eletrônicos', unit: 'UN', safetyStock: 10, supplierId },
      { sku: 'SKU-002', name: 'Monitor 27 UltraHD', description: 'Monitor 4K', category: 'Eletrônicos', unit: 'UN', safetyStock: 5, supplierId },
      { sku: 'SKU-003', name: 'Cabo HDMI 2m', description: 'Cabo de vídeo de alta definição', category: 'Acessórios', unit: 'CX', safetyStock: 50, supplierId }
    ];

    const createdProducts = [];
    for (const p of products) {
      const pReq = await fetch(baseURL + '/products', { method: 'POST', headers, body: JSON.stringify(p) });
      const pData = await pReq.json();
      if (!pReq.ok) throw new Error(JSON.stringify(pData));
      createdProducts.push(pData);
      console.log('Produto criado:', pData.name);
    }

    // 4. Create Batches
    const batches = [
      { productId: createdProducts[0].id, batchNumber: 'LOTE-NB-01', manufactureDate: '2026-01-01', expiryDate: '2028-01-01', initialQuantity: 50 },
      { productId: createdProducts[1].id, batchNumber: 'LOTE-MN-01', manufactureDate: '2026-05-10', expiryDate: '2030-05-10', initialQuantity: 20 },
      { productId: createdProducts[2].id, batchNumber: 'LOTE-CB-01', manufactureDate: '2025-11-20', expiryDate: '2035-11-20', initialQuantity: 200 },
      { productId: createdProducts[0].id, batchNumber: 'LOTE-NB-02', manufactureDate: '2026-08-01', expiryDate: '2027-12-01', initialQuantity: 30 }
    ];

    for (const b of batches) {
      const bReq = await fetch(baseURL + '/batches/register', { method: 'POST', headers, body: JSON.stringify(b) });
      const bData = await bReq.json();
      if (!bReq.ok) throw new Error(JSON.stringify(bData));
      console.log('Lote registrado:', b.batchNumber);
    }

    console.log('Seed completo com sucesso!');
  } catch (err) {
    console.error('Erro no seed:', err.message);
  }
}
seed();
