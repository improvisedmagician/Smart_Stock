async function fix() {
  const baseURL = 'http://localhost:3001/api';
  const loginRes = await fetch(baseURL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@smartstock.com', password: 'admin123' })
  });
  const { token } = await loginRes.json();
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  const prodsRes = await fetch(baseURL + '/products', { headers });
  const prods = await prodsRes.json();
  
  for (const p of prods.data) {
    if (p.name.includes('Vacina')) {
      await fetch(baseURL + '/products/' + p.id, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...p, name: 'Vacina Antirrábica' })
      });
      console.log('Fixed vacina');
    }
    if (p.name.includes('dica')) {
      await fetch(baseURL + '/products/' + p.id, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...p, name: 'Dipirona Sódica 1g' })
      });
      console.log('Fixed dipirona');
    }
  }
}
fix();
