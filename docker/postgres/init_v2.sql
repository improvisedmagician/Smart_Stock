-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Módulo IAM
CREATE TABLE tb_perfil_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT
);

CREATE TABLE tb_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil_id UUID REFERENCES tb_perfil_acesso(id),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Módulo Core (Inventário)
CREATE TABLE tb_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE tb_fornecedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  lead_time_dias INTEGER NOT NULL DEFAULT 7,
  email VARCHAR(255),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES tb_categoria(id),
  unidade_medida VARCHAR(20) NOT NULL DEFAULT 'UN',
  estoque_seguranca INTEGER NOT NULL DEFAULT 0,
  fornecedor_id UUID REFERENCES tb_fornecedor(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_lote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
  numero_lote VARCHAR(100) NOT NULL,
  data_fabricacao DATE NOT NULL,
  data_validade DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'VENCIDO', 'ESGOTADO')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_validade_fabricacao CHECK (data_validade > data_fabricacao),
  CONSTRAINT chk_quantidade_nao_negativa CHECK (quantidade_atual >= 0)
);

CREATE INDEX idx_tb_lote_fefo ON tb_lote (produto_id, data_validade ASC) WHERE status = 'DISPONIVEL';

-- Módulo Compras (Mensageria)
CREATE TABLE tb_ordem_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID NOT NULL REFERENCES tb_fornecedor(id),
  hash_idempotencia VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADA', 'CONFIRMADA', 'ENTREGUE', 'CANCELADA', 'FALHA')),
  acionado_por VARCHAR(50) NOT NULL DEFAULT 'SISTEMA' CHECK (acionado_por IN ('SISTEMA', 'MANUAL')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tb_ordem_compra_hash ON tb_ordem_compra (hash_idempotencia);

CREATE TABLE tb_ordem_compra_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_compra_id UUID NOT NULL REFERENCES tb_ordem_compra(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES tb_produto(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2)
);

-- Seed de Perfil e Admin
INSERT INTO tb_perfil_acesso (nome, descricao) VALUES ('GERENTE', 'Acesso total ao sistema'), ('OPERADOR', 'Acesso operacional');
INSERT INTO tb_usuario (nome, email, senha_hash, perfil_id) 
VALUES ('Administrador', 'admin@smartstock.com', '$2b$10$KECXqE7pxEnHHF1JKDCqq.xpwtrssGV.aAjGXE0GdqZ2rqfcTy.gq', (SELECT id FROM tb_perfil_acesso WHERE nome = 'GERENTE'));

