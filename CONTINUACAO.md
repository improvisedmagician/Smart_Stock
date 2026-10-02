# 📋 SMART STOCK WMS — Documento de Continuação

## Status Geral do Projeto

> **Data da auditoria:** 24/09/2026
> **Total de arquivos:** 95
> **Frontend rodando:** ✅ http://localhost:5173
> **Backend rodando:** ❌ Depende de Docker (PostgreSQL, MongoDB, RabbitMQ)

---

## ✅ O QUE JÁ ESTÁ PRONTO

### 🏗️ Infraestrutura (7 arquivos) — COMPLETO ✅
| Arquivo | Status | Observação |
|---|---|---|
| `docker-compose.yml` | ✅ OK | 5 serviços: postgres, mongodb, rabbitmq, backend, frontend |
| `.env` / `.env.example` | ✅ OK | Variáveis tipadas |
| `.gitignore` | ✅ OK | |
| `docker/postgres/init.sql` | ✅ OK | 5 tabelas, constraints, triggers, seed de admin |
| `docker/mongo/mongo-init.js` | ✅ OK | Coleção audit_logs com índices |
| `README.md` | ✅ OK | Documentação em PT-BR com diagrama Mermaid |

### ⚙️ Backend — Estrutura Base (COMPLETO ✅)
| Componente | Status | Arquivos |
|---|---|---|
| `package.json` + `tsconfig.json` | ✅ OK | Dependências corretas |
| `Dockerfile` (multi-stage) | ✅ OK | Build + produção |
| `jest.config.js` | ✅ OK | ts-jest configurado |
| Server bootstrap (`index.ts`) | ✅ OK | Conexões + graceful shutdown |
| Express app (`app.ts`) | ⚠️ Parcial | Faltam rotas de Suppliers e Purchase Orders |
| Env config (`shared/config/env.ts`) | ✅ OK | |
| PostgreSQL connection | ✅ OK | Pool com pg |
| MongoDB connection | ✅ OK | Mongoose |
| RabbitMQ connection | ✅ OK | amqplib com reconexão |

### ⚙️ Backend — Middlewares (COMPLETO ✅)
| Middleware | Status |
|---|---|
| `auth.middleware.ts` (JWT) | ✅ OK |
| `rbac.middleware.ts` (RBAC) | ✅ OK |
| `audit.middleware.ts` (MongoDB) | ✅ OK |
| `errorHandler.ts` | ✅ OK |
| `AppError.ts` | ✅ OK |

### ⚙️ Backend — Módulo IAM (COMPLETO ✅)
| Camada | Arquivo | Status |
|---|---|---|
| Domain | `User.ts`, `UserRepository.port.ts` | ✅ OK |
| Application | `LoginUseCase.ts`, `RegisterUseCase.ts` | ✅ OK |
| Infrastructure | `PostgresUserRepository.ts`, `AuthController.ts`, `auth.routes.ts` | ✅ OK |

### ⚙️ Backend — Módulo Inventário / Produtos + Lotes (COMPLETO ✅)
| Camada | Arquivo | Status |
|---|---|---|
| Domain | `Product.ts`, `Batch.ts`, `PurchaseOrder.ts`, `Supplier.ts` | ✅ OK |
| Domain | `FEFOService.ts` ⭐ | ✅ OK — Lógica FEFO correta |
| Ports | `ProductRepository.port.ts`, `BatchRepository.port.ts` | ✅ OK |
| Use Cases | `CreateProduct`, `UpdateProduct`, `ListProducts`, `GetProduct` | ✅ OK |
| Use Cases | `RegisterBatch`, `ExpeditionUseCase`, `ListBatches` | ✅ OK |
| Adapters | `PostgresProductRepository.ts`, `PostgresBatchRepository.ts` | ✅ OK |
| Controllers | `ProductController.ts`, `BatchController.ts` | ✅ OK |
| Routes | `product.routes.ts`, `batch.routes.ts` | ✅ OK |

