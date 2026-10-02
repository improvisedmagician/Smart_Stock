# Smart Stock WMS

Sistema de Gerenciamento de Armazém (Warehouse Management System) focado no controle de estoque com metodologia FEFO e rastreabilidade total.

## Tecnologias Utilizadas

* **Backend:** Node.js 20+
* **Frontend:** Vite + React (ou framework suportado pelo Vite)
* **Banco de Dados Relacional:** PostgreSQL 16 (Dados principais: Usuários, Produtos, Lotes)
* **Banco de Dados NoSQL:** MongoDB 7 (Logs de Auditoria e Rastreabilidade)
* **Mensageria:** RabbitMQ 3 (Eventos do sistema e tarefas em segundo plano)
* **Infraestrutura:** Docker e Docker Compose

## Pré-requisitos

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Node.js](https://nodejs.org/) v20 ou superior (para desenvolvimento local)

## Como Executar

1. Clone o repositório.
2. Certifique-se de que os arquivos `.env` estejam configurados (veja `.env.example`).
3. Execute o Docker Compose:

```bash
docker-compose up --build -d
```

Isso irá subir todos os serviços e executar os scripts de inicialização de banco de dados automaticamente.

## Variáveis de Ambiente

Consulte o arquivo `.env.example` na raiz do projeto para a lista completa.

* **POSTGRES_***: Configurações do PostgreSQL.
* **MONGO_***: Configurações do MongoDB.
* **RABBITMQ_***: Configurações do RabbitMQ.
* **JWT_***: Chave secreta e tempo de expiração dos tokens.
* **App**: Portas e ambientes do backend e frontend.

## Estrutura do Projeto

```
smart-stock/
├── backend/                # Aplicação Node.js (API)
├── frontend/               # Aplicação Vite (UI)
├── docker/                 # Scripts e configurações Docker
│   ├── postgres/           # Script de init (schema)
│   └── mongo/              # Script de init (indexes)
├── docker-compose.yml      # Definição dos containers
└── .env                    # Variáveis de ambiente locais
```

## Resumo dos Endpoints da API (Backend)

*(Estes endpoints são implementados no módulo backend)*

* `POST /api/auth/login` - Autenticação e geração de token JWT
* `GET /api/products` - Listar produtos
* `POST /api/products` - Criar novo produto
* `GET /api/batches` - Listar lotes (FEFO)
* `POST /api/purchase-orders` - Emitir ordens de compra
* `GET /api/audit-logs` - Consultar rastreabilidade (MongoDB)

## Credenciais Padrão (Administrador)

* **Email:** `admin@smartstock.com`
* **Senha:** `admin123`

## Arquitetura do Sistema

```mermaid
graph TD;
    Client[Cliente Web / Frontend] -->|HTTP / REST| API[API Backend (Node.js)];
    API -->|Leitura/Escrita Relacional| PG[(PostgreSQL)];
    API -->|Eventos Assíncronos| MQ[[RabbitMQ]];
    API -->|Logs de Auditoria| MDB[(MongoDB)];
    
    MQ -->|Processa Eventos| Workers[Background Workers];
    Workers -->|Escrita| MDB;
    Workers -->|Escrita/Atualização| PG;
```
