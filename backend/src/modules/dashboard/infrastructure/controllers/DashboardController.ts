import { Request, Response } from 'express';
import { DashboardRepository } from '../../domain/ports/DashboardRepository.port';

export class DashboardController {
  constructor(private repository: DashboardRepository) {}

  async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.repository.getMetrics();
      res.json(metrics);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  }

  async getExpiring(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await this.repository.getExpiringBatches(days);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch expiring batches' });
    }
  }

  async getTrend(req: Request, res: Response) {
    try {
      const data = await this.repository.getTrend();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch trend' });
    }
  }

  async getLosses(req: Request, res: Response) {
    try {
      const data = await this.repository.getLosses();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch losses data' });
    }
  }

  async runExpirationJob(req: Request, res: Response) {
    try {
      const { runBatchExpirationNow } = await import('../../../../modules/cron/BatchExpirationJob');
      const count = await runBatchExpirationNow();
      res.json({ updated: count, message: count + ' lote(s) marcado(s) como VENCIDO.' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to run expiration job' });
    }
  }
}