### ⚙️ Backend — Módulo Mensageria (PARCIAL ⚠️)
| Camada | Arquivo | Status |
|---|---|---|
| Domain | `MessageBroker.port.ts` | ✅ OK |
| Adapter | `RabbitMQBroker.ts` | ✅ OK |
| Adapter | `CircuitBreaker.ts` | ✅ Código OK, mas **não está conectado** |

### ⚙️ Backend — Módulo Dashboard (PARCIAL ⚠️)
| Camada | Arquivo | Status | Problema |
|---|---|---|---|
| Controller | `DashboardController.ts` | ⚠️ | SQL direto no controller (viola Hexagonal) |
| Routes | `dashboard.routes.ts` | ✅ OK | |
| Use Case | `GetDashboardMetricsUseCase.ts` | ❌ **NÃO EXISTE** | Não foi criado |

### 🧪 Testes (PARCIAL ⚠️)
| Teste | Status |
|---|---|
| `fefo.service.test.ts` (5 casos) | ✅ OK |
| Testes de integração | ❌ Não existem |
| Testes do IAM | ❌ Não existem |

### 🎨 Frontend — Estrutura (COMPLETO ✅)
| Componente | Status |
|---|---|
| Vite + React + TypeScript | ✅ OK |
| Tailwind CSS com cores customizadas | ✅ OK |
| React Router v6 com rotas protegidas | ✅ OK |
| AuthContext (login mock funcional) | ✅ OK |
| ProtectedRoute com RBAC | ✅ OK |
| Layout responsivo (Sidebar + Header) | ✅ OK |
| Componentes UI (Button, Badge) | ✅ OK |
| Dockerfile + nginx.conf | ✅ OK |

### 🎨 Frontend — Páginas (7/7 criadas, melhorias pendentes)
| Página | Status | Observação |
|---|---|---|
| `Login.tsx` | ✅ Funcional | Login mock OK |
| `Dashboard.tsx` | ✅ Funcional | KPIs + 2 gráficos Recharts |
| `Products.tsx` | ⚠️ Básico | Sem modal de criar/editar, sem paginação |
| `Suppliers.tsx` | ⚠️ Básico | Sem modal de criar/editar, sem paginação |
| `Inbound.tsx` | ⚠️ Básico | Formulário OK, sem tabela de entradas recentes |
| `Outbound.tsx` | ✅ Bom | Fluxo 2 etapas FEFO com alerta visual |
| `PurchaseOrders.tsx` | ⚠️ Básico | Sem filtros, sem modal de nova ordem |

---

## ❌ O QUE FALTA IMPLEMENTAR

### 🔴 Prioridade ALTA (Essencial para o projeto funcionar)

#### 1. Backend: Rotas e Controller de Fornecedores
**Problema:** Existem entities, ports, use cases e repository de Suppliers, mas **NÃO existem Controller e Routes**. O `app.ts` não monta `/api/suppliers`.

**Arquivos a criar:**
```
backend/src/modules/inventory/infrastructure/controllers/SupplierController.ts
backend/src/modules/inventory/infrastructure/routes/supplier.routes.ts
```
**Alterar:** `backend/src/app.ts` — adicionar `import supplierRoutes` e `app.use('/api/suppliers', supplierRoutes)`

#### 2. Backend: Módulo de Ordens de Compra completo
**Problema:** Existem entity, port e repository, mas **NÃO existem Use Cases, Controller e Routes**.

**Arquivos a criar:**
```
backend/src/modules/inventory/application/usecases/orders/CreatePurchaseOrderUseCase.ts
backend/src/modules/inventory/application/usecases/orders/ListPurchaseOrdersUseCase.ts
backend/src/modules/inventory/application/usecases/orders/UpdatePurchaseOrderStatusUseCase.ts
backend/src/modules/inventory/infrastructure/controllers/PurchaseOrderController.ts
backend/src/modules/inventory/infrastructure/routes/purchaseOrder.routes.ts
```
**Alterar:** `backend/src/app.ts` — adicionar rota `/api/purchase-orders`

