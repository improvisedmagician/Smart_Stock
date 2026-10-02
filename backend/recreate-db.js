const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.secvimcyoqqwpkrcznwi:7NPvzALpWy2qFJE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres' });
async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop old tables
    await client.query(\
      DROP TABLE IF EXISTS tb_log_auditoria CASCADE;
      DROP TABLE IF EXISTS tb_ordem_compra_item CASCADE;
      DROP TABLE IF EXISTS tb_ordem_compra CASCADE;
      DROP TABLE IF EXISTS tb_lote CASCADE;
      DROP TABLE IF EXISTS tb_produto CASCADE;
      DROP TABLE IF EXISTS tb_categoria CASCADE;
      DROP TABLE IF EXISTS tb_fornecedor CASCADE;
      DROP TABLE IF EXISTS tb_usuario CASCADE;
      DROP TABLE IF EXISTS tb_perfil_acesso CASCADE;
      
      -- Also drop exact dictionary tables in case of re-run
      DROP TABLE IF EXISTS Ordem_Compra CASCADE;
      DROP TABLE IF EXISTS Lote CASCADE;
      DROP TABLE IF EXISTS Produto CASCADE;
      DROP TABLE IF EXISTS Fornecedor CASCADE;
      DROP TABLE IF EXISTS Usuario CASCADE;
    \);

    // Create Dictionary Tables
    await client.query(\
      CREATE TABLE Usuario (
        id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        perfil VARCHAR(30) NOT NULL DEFAULT 'OPERADOR',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE Fornecedor (
        id_fornecedor UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cnpj VARCHAR(14) NOT NULL UNIQUE,
        razao_social VARCHAR(200) NOT NULL,
        lead_time_dias INT NOT NULL CHECK (lead_time_dias > 0)
      );
      
      CREATE TABLE Produto (
        sku VARCHAR(50) PRIMARY KEY NOT NULL,
        id_fornecedor UUID NOT NULL REFERENCES Fornecedor(id_fornecedor),
        nome_produto VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        estoque_seguranca INT NOT NULL DEFAULT 0 CHECK (estoque_seguranca >= 0),
        unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN'
      );
      
      CREATE TABLE Lote (
        id_lote UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku VARCHAR(50) NOT NULL REFERENCES Produto(sku),
        data_fabricacao DATE NOT NULL,
        data_validade DATE NOT NULL,
        quantidade_inicial INT NOT NULL CHECK (quantidade_inicial > 0),
        quantidade_disponivel INT NOT NULL CHECK (quantidade_disponivel >= 0),
        status_fefo VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL'
      );
      
      CREATE TABLE Ordem_Compra (
        id_ordem UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_fornecedor UUID NOT NULL REFERENCES Fornecedor(id_fornecedor),
        sku VARCHAR(50) NOT NULL REFERENCES Produto(sku),
        idempotency_hash VARCHAR(64) NOT NULL UNIQUE,
        quantidade_solicitada INT NOT NULL CHECK (quantidade_solicitada > 0),
        data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
      );
      
      -- Add back audit table for our custom audit logs
      CREATE TABLE tb_log_auditoria (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id VARCHAR(255),
        usuario_nome VARCHAR(255),
        acao VARCHAR(50),
        tipo_entidade VARCHAR(50),
        entidade_id VARCHAR(255),
        valor_antigo JSONB,
        valor_novo JSONB,
        ip VARCHAR(50),
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    \);
    
    // Seed Admin User
    await client.query(\
      INSERT INTO Usuario (nome, email, senha_hash, perfil) 
      VALUES ('Administrador', 'admin@smartstock.com', '\\\\\\\\\.xpwtrssGV.aAjGXE0GdqZ2rqfcTy.gq', 'GERENTE');
    \);

    await client.query('COMMIT');
    console.log('Database schema fully recreated!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e);
  } finally {
    client.release();
    process.exit(0);
  }
}
run();
