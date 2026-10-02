import { pgPool } from '../database/postgres';

interface AuditParams {
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export const logAudit = async (params: AuditParams) => {
  try {
    await pgPool.query(
      `INSERT INTO tb_log_auditoria (usuario_id, usuario_nome, acao, tipo_entidade, entidade_id, valor_antigo, valor_novo, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.userId,
        params.userName,
        params.action,
        params.entityType,
        params.entityId,
        params.oldValue ? JSON.stringify(params.oldValue) : null,
        params.newValue ? JSON.stringify(params.newValue) : null,
        params.ipAddress || null
      ]
    );
  } catch (error) {
    console.error('Failed to log audit event', error);
  }
};