#### 3. Backend: Worker de Monitoramento de Estoque
**Problema:** O blueprint exige que o sistema monitore o estoque de segurança e dispare ordens automáticas via RabbitMQ. **O worker não foi criado**.

**Arquivos a criar:**
```
backend/src/modules/messaging/application/usecases/CheckSafetyStockUseCase.ts
backend/src/modules/messaging/application/usecases/ProcessPurchaseOrderUseCase.ts
backend/src/modules/messaging/infrastructure/workers/stockMonitor.worker.ts
```
**Alterar:** `backend/src/index.ts` — descomentar e ativar import do worker

#### 4. Backend: Integrar Circuit Breaker
**Problema:** O `CircuitBreaker.ts` existe mas **não é usado em lugar nenhum**.

**Ação:** Integrar no `RabbitMQBroker.ts` ou no worker de stock monitor para envolver chamadas a APIs externas de fornecedores.

---

### 🟡 Prioridade MÉDIA (Qualidade e completude)

#### 5. Backend: DashboardController viola Arquitetura Hexagonal
**Problema:** O controller faz queries SQL diretamente com `pgPool.query('SELECT COUNT(*) ...')`. Deveria usar um Use Case + Repository.

**Ações:**
- Criar `GetDashboardMetricsUseCase.ts` na camada de Application
- Criar um `DashboardRepository.port.ts` e seu adapter PostgreSQL
- Mover as queries SQL para o adapter
- O controller deve apenas chamar o use case

#### 6. Backend: Dashboard com métricas incompletas
**Problema:** O endpoint `/api/dashboard/metrics` retorna apenas `totalProducts` e `totalSuppliers`. O blueprint exige:
- Produtos com estoque baixo (abaixo do estoque de segurança)
- Lotes a vencer nos próximos 30 dias
- Ordens de compra pendentes
- Tendência de expedições (últimos 30 dias, do MongoDB)
- Estoque por categoria

#### 7. Frontend: Modais de CRUD não implementados
**Problema:** As páginas de Products e Suppliers mostram a tabela, mas os botões "Novo Produto", "Editar" e "Excluir" **não fazem nada** (sem modais).

**Ações para cada página:**
- Criar componente Modal reutilizável
- Criar formulário de criação/edição dentro do modal
- Implementar lógica de abrir/fechar modal
- Conectar com API calls (ou mock simulando delay)
- Adicionar confirmação de exclusão
- Implementar validação de formulário

#### 8. Frontend: Paginação ausente
**Problema:** Nenhuma tabela tem paginação. Com dados reais, a performance será ruim.

**Ações:**
- Criar componente `Pagination.tsx` reutilizável
- Implementar paginação em Products, Suppliers e PurchaseOrders
- Usar query params `?page=1&limit=20`

#### 9. Frontend: Formulário de Inbound incompleto
**Problema:** Funciona mas falta:
- Tabela de "Entradas recentes" abaixo do formulário
- Reset do formulário após sucesso
- Validação: data de validade deve ser após data de fabricação

#### 10. Frontend: Conectar com a API real
**Problema:** Todas as páginas usam mock data. O `services/api.ts` existe mas as chamadas reais estão todas comentadas ou nunca invocadas.

**Ação:** Em cada página, substituir os mock data por `useEffect` + `api.get(...)` com fallback para mock em caso de erro.

---

### 🟢 Prioridade BAIXA (Melhorias de UX e polimento)

#### 11. Frontend: Componentes UI faltantes
O blueprint previa estes componentes que não foram criados:
```
src/components/ui/Input.tsx        (input estilizado reutilizável)
src/components/ui/Modal.tsx        (modal genérico)
src/components/ui/Table.tsx        (table genérica)
src/components/ui/Card.tsx         (card genérico)
src/components/ui/Pagination.tsx   (paginação)
src/components/ui/Loading.tsx      (spinner)
src/components/ui/EmptyState.tsx   (estado vazio)
```

