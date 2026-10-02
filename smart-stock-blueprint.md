# Smart Stock WMS - Blueprint Técnico (DDE)

## PARTE 1: AS 4 SUBSEÇÕES OBRIGATÓRIAS DO DDE (Atualizadas)

### 1.X GLOSSÁRIO DA LINGUAGEM UBÍQUA
Para garantir a clareza e evitar ambiguidades na comunicação entre as equipes técnicas e de negócio, define-se o seguinte glossário:
- **SKU (Stock Keeping Unit):** Identificador único associado a um produto específico (Entidade Produto). Representa o item conceitual, mas não a sua unidade física no armazém.
- **Lote:** Conjunto físico de itens de um mesmo SKU recebidos em uma data específica. Possui identidade própria (UUID), data de validade e quantidade disponível.
- **FEFO (First-Expired, First-Out):** Regra de negócio mandatória que obriga a expedição dos lotes com data de vencimento mais próxima.
- **Estoque de Segurança:** Quantidade mínima aceitável de um SKU no armazém antes que o sistema dispare automaticamente o alerta de reposição.
- **Lead Time:** Prazo (em dias) que um fornecedor leva para entregar uma mercadoria após a emissão da Ordem de Compra.
- **Perfil de Acesso (RBAC):** Nível de permissão (ex: Operador, Gerente) que define quais ações um usuário pode realizar no sistema, garantindo a governança do Módulo IAM.
- **Auditoria Rígida:** Requisito não funcional que obriga o registro imutável em banco NoSQL de todas as alterações críticas de dados (quem alterou, quando e qual era o valor anterior).

### 1.Y DEFINIÇÃO DE BOUNDED CONTEXTS (CONTEXTOS DELIMITADOS)
Para evitar a construção de um monólito de requisitos, a solução proposta foi dividida em fronteiras lógicas delimitadas, organizando as responsabilidades do sistema corporativo:
- **Contexto de Gestão de Identidade (IAM):** Subdomínio de suporte responsável por autenticação (via JWT local com bcrypt) e gerenciamento de permissões granulares (RBAC).
- **Contexto Core Business (Inventário):** Domínio principal onde residem as regras logísticas complexas. Responsável por categorizar SKUs, gerenciar lotes e aplicar a regra FEFO.
- **Contexto de Mensageria (Ressuprimento):** Subdomínio responsável por monitorar o estoque de segurança e orquestrar a comunicação assíncrona (via Kafka/RabbitMQ) para emissão de Ordens de Compra.
- **Contexto de Inteligência (Dashboard):** Subdomínio de leitura de dados logísticos para apresentação de indicadores e KPIs executivos.

### 1.Z REQUISITOS FUNCIONAIS POR CONTEXTO
As funcionalidades estão agrupadas conforme suas fronteiras arquiteturais:
**Contexto IAM (Gestão de Identidade)**
- **RF01 (Essencial):** Autenticar usuários utilizando token JWT (JSON Web Token) local.
- **RF02 (Essencial):** Validar o perfil de acesso (RBAC) para habilitar ou bloquear operações no sistema.
- **RF03 (Essencial):** Permitir que usuários com perfil de Gerente criem e gerenciem novas contas de acesso para Operadores e outros Gerentes.

**Contexto Core Business (Inventário)**
- **RF04 (Essencial):** Permitir o cadastro (CRUD) de Fornecedores e Produtos (SKUs).
- **RF05 (Essencial):** Registrar a entrada física de Lotes, vinculando-os ao respectivo SKU e validade.
- **RF06 (Essencial):** Realizar a expedição de mercadorias aplicando obrigatoriamente a regra FEFO (Invariante de Domínio).
- **RN01 (Regra de Negócio):** O sistema deve bloquear qualquer tentativa de expedição de um lote cuja data de validade esteja vencida.

**Contexto de Mensageria (Ressuprimento)**
- **RF07 (Essencial):** Avaliar continuamente o saldo dos Lotes frente ao Estoque de Segurança do Produto.
- **RF08 (Essencial):** Disparar eventos em filas assíncronas para criar uma Ordem de Compra e seus respectivos Itens quando o estoque de segurança for violado.

**Transversal (Auditoria)**
- **RF09 (Essencial):** Registrar no banco de dados NoSQL todas as mutações realizadas em Produtos, Lotes e Ordens de Compra (Auditoria Rígida).

### 1.W ESCOPO DE DADOS E AGREGADOS
A estrutura de dados exige transações com propriedades ACID no banco relacional e flexibilidade de documentos no banco NoSQL. Os dados estão agrupados nos seguintes agregados:
- **Agregado de Identidade:** O enum de perfil define os limites de atuação de um operador cadastrado (Tabela `Usuario`).
- **Agregado de Inventário (Core):** A entidade `Produto` atua como Raiz de Agregação (Aggregate Root). Ela possui categoria textual, é fornecida por um `Fornecedor` e é a única responsável por gerenciar as quantidades de seus respectivos registros na tabela `Lote`. A consistência transacional aqui é vital.
- **Agregado de Compras:** Toda negociação corporativa gera um registro unificado (`Ordem_Compra`) com ligação direta ao fornecedor e ao SKU do produto, simplificando a persistência e evitando JOINS complexos de Master-Detail.
- **Agregado de Auditoria (NoSQL):** Os logs de segurança são gravados em estrutura JSON autônoma (`audit_logs`), garantindo que o volume de registros não onere o desempenho do banco relacional principal.

## PARTE 2: ATUALIZAÇÃO DO BLUEPRINT TÉCNICO

### 4. MODELAGEM DE DADOS (ARQUITETURA HÍBRIDA)
**Banco Relacional (PostgreSQL) - "O Estado Atual e Transacional (ACID)"**
- **Módulo IAM:**
  - `Usuario`: Credenciais locais (hash bcrypt) e vínculos de perfil (RBAC em string enum: OPERADOR/GERENTE).
- **Módulo Core (Inventário):**
  - `Fornecedor`: Dados corporativos e cálculo de Lead Time.
  - `Produto` (Aggregate Root): SKU, categoria (string), limites de segurança e unidade de medida.
  - `Lote`: Entidade com ciclo de vida próprio, controlando a validade real (FEFO) - atualizada automaticamente via Cron Job noturno.
- **Módulo de Compras (Mensageria/Eventos):**
  - `Ordem_Compra`: Tabela achatada contendo hash de idempotência, status do pedido, produto, fornecedor e quantidade (Eliminada a separação entre Cabeçalho e Item para otimização de consultas).

**Banco NoSQL (MongoDB) - "A Auditoria Rígida"**
- doc_log_auditoria: Coleção orientada a documentos que absorve logs imutáveis de todos os módulos. Guarda ID do autor, data/hora, operação (INSERT/UPDATE/DELETE), payload anterior e payload atual.
