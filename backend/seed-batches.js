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

    // Get products to link batches
    const pReq = await fetch(baseURL + '/products', { headers });
    const pData = await pReq.json();
    const createdProducts = pData.data;

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