#### 12. Frontend: Gráficos de charts separados
O blueprint previa componentes de chart separados:
```
src/components/charts/StockLevelChart.tsx
src/components/charts/ExpiringBatchesChart.tsx
src/components/charts/ExpeditionTrendChart.tsx
```
Atualmente os gráficos estão inline no `Dashboard.tsx`.

#### 13. Frontend: Hook genérico `useFetch`
Criar um custom hook para data fetching com loading/error states que pode ser reutilizado em todas as páginas.

#### 14. Dashboard mais rico
- Adicionar 3º gráfico: barras mostrando estoque atual vs estoque de segurança por produto
- Tabela de alertas de estoque baixo na parte inferior
- Indicadores com setas de tendência (↑↓)

#### 15. Testes adicionais
| Tipo | O que testar |
|---|---|
| Unit | `LoginUseCase` — senha inválida, usuário não encontrado |
| Unit | `RegisterUseCase` — email duplicado |
| Unit | `CircuitBreaker` — transição de estados |
| Unit | `ExpeditionUseCase` — integração FEFO + update de lotes |
| Integration | Endpoints de auth (login/register) |
| E2E | Fluxo completo: Login → Criar Produto → Entrada → Expedição |

#### 16. Backend: Tratamento de CNPJ
Adicionar validação de CNPJ no `CreateSupplierUseCase` (dígitos verificadores).

#### 17. Backend: Endpoints de busca e filtro
- `GET /api/products?search=leite&category=Laticínios&page=1&limit=20`
- `GET /api/purchase-orders?status=PENDENTE&dateFrom=2026-09-01`

---

## 🗺️ ROTEIRO DE EXECUÇÃO SUGERIDO

### Ciclo 1 — Completar o Backend (2-3 dias)
```
1. Criar SupplierController + supplier.routes.ts + registrar no app.ts
2. Criar PurchaseOrder UseCases + Controller + Routes
3. Criar CheckSafetyStockUseCase + stockMonitor.worker.ts
4. Integrar CircuitBreaker no worker
5. Refatorar DashboardController para usar UseCase (Hexagonal)
6. Expandir métricas do Dashboard (lotes vencendo, estoque baixo, etc.)
```

### Ciclo 2 — Completar o Frontend (2-3 dias)
```
1. Criar componentes UI faltantes (Modal, Input, Pagination, Loading)
2. Implementar modais de CRUD em Products e Suppliers
3. Adicionar paginação em todas as tabelas
4. Melhorar Inbound (tabela recentes + validação de datas)
5. Adicionar filtros em PurchaseOrders
6. Enriquecer Dashboard com mais gráficos e tabela de alertas
```

### Ciclo 3 — Integração Frontend ↔ Backend (1-2 dias)
```
1. Conectar todas as páginas com chamadas reais à API
2. Substituir mock data por useEffect + api calls
3. Tratar erros de rede e exibir toast notifications
4. Testar fluxo completo com Docker
```

### Ciclo 4 — Testes e Polimento (1-2 dias)
```
1. Escrever testes unitários para IAM e CircuitBreaker
2. Escrever testes de integração para endpoints
3. Validação de CNPJ
4. Review de responsividade em mobile
5. Verificar acessibilidade (labels, aria, contraste)
```

---

## 📊 RESUMO QUANTITATIVO

| Métrica | Valor |
|---|---|
| Arquivos existentes | 95 |
| Arquivos faltando (alta prioridade) | ~12 |
| Arquivos faltando (média prioridade) | ~10 |
| Módulos 100% completos | 2 de 4 (IAM, Inventário parcial) |
| Páginas com CRUD funcional | 0 de 2 (faltam modais) |
| Páginas com dados reais (API) | 0 de 7 (todas usam mock) |
| Cobertura de testes | ~15% (apenas FEFO) |
| Endpoints REST implementados | 8 de ~15 necessários |
| Arquitetura Hexagonal respeitada | ✅ exceto DashboardController |
