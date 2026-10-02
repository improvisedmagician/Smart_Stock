import cron from 'node-cron';
import { pgPool } from '../../shared/database/postgres';

export function startBatchExpirationJob() {
  // Runs every day at 00:05 (midnight + 5min)
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Iniciando atualização de lotes vencidos...');
    try {
      const result = await pgPool.query(`
        UPDATE Lote
        SET status_fefo = 'VENCIDO'
        WHERE data_validade < NOW()
          AND status_fefo NOT IN ('VENCIDO', 'ESGOTADO')
      `);
      console.log(`[CRON] ${result.rowCount} lote(s) marcado(s) como VENCIDO.`);
    } catch (err) {
      console.error('[CRON] Erro ao atualizar status de lotes:', err);
    }
  });

  console.log('[CRON] Job de expiração de lotes agendado (diário às 00:05).');
}

// Manual trigger (can be called via internal API for testing)
export async function runBatchExpirationNow(): Promise<number> {
  const result = await pgPool.query(`
    UPDATE Lote
    SET status_fefo = 'VENCIDO'
    WHERE data_validade < NOW()
      AND status_fefo NOT IN ('VENCIDO', 'ESGOTADO')
  `);
  return result.rowCount ?? 0;
}
