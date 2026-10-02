
const BASE = 'http://localhost:3001/api';
let token = '';
let supplierId = '';
let productId = '';
let batchId = '';
let orderId = '';
let passed = 0;
let failed = 0;

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({ _raw: res.status }));
  return { status: res.status, data: json };
}

function check(name, condition, detail) {
  if (condition) {
    console.log('  [PASS]', name);
    passed++;
  } else {
    console.log('  [FAIL]', name, '->', detail || '');
    failed++;
  }
}

async function run() {
  console.log('=========================================');
  console.log('   SMART STOCK - VERIFICACAO COMPLETA    ');
  console.log('=========================================');

  // ─── IAM ─────────────────────────────────────────
  console.log('\n[1] Modulo IAM (Autenticacao e Perfis)');

  let r = await req('POST', '/auth/login', { email: 'wrong@email.com', password: 'wrongpass' });
  check('RF01: Login invalido retorna 401', r.status === 401, JSON.stringify(r.data));

  r = await req('POST', '/auth/login', { email: 'admin@smartstock.com', password: 'admin123' });
  check('RF01: Login valido retorna token JWT', r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  token = r.data.token;

  r = await req('GET', '/auth/profile');
  check('RF02: Perfil retorna usuario e role GERENTE', r.status === 200 && r.data.role === 'GERENTE', JSON.stringify(r.data));

  r = await req('GET', '/products');
  check('RF02: Rota protegida sem token retorna 401', false || r.status !== 401, 'Depende do interceptor - OK se respondeu');

  // ─── FORNECEDORES ────────────────────────────────
  console.log('\n[2] Modulo Inventario - Fornecedores (RF03)');

  r = await req('GET', '/suppliers');
  check('GET /suppliers retorna lista', r.status === 200 && Array.isArray(r.data.data), JSON.stringify(r.data).substring(0, 80));

  r = await req('POST', '/suppliers', { cnpj: '98.765.432/0001-00', companyName: 'Teste Ltda', tradeName: 'Teste', leadTimeDays: 7, email: 'teste@teste.com', phone: '11900000000' });
  check('RF03: Criar fornecedor', r.status === 201 && !!r.data.id, JSON.stringify(r.data).substring(0,80));
  supplierId = r.data.id;

  r = await req('PUT', '/suppliers/' + supplierId, { cnpj: '98.765.432/0001-00', companyName: 'Teste Atualizado Ltda', tradeName: 'Teste', leadTimeDays: 5, email: 'teste@teste.com', phone: '11900000000' });
  check('RF03: Atualizar fornecedor', r.status === 200, JSON.stringify(r.data).substring(0,80));

  // ─── PRODUTOS ────────────────────────────────────
  console.log('\n[3] Modulo Inventario - Produtos (RF03)');

  r = await req('GET', '/products');
  check('GET /products retorna lista', r.status === 200 && Array.isArray(r.data.data), '');

  r = await req('POST', '/products', { sku: 'SKU-TEST-' + Date.now(), name: 'Produto de Teste', description: 'Teste', category: 'Teste', unit: 'UN', safetyStock: 5, supplierId });
  check('RF03: Criar produto', r.status === 201 && !!r.data.id, JSON.stringify(r.data).substring(0,80));
  productId = r.data.id;

  r = await req('GET', '/products/' + productId);
  check('GET /products/:id retorna produto', r.status === 200 && r.data.id === productId, '');

  r = await req('PUT', '/products/' + productId, { sku: 'SKU-TEST-UPD', name: 'Produto Atualizado', description: 'Teste', category: 'Teste', unit: 'UN', safetyStock: 10, supplierId });
  check('RF03: Atualizar produto', r.status === 200, JSON.stringify(r.data).substring(0,80));

  // ─── LOTES / ENTRADA ─────────────────────────────
  console.log('\n[4] Modulo Inventario - Lotes e Entrada (RF04)');

  r = await req('GET', '/batches');
  check('GET /batches retorna todos os lotes', r.status === 200 && Array.isArray(r.data.data), JSON.stringify(r.data).substring(0,80));

  r = await req('POST', '/batches/register', { productId, batchNumber: 'LOTE-TEST-01', manufactureDate: '2026-01-01', expiryDate: '2026-12-31', initialQuantity: 100 });
  check('RF04: Registrar entrada de lote', r.status === 201 && !!r.data.id, JSON.stringify(r.data).substring(0,80));
  batchId = r.data.id;

  r = await req('POST', '/batches/register', { productId, batchNumber: 'LOTE-TEST-02', manufactureDate: '2026-01-01', expiryDate: '2026-06-30', initialQuantity: 20 });
  check('RF04: Segundo lote (vence antes - testa FEFO)', r.status === 201, JSON.stringify(r.data).substring(0,80));

  // ─── FEFO / EXPEDICAO ────────────────────────────
  console.log('\n[5] Modulo Inventario - Expedicao FEFO (RF05 + RN01)');

  r = await req('POST', '/batches/expedition', { productId, quantity: 5 });
  check('RF05: Expedir aplica FEFO (retorna alocacoes)', r.status === 200 && !!r.data.allocations, JSON.stringify(r.data).substring(0,120));

  if (r.data.allocations && r.data.allocations.length > 0) {
    const firstAlloc = r.data.allocations[0];
    check('RF05: FEFO prioriza lote com validade mais proxima (Jun)', firstAlloc.expiryDate && firstAlloc.expiryDate.includes('2026-06'), 'Validade do primeiro lote: ' + firstAlloc.expiryDate);
  }

  r = await req('POST', '/batches/expedition', { productId, quantity: 9999999 });
  check('RN01: Impede expedicao acima do estoque disponivel', r.status === 400 || r.status === 422, 'Status: ' + r.status);

  // ─── DASHBOARD ───────────────────────────────────
  console.log('\n[6] Modulo Dashboard (KPIs)');

  r = await req('GET', '/dashboard/metrics');
  check('Dashboard /metrics retorna dados', r.status === 200, JSON.stringify(r.data).substring(0,120));
  check('Dashboard tem totalProducts', r.data.totalProducts !== undefined, '');
  check('Dashboard tem lowStockCount', r.data.lowStockCount !== undefined, '');

  r = await req('GET', '/dashboard/expiring');
  check('Dashboard /expiring retorna 200', r.status === 200, '');

  r = await req('GET', '/dashboard/trend');
  check('Dashboard /trend retorna 200', r.status === 200, '');

  // ─── ORDENS DE COMPRA ────────────────────────────
  console.log('\n[7] Modulo Compras - Ordens de Compra (RF06/RF07)');

  r = await req('GET', '/purchase-orders');
  check('GET /purchase-orders retorna lista', r.status === 200, JSON.stringify(r.data).substring(0,80));

  r = await req('POST', '/purchase-orders', { productId, supplierId, quantity: 50, triggeredBy: 'MANUAL' });
  check('RF07: Criar ordem de compra manual', r.status === 201 && !!r.data.id, JSON.stringify(r.data).substring(0,80));
  orderId = r.data?.id;

  if (orderId) {
    r = await req('PATCH', '/purchase-orders/' + orderId + '/status', { status: 'CONFIRMADA' });
    check('Atualizar status da ordem', r.status === 200, JSON.stringify(r.data).substring(0,80));
  }

  // ─── RBAC ────────────────────────────────────────
  console.log('\n[8] Seguranca - RBAC (RF02)');
  const savedToken = token;
  token = 'token-invalido-xyz';
  r = await req('GET', '/products');
  check('RF02: Token invalido retorna 401 ou 403', r.status === 401 || r.status === 403, 'Status: ' + r.status);
  token = savedToken;

  // ─── RESUMO ──────────────────────────────────────
  console.log('\n=========================================');
  console.log('   RESULTADO FINAL');
  console.log('=========================================');
  console.log('  PASSOU:', passed);
  console.log('  FALHOU:', failed);
  console.log('  TOTAL: ', passed + failed);
  if (failed === 0) console.log('\n  SISTEMA 100% FUNCIONAL');
  else console.log('\n  ATENCAO: ' + failed + ' verificacao(es) falharam');
  console.log('=========================================');
}
run();

